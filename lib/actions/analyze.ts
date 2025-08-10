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

export async function generateInsightsSummaryServer(scanHistory: any[]) {
  try {
    const diseaseFrequency = scanHistory.reduce((acc, scan) => {
      acc[scan.label] = (acc[scan.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonDiseases = Object.entries(diseaseFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([disease]) => disease);

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Based on crop disease detection history, the most common diseases detected are: ${mostCommonDiseases.join(
        ", "
      )}.

Total scans: ${scanHistory.length}

Provide:
1. Analysis of disease patterns
2. Seasonal recommendations
3. General crop health management tips
4. Early warning signs to watch for

Keep it practical and actionable for farmers.`,
    });

    return text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Unable to generate insights at this time.";
  }
}
