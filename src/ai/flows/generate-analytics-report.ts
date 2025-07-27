
'use server';

/**
 * @fileOverview Generates an AI-powered analytics report based on a user's scan history.
 * 1. Retrieves all scan reports for the authenticated user from Firestore.
 * 2. If reports exist, passes them to a Gemini prompt to generate an HTML report.
 * 3. Returns the HTML report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { FullAnalysisReport, FullAnalysisReportSchema } from '@/ai/schemas';
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


// 1. Define Input and Output Schemas
const AnalyticsReportOutputSchema = z.string().describe("An HTML-formatted report summarizing the user's scan history.");

// 2. Define the Gemini prompt
const analyticsPrompt = ai.definePrompt({
    name: 'analyticsPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: z.array(FullAnalysisReportSchema) },
    output: { schema: AnalyticsReportOutputSchema },
    prompt: `You are an expert agricultural analyst. Your task is to analyze a user's crop scan history and provide a concise, insightful report.
The user has provided the following data, where each entry represents one scan:
{{#each input}}
- Scan Time: {{timestamp}}
- Disease Detected: {{prediction.label}}
- Confidence: {{prediction.confidence}}
- Model Used: {{modelUsed}}
{{/each}}

Based on this data, generate a summary as clean HTML. Use headings (h3, h4), lists (ul, li), and paragraphs (p) to format the response. Do not include '<html>' or '<body>' tags.

The report should include:
- **Overall Health Summary:** A brief, one-paragraph overview of the user's crop health based on the data.
- **Key Trends & Observations:** A bulleted list of the most important findings. This could include the most frequently detected diseases, any changes over time, or performance of different models if used.
- **Recommendations:** A bulleted list of actionable recommendations for the user to improve their crop health or monitoring strategy.
`,
});


// 3. Define the main flow
export const generateAnalyticsReport = ai.defineFlow(
    {
        name: 'generateAnalyticsReportFlow',
        inputSchema: z.void(),
        outputSchema: AnalyticsReportOutputSchema,
        auth: async (auth) => {
            if (!auth) {
                throw new Error('Authentication is required to generate a report.');
            }
            if (!auth.uid) {
                throw new Error('FATAL: UID is missing from auth context after passing guard. This should not happen.');
            }
            await initializeFirebaseAdmin(); // Ensure Firebase Admin is initialized
            return auth;
        },
    },
    async (_, auth) => {
        const uid = auth.uid;
        const app = await initializeFirebaseAdmin();
        const db = getFirestore(app);
        const reportsRef = db.collection('users').doc(uid).collection('reports');
        const querySnapshot = await reportsRef.orderBy('timestamp', 'desc').get();

        if (querySnapshot.empty) {
            return "<p>No scan data available to generate a report. Perform a new scan to get started.</p>";
        }

        const reports: FullAnalysisReport[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to a readable string for the prompt
            const timestamp = (data.timestamp as Timestamp).toDate().toISOString();
            return {
                ...data,
                timestamp: timestamp
            } as FullAnalysisReport;
        });

        const { output } = await analyticsPrompt(reports);
        return output || "<p>Could not generate a report at this time.</p>";
    }
);
