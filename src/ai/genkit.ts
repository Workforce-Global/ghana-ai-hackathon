
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { next } from '@genkit-ai/next';
import { firebase, firebaseAuth } from '@genkit-ai/firebase/plugin';

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
