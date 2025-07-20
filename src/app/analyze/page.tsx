import { AnalyzeImageClient } from '@/components/analyze/analyze-image-client';

export default function AnalyzePage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Crop Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image of a crop to get an AI-powered analysis and personalized advice.
        </p>
      </div>
      <AnalyzeImageClient />
    </div>
  );
}
