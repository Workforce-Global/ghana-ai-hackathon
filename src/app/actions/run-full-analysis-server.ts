'use server';

import { runFullAnalysis } from '@/ai/flows/run-full-analysis';
import { FullAnalysisInput } from '@/ai/flows/run-full-analysis';

export async function runFullAnalysisServer(input: FullAnalysisInput & { token: string }) {
  const { token, ...flowInput } = input;

  return await runFullAnalysis.run(flowInput, {
    // 👇 This is the only way to pass headers to `context.raw`
    raw: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
}
