/**
 * @fileOverview Initializes and exports a memoized Firebase Admin SDK instance.
 * This ensures the SDK is initialized only once across the application, preventing
 * re-initialization errors in serverless environments.
 */

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { memoize } from 'lodash';

// Memoized function to prevent re-initialization on every call
export const initializeFirebaseAdmin = memoize((): App => {
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
