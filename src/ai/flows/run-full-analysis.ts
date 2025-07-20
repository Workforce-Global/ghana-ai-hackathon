'use server';

/**
 * @fileOverview Orchestrates the full analysis pipeline:
 * 1. Takes an image and model preference.
 * 2. Uploads the image to Firebase Storage.
 * 3. Calls a FastAPI endpoint for ML model inference.
 * 4. Calls Gemini to generate a detailed report from the model output.
 * 5. Saves the complete report to Firestore.
 * 6. Returns the final report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore,FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { v4 as uuidv4 } from 'uuid';

// Firebase Admin SDK Initialization
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount!),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}


// 1. Define Input and Output Schemas
const FullAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  model: z.enum(['mobilenet', 'efficientnet']).describe('The ML model to use for inference.'),
});

const FastAPIPredictionSchema = z.object({
  predicted_class: z.number(),
  label: z.string(),
  confidence: z.number(),
});

const FullAnalysisReportSchema = z.object({
  imageUrl: z.string().url().describe('Public URL of the uploaded image.'),
  modelUsed: z.string().describe('The ML model that was used.'),
  prediction: FastAPIPredictionSchema,
  geminiReport: z.string().describe('The detailed, natural-language report from Gemini.'),
});

export type FullAnalysisInput = z.infer<typeof FullAnalysisInputSchema>;
export type FullAnalysisReport = z.infer<typeof FullAnalysisReportSchema>;

// 2. Define supporting prompts and tools
const geminiReportPrompt = ai.definePrompt({
  name: 'geminiReportPrompt',
  prompt: `Generate a diagnosis and recommended action plan for this plant disease detection result.
Structure your response as clean HTML. Use headings (h3, h4), lists (ul, li), and paragraphs (p) to format the response. Do not include '<html>' or '<body>' tags.

- Model Used: {{{modelUsed}}}
- Disease Detected: {{{prediction.label}}}
- Confidence Score: {{{prediction.confidence}}}

Based on this, suggest:
- **Disease Name:** (if identifiable, otherwise state "Unknown")
- **Recommended Treatment or Action:** (Provide clear, actionable steps)
- **Severity Level:** (Low/Moderate/Severe)
- **Preventive Tips:** (How to avoid this in the future)
- **Chemical/Pesticide Recommendations:** (Suggest specific products if applicable, otherwise "None recommended at this time")
`,
});

// 3. Define the main flow
export const runFullAnalysis = ai.defineFlow(
  {
    name: 'runFullAnalysisFlow',
    inputSchema: FullAnalysisInputSchema,
    outputSchema: FullAnalysisReportSchema,
    auth: async (input, { a }) => {
       const user = getAuth().verifyIdToken(a!);
       if (!user) {
         throw new Error("Authentication required.");
       }
    },
  },
  async (input, {auth}) => {
    const user = await getAuth().verifyIdToken(auth!);
    const uid = user.uid;
    const reportId = uuidv4();
    const imagePath = `users/${uid}/scans/${reportId}/image.jpg`;

    // Step 1: Upload image to Firebase Storage
    const bucket = getStorage().bucket();
    const mimeType = input.photoDataUri.match(/data:(.*);base64,/)?.[1];
    if (!mimeType) {
        throw new Error("Invalid data URI: MIME type not found.");
    }
    const base64Data = input.photoDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const file = bucket.file(imagePath);
    await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
    });
    const [imageUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });

    // Step 2: Call FastAPI for inference
    const fastApiUrl = 'http://127.0.0.1:8000/predict/'; // Use localhost for local dev
    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer], { type: mimeType }), 'image.jpg');

    const fastApiResponse = await fetch(`${fastApiUrl}?model_name=${input.model}`, {
        method: 'POST',
        body: formData,
    });
    
    if (!fastApiResponse.ok) {
        const errorBody = await fastApiResponse.text();
        throw new Error(`FastAPI request failed: ${fastApiResponse.statusText} - ${errorBody}`);
    }
    const predictionResult = await fastApiResponse.json();
    const predictionData = {
        predicted_class: predictionResult.result.predicted_class,
        label: predictionResult.result.label,
        confidence: predictionResult.result.confidence,
    };
    
    // Step 3: Call Gemini for the detailed report
    const geminiResponse = await geminiReportPrompt({
      modelUsed: input.model,
      prediction: predictionData,
    });
    const geminiReport = geminiResponse.output!;

    // Step 4: Construct the final report
    const finalReport: FullAnalysisReport & { timestamp: FieldValue } = {
        imageUrl,
        modelUsed: input.model,
        prediction: predictionData,
        geminiReport: geminiReport,
        timestamp: FieldValue.serverTimestamp(),
    };

    // Step 5: Save the report to Firestore
    const db = getFirestore();
    const reportRef = db.collection('users').doc(uid).collection('reports').doc(reportId);
    await reportRef.set(finalReport);
    
    // Return the report (without the server timestamp object)
    return { ...finalReport, timestamp: new Date().toISOString() } as unknown as FullAnalysisReport;
  }
);
