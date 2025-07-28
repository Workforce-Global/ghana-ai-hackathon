
"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { runFullAnalysis } from '@/ai/flows/run-full-analysis';
import type { FullAnalysisReport } from '@/ai/schemas';
import { UploadCloud, Bot, Lightbulb, AlertTriangle, CheckCircle, Leaf, BrainCircuit, Microscope } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useAuth } from '@/context/auth-provider';


const formSchema = z.object({
  image: z.instanceof(FileList).refine((files) => files?.length === 1, 'Image is required.'),
  model: z.enum(['mobilenet', 'efficientnet']),
});

type FormValues = z.infer<typeof formSchema>;

export function ImageUploader() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<FullAnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: 'efficientnet',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && e.target.files) {
      setPreview(URL.createObjectURL(file));
      setAnalysisReport(null);
      setError(null);
      form.setValue('image', e.target.files, { shouldValidate: true, shouldDirty: true });
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    const file = data.image[0];
    if (!file) {
      setError("Please select an image file.");
      return;
    }
    
    if (authLoading || !user) {
      setError("You must be logged in to perform an analysis. Please wait a moment for authentication to complete or log in.");
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to run an analysis.",
      });
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        setAnalysisReport(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const photoDataUri = reader.result as string;
          
          try {
            const result = await runFullAnalysis({
              photoDataUri,
              model: data.model,
            });            
            setAnalysisReport(result);
            
            toast({
              title: "Analysis Complete",
              description: "Report has been generated and saved.",
              action: <CheckCircle className="text-green-500" />,
            });
            
            window.dispatchEvent(new Event('scanCompleted'));

          } catch (e: any) {
             const errorMessage = e.message || "An unknown error occurred during analysis.";
             setError(errorMessage);
             toast({
              variant: "destructive",
              title: "Analysis Failed",
              description: errorMessage,
            });
          }
        };
        reader.onerror = () => {
          setError("Could not read the selected file.");
          toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected image file.",
          });
        };
      } catch (e: any) {
        const errorMessage = e.message || "An unexpected error occurred.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    });
  });

  return (
    <Card className="overflow-hidden">
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Upload & Analyze Crop Image</CardTitle>
            <CardDescription>Select an image and choose a model for analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="grid w-full items-start gap-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
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
                      <FormControl>
                        <Input 
                          id="image-upload" 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <div className="space-y-3">
                    <FormLabel className="text-base">Select Analysis Model</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="mobilenet" className="sr-only" />
                            <BrainCircuit className="mb-3 h-6 w-6" />
                            MobileNet
                            <span className="text-xs text-muted-foreground mt-1">Faster, less accurate</span>
                          </Label>
                        </FormItem>
                        <FormItem>
                          <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="efficientnet" className="sr-only" />
                            <Microscope className="mb-3 h-6 w-6" />
                            EfficientNet
                            <span className="text-xs text-muted-foreground mt-1">Slower, more accurate</span>
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                )}
              />
            </div>
            
            {isPending && (
              <div className="space-y-4">
                <div className='flex items-center gap-2 text-primary'>
                    <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                    <p className="text-muted-foreground">Analyzing image... This may take a moment.</p>
                </div>
                <Progress value={50} className="w-full animate-pulse" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isPending && analysisReport && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot className="w-6 h-6" /> Analysis Report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <Image src={analysisReport.imageUrl} alt="Analyzed crop" width={400} height={400} className="rounded-md object-cover w-full aspect-square" />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Prediction</h4>
                                    <p className="text-lg font-bold flex items-center gap-2">
                                        <Leaf className="text-primary"/> 
                                        {analysisReport.prediction.label}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Confidence Score</h4>
                                    <div className="flex items-center gap-2">
                                    <Progress value={analysisReport.prediction.confidence * 100} className="w-full" />
                                    <span className="font-bold text-lg">{(analysisReport.prediction.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div>
                                     <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> Gemini Report</h4>
                                     <div className="prose prose-sm dark:prose-invert text-muted-foreground bg-muted/50 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: analysisReport.geminiReport }}>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending || authLoading || !user || !form.formState.isDirty} className="w-full">
              {isPending ? 'Analyzing...' : authLoading ? 'Authenticating...' : !user ? 'Login Required' : 'Analyze Crop'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
