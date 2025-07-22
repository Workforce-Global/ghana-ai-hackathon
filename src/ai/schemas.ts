/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 * This file centralizes data structures used across both client and server components.
 */

import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

// Schema for the prediction result from the FastAPI model
export const FastAPIPredictionSchema = z.object({
  predicted_class: z.number(),
  label: z.string(),
  confidence: z.number(),
});

// Schema for the full analysis report stored in Firestore
export const FullAnalysisReportSchema = z.object({
  id: z.string().optional(), // Optional since it's added after retrieval
  imageUrl: z.string().describe('Data URI of the uploaded image.'),
  modelUsed: z.string().describe('The ML model that was used.'),
  prediction: FastAPIPredictionSchema,
  geminiReport: z.string().describe('The detailed, natural-language report from Gemini.'),
  timestamp: z.any().describe('Timestamp of the analysis'),
});

export type FullAnalysisReport = z.infer<typeof FullAnalysisReportSchema>;

// A version of the report with a Firestore Timestamp, for use in server-side components.
export interface ReportWithId extends FullAnalysisReport {
    id: string;
    timestamp: Timestamp;
}
