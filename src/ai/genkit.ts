import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { next } from '@genkit-ai/next';
import { firebase } from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
    next({
      // Use the Firebase plugin to handle authentication.
      // The Genkit Next.js plugin will automatically use the Firebase
      // client-side auth state to authenticate requests to flows.
      auth: firebase.auth(),
    }),
  ],
  // Log developer-friendly errors
  dev: {
    logLevel: 'debug',
  },
  // Prevent flow failures from crashing the server
  flow: {
    crashOnFailure: false,
  },
});
