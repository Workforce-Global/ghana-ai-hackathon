"use server";

import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function getDiseaseRecommendationServer(
  diseaseName: string,
  confidence: number
) {
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `You are an agricultural expert. A farmer has detected ${diseaseName} in their crop with ${(
        confidence * 100
      ).toFixed(1)}% confidence. 

Provide:
1. A brief explanation of this disease
2. Immediate action steps the farmer should take
3. Prevention measures for future crops
4. Treatment recommendations if applicable

Keep the response practical, actionable, and farmer-friendly. Format it in clear sections.`,
    });

    return text;
  } catch (err) {
    console.error("Groq error:", err);
    return "Unable to generate recommendations at this time. Please consult with a local agricultural expert.";
  }
}
