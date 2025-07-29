
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
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import type { FlowRunOptions } from '@genkit-ai/core';

type context = {
  raw?: { headers?: Record<string, string> }
};


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
    // auth: (auth) => {
    //   if (!auth) {
    //     throw new Error('Authentication is required.');
    //   }
    //   if (!auth.uid) {
    //     throw new Error('Authentication is required. User UID is missing.');
    //   }
    // },
  },
  async (input, context) => {
    console.log('Starting runFullAnalysisFlow...');
      const idToken = context.raw?.headers?.authorization?.split('Bearer ')[1];
      if (!idToken) {
        throw new Error("Missing Firebase ID token in Authorization header.");
      }
    
      const app = initializeFirebaseAdmin();
      const auth = getAuth(app);
      let decodedToken;
    
      try {
        decodedToken = await auth.verifyIdToken(idToken);
      } catch (error) {
        throw new Error("Invalid Firebase ID token.");
      }
      const uid = decodedToken.uid;
    
    // if (!auth || !auth.uid) {
    //   throw new Error('FATAL: UID is missing from auth context after passing guard. This should not happen.');
    // }
    // const uid = auth.uid;
    // const app = initializeFirebaseAdmin();
   
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
    const db = getFirestore(app);
    const reportRef = db.collection('users').doc(uid).collection('reports').doc(reportId);
    await reportRef.set(finalReport);
    console.log('Report saved successfully to Firestore.');
    
    // Return the report (without the server timestamp object)
    return { ...finalReport, timestamp: new Date().toISOString() } as unknown as FullAnalysisReport;
  }
);
