"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { analyzeCropImage, AnalyzeCropImageOutput } from '@/ai/flows/analyze-crop-image';
import { getPersonalizedAdvice } from '@/ai/flows/personalized-agricultural-advice';
import { UploadCloud, Bot, Lightbulb, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';

export function ImageUploader() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCropImageOutput | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch } = useForm<{ image: FileList }>();
  const imageFile = watch('image');

  const handleFileChange = (e: React.ChangeEvent<HTMLHTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setAdvice(null);
      setError(null);
      setValue('image', e.target.files as FileList);
    }
  };

  const onSubmit = handleSubmit((data) => {
    const file = data.image?.[0];
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        setAnalysisResult(null);
        setAdvice(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const photoDataUri = reader.result as string;
          
          try {
            const result = await analyzeCropImage({ photoDataUri });
            setAnalysisResult(result);
            
            toast({
              title: "Analysis Complete",
              description: "Personalized advice is being generated.",
              action: <CheckCircle className="text-green-500" />,
            });

            // For now, regionalTrends is mocked. This could come from an API.
            const regionalTrends = "Increased reports of blight in the last 2 weeks.";
            const adviceResult = await getPersonalizedAdvice({
              cropType: result.cropType,
              disease: result.potentialDiseases.join(', ') || 'none',
              confidenceScore: result.confidenceScore,
              regionalTrends: regionalTrends,
            });
            setAdvice(adviceResult.advice);
          } catch (e: any) {
             setError(e.message || "An unknown error occurred during analysis.");
             toast({
              variant: "destructive",
              title: "Analysis Failed",
              description: e.message || "Could not analyze the image.",
            });
          }
        };
      } catch (e: any) {
        setError(e.message || "An unknown error occurred.");
        toast({
          variant: "destructive",
          title: "Error",
          description: e.message || "An unexpected error occurred.",
        });
      }
    });
  });

  return (
    <Card className="overflow-hidden">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Upload Crop Image</CardTitle>
          <CardDescription>Select an image file from your device for analysis.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          <div className="grid w-full items-center gap-1.5">
            <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                {preview ? (
                  <Image src={preview} alt="Image preview" width={200} height={200} className="rounded-md object-cover max-h-64 w-auto" />
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Click to upload or drag and drop</h3>
                    <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP (max. 10MB)</p>
                  </>
                )}
                 <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    {...register("image")}
                    onChange={handleFileChange}
                 />
            </div>
          </div>
          
          {isPending && (
             <div className="space-y-4">
              <Progress value={50} className="w-full animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isPending && analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Bot className="w-6 h-6" />
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Crop Type</h4>
                    <p className="text-lg font-bold flex items-center gap-2"><Leaf className="text-primary"/> {analysisResult.cropType}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Potential Diseases</h4>
                    {analysisResult.potentialDiseases.length > 0 ? (
                       analysisResult.potentialDiseases.map(d => <Badge key={d} variant="destructive" className="mr-1">{d}</Badge>)
                    ) : (
                       <Badge variant="secondary" className="text-green-700 dark:text-green-400">Healthy</Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Confidence Score</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={analysisResult.confidenceScore * 100} className="w-full" />
                      <span className="font-bold text-lg">{(analysisResult.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  <CardTitle>Personalized Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  {advice ? (
                    <p className="text-muted-foreground italic">{advice}</p>
                  ) : (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || !imageFile || imageFile.length === 0} className="w-full">
            {isPending ? 'Analyzing...' : 'Analyze Crop'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
