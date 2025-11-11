// lib/firebaseAdmin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // In Google Cloud Run, this automatically uses the default service account
    // No need for FSA_KEY at all!
    admin.initializeApp({
      projectId: 'flamess-e6675', // Your Firebase project ID
    });
    console.log("✅ Firebase Admin SDK Initialized with Default Credentials");
  } catch (error: any) {
    console.error("❌ Failed to initialize Firebase Admin:", error);
    throw error;
  }
}

const adminDb = getFirestore();

export { adminDb };