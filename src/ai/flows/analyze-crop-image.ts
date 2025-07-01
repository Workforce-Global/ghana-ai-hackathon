'use server';

/**
 * @fileOverview Analyzes a crop image to identify the crop type, potential diseases, and a confidence score.
 *
 * - analyzeCropImage - A function that handles the crop image analysis process.
 * - AnalyzeCropImageInput - The input type for the analyzeCropImage function.
 * - AnalyzeCropImageOutput - The return type for the analyzeCropImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCropImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCropImageInput = z.infer<typeof AnalyzeCropImageInputSchema>;

const AnalyzeCropImageOutputSchema = z.object({
  cropType: z.string().describe('The identified type of crop in the image.'),
  potentialDiseases: z
    .array(z.string())
    .describe('A list of potential diseases affecting the crop.'),
  confidenceScore: z
    .number()
    .describe(
      'A confidence score (0-1) indicating the certainty of the analysis.'
    ),
});
export type AnalyzeCropImageOutput = z.infer<typeof AnalyzeCropImageOutputSchema>;

export async function analyzeCropImage(
  input: AnalyzeCropImageInput
): Promise<AnalyzeCropImageOutput> {
  return analyzeCropImageFlow(input);
}

const analyzeCropImagePrompt = ai.definePrompt({
  name: 'analyzeCropImagePrompt',
  input: {schema: AnalyzeCropImageInputSchema},
  output: {schema: AnalyzeCropImageOutputSchema},
  prompt: `You are an expert agricultural AI. Analyze the provided crop image and identify the crop type, potential diseases, and a confidence score.

  Provide the output as a JSON object matching the following schema:
  ${JSON.stringify(AnalyzeCropImageOutputSchema)}

  Here is the crop image:
  {{media url=photoDataUri}}`,
});

const analyzeCropImageFlow = ai.defineFlow(
  {
    name: 'analyzeCropImageFlow',
    inputSchema: AnalyzeCropImageInputSchema,
    outputSchema: AnalyzeCropImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeCropImagePrompt(input);
    return output!;
  }
);
