// src/ai/flows/personalized-agricultural-advice.ts
'use server';

/**
 * @fileOverview Provides personalized agricultural advice based on AI analysis and regional trends.
 *
 * - getPersonalizedAdvice - A function that generates personalized agricultural advice.
 * - PersonalizedAdviceInput - The input type for the getPersonalizedAdvice function.
 * - PersonalizedAdviceOutput - The return type for the getPersonalizedAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAdviceInputSchema = z.object({
  cropType: z.string().describe('The type of crop.'),
  disease: z.string().describe('The disease detected in the crop.'),
  confidenceScore: z.number().describe('The confidence score of the AI analysis (0-1).'),
  regionalTrends: z.string().describe('Summary of recent regional agricultural trends.'),
});
export type PersonalizedAdviceInput = z.infer<typeof PersonalizedAdviceInputSchema>;

const PersonalizedAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized agricultural advice for the farmer.'),
  recommendedActions: z.array(z.string()).describe('A list of concrete, actionable steps the farmer should take.'),
});
export type PersonalizedAdviceOutput = z.infer<typeof PersonalizedAdviceOutputSchema>;

export async function getPersonalizedAdvice(input: PersonalizedAdviceInput): Promise<PersonalizedAdviceOutput> {
  return personalizedAdviceFlow(input);
}

const personalizedAdvicePrompt = ai.definePrompt({
  name: 'personalizedAdvicePrompt',
  input: {schema: PersonalizedAdviceInputSchema},
  output: {schema: PersonalizedAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor providing personalized advice to farmers.

  Based on the AI analysis of the crop image and recent regional agricultural trends, provide specific and actionable advice to the farmer.

  Crop Type: {{{cropType}}}
  Disease Detected: {{{disease}}}
  Confidence Score: {{{confidenceScore}}}
  Regional Trends: {{{regionalTrends}}}

  Consider all these facts when constructing your response. The advice should be clear, concise, and easy to understand.  It should also be personalized to the specific situation described. The AI model has a confidence score, so mention the confidence score in the advice. Do not make up any facts that are not present in the input. The confidence score ranges from 0 to 1.
  If the confidence score is low, be sure to mention that the diagnosis is uncertain.
  
  In addition to the summary advice, provide a list of 2-3 specific, actionable steps as 'recommendedActions'. For example: "Apply a copper-based fungicide weekly" or "Improve air circulation by pruning lower branches".

  Make sure to follow all instructions. The generated advice should be no more than 3 sentences.
  Give the farmer the most important piece of advice that you can.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const personalizedAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedAdviceFlow',
    inputSchema: PersonalizedAdviceInputSchema,
    outputSchema: PersonalizedAdviceOutputSchema,
  },
  async input => {
    const {output} = await personalizedAdvicePrompt(input);
    return output!;
  }
);
