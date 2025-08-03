"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { ImageUpload } from "@/components/image-upload";
import { predictDisease } from "@/lib/api";
import { getDiseaseRecommendationServer } from "@/lib/actions/analyze";
import { saveScanResult } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Cpu,
  Target,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  label: string;
  confidence: number;
  modelUsed: string;
  recommendations: string;
}

export default function AnalyzePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setResult(null);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !user) return;

    setAnalyzing(true);
    try {
      // Get disease prediction
      const prediction = await predictDisease(selectedImage);

      // Generate AI recommendations
      const recommendations = await getDiseaseRecommendationServer(
        prediction.result.label,
        prediction.result.confidence
      );

      const analysisResult = {
        label: prediction.result.label,
        confidence: prediction.result.confidence,
        modelUsed: prediction.model_used,
        recommendations,
      };

      setResult(analysisResult);

      // Save to Firestore with dynamic import
      const { Timestamp } = await import("firebase/firestore");
      await saveScanResult({
        userId: user.uid,
        label: analysisResult.label,
        confidence: analysisResult.confidence,
        modelUsed: analysisResult.modelUsed,
        recommendations: analysisResult.recommendations,
        timestamp: Timestamp.now(),
      });

      toast({
        title: "Analysis complete!",
        description: "Your crop image has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again or check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-500";
    if (confidence > 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence > 0.8) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analyze Crop</h1>
            <p className="text-muted-foreground">
              Upload an image of your crop to detect diseases and get AI-powered
              recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                  <CardDescription>
                    Select a clear image of your crop showing any potential
                    disease symptoms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    selectedImage={selectedImage}
                    onRemoveImage={handleRemoveImage}
                    disabled={analyzing}
                  />

                  {selectedImage && (
                    <div className="mt-6">
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full"
                        size="lg"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Image"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      Use good lighting and avoid shadows
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      Focus on affected areas of the plant
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      Ensure the image is clear and not blurry
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      Include leaves, stems, or fruits as needed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Detection Results
                        <Badge
                          className={`${getConfidenceColor(
                            result.confidence
                          )} text-white`}
                        >
                          {getConfidenceIcon(result.confidence)}
                          <span className="ml-1">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">
                          {result.label}
                        </h3>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Confidence:
                          </span>
                          <span className="font-medium">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium">
                            {result.modelUsed}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Analyzed:
                          </span>
                          <span className="font-medium">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {result.confidence < 0.7 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Low confidence detection. Consider uploading a
                            clearer image or consulting with an expert.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Recommendations</CardTitle>
                      <CardDescription>
                        Expert advice generated specifically for your detected
                        condition.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {result.recommendations}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Ready to Analyze
                      </h3>
                      <p className="text-muted-foreground">
                        Upload an image to get started with disease detection.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
