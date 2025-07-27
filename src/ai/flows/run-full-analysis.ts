
'use server';

/**
 * @fileOverview Orchestrates the full analysis pipeline:
 * 1. Takes an image and model preference.
 * 2. Calls a FastAPI endpoint for ML model inference.
 * 3. Calls Gemini to generate a detailed report from the model output.
 * 4. Saves the complete report (with the image as a data URI) to Firestore.
 * 5. Returns the final report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FullAnalysisReportSchema, type FullAnalysisReport } from '@/ai/schemas';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { memoize } from 'lodash';

// Memoized function to prevent re-initialization on every call
const initializeFirebaseAdmin = memoize(async (): Promise<App> => {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  
  if (!process.env.NEXT_PUBLIC_FIREBASE_ADMIN_BASE64) {
    console.error('Firebase Admin SDK service account key is missing in environment variables.');
    throw new Error('Firebase Admin SDK not configured. Service account key is missing.');
  }

  const serviceAccount = JSON.parse(
    Buffer.from(
      process.env.NEXT_PUBLIC_FIREBASE_ADMIN_BASE64,
      'base64'
    ).toString('ascii')
  );

  console.log("Initializing Firebase Admin SDK...");
  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  console.log("Firebase Admin SDK initialized.");
  return app;
});


// 1. Define Input Schema
const FullAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  model: z.enum(['mobilenet', 'efficientnet']).describe('The ML model to use for inference.'),
});

export type FullAnalysisInput = z.infer<typeof FullAnalysisInputSchema>;

// 2. Define supporting prompts and tools
const geminiReportPrompt = ai.definePrompt({
  name: 'geminiReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
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
    auth: async (auth) => {
      if (!auth) {
        throw new Error('Authentication is required to perform this action.');
      }
      if (!auth.uid) {
         throw new Error('FATAL: UID is missing from auth context after passing guard. This should not happen.');
      }
      await initializeFirebaseAdmin(); // Ensure Firebase Admin is initialized
      return auth;
    },
  },
  async (input, auth) => {
    console.log('Starting runFullAnalysisFlow...');
    const uid = auth.uid;
   
    const reportId = uuidv4();

    const mimeType = input.photoDataUri.match(/data:(.*);base64,/)?.[1];
    if (!mimeType) {
        throw new Error("Invalid data URI: MIME type not found.");
    }
    const base64Data = input.photoDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Step 1: Call FastAPI for inference
    console.log(`Calling FastAPI endpoint for model: ${input.model}`);
    const fastApiUrl = 'https://agrosaviour-backend-947103695812.europe-west1.run.app/predict/';
    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer], { type: mimeType }), 'image.jpg');

    const fastApiResponse = await fetch(`${fastApiUrl}?model_name=${input.model}`, {
        method: 'POST',
        body: formData,
    });
    
    if (!fastApiResponse.ok) {
        const errorBody = await fastApiResponse.text();
        console.error(`FastAPI request failed: ${fastApiResponse.status} - ${errorBody}`);
        throw new Error(`FastAPI request failed: ${fastApiResponse.statusText} - ${errorBody}`);
    }
    console.log('FastAPI request successful.');
    const predictionResult = await fastApiResponse.json();
    const predictionData = {
        predicted_class: predictionResult.result.predicted_class,
        label: predictionResult.result.label,
        confidence: predictionResult.result.confidence,
    };
    console.log('Prediction data received:', predictionData);

    // Step 2: Call Gemini for the detailed report
    console.log('Calling Gemini to generate report...');
    const geminiResponse = await geminiReportPrompt({
      modelUsed: input.model,
      prediction: predictionData,
    });
    const geminiReport = geminiResponse.output!;
    console.log('Gemini report generated.');

    // Step 3: Construct the final report
    const finalReport = {
        imageUrl: input.photoDataUri, // Use the data URI directly
        modelUsed: input.model,
        prediction: predictionData,
        geminiReport: geminiReport,
        timestamp: FieldValue.serverTimestamp(),
    };

    // Step 4: Save the report to Firestore
    console.log(`Saving report to Firestore for user ${uid}...`);
    const app = await initializeFirebaseAdmin();
    const db = getFirestore(app);
    const reportRef = db.collection('users').doc(uid).collection('reports').doc(reportId);
    await reportRef.set(finalReport);
    console.log('Report saved successfully to Firestore.');
    
    // Return the report (without the server timestamp object)
    return { ...finalReport, timestamp: new Date().toISOString() } as unknown as FullAnalysisReport;
  }
);
