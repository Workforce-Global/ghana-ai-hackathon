
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { next } from '@genkit-ai/next';
import { firebase } from '@genkit-ai/firebase/plugin';
import { firebaseAuth } from '@genkit-ai/firebase/auth';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
    next({
      auth: firebaseAuth(),
    }),
  ],
  dev: {
    logLevel: 'debug',
  },
  flow: {
    crashOnFailure: false,
  },
});
