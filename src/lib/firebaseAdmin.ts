// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Fix memory leak warning
if (typeof process !== 'undefined' && process.setMaxListeners) {
  process.setMaxListeners(20);
}

// Force synchronous initialization
function initializeFirebaseAdmin(): Firestore {
  try {
    // Check if running on Google Cloud Platform
    const isGCP = !!(
      process.env.K_SERVICE ||
      process.env.FUNCTION_NAME ||
      process.env.GAE_SERVICE ||
      process.env.FIREBASE_CONFIG // Also check for Firebase config
    );

    console.log('🔥 Initializing Firebase Admin...');
    console.log('Environment check:', {
      isGCP,
      K_SERVICE: process.env.K_SERVICE,
      FUNCTION_NAME: process.env.FUNCTION_NAME,
      GAE_SERVICE: process.env.GAE_SERVICE,
      FIREBASE_CONFIG: !!process.env.FIREBASE_CONFIG
    });

    // Get existing app or initialize new one
    let app: admin.app.App;
    
    if (admin.apps.length > 0) {
      console.log('ℹ️ Using existing Firebase Admin app');
      app = admin.apps[0]!;
    } else {
      if (isGCP) {
        console.log('🔥 Initializing for GCP environment');
        app = admin.initializeApp({
          projectId: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'flamess-e6675',
        });
        console.log('✅ Initialized with Application Default Credentials');
      } else {
        console.log('🔥 Initializing for local environment');
        
        if (!process.env.FSA_KEY) {
          throw new Error('FSA_KEY not found in environment');
        }
        
        const serviceAccount = JSON.parse(process.env.FSA_KEY);
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        console.log('✅ Initialized with service account');
      }
    }

    const db = getFirestore(app);
    console.log('✅ Firestore instance ready');
    return db;

  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Initialize immediately when module loads
const adminDb = initializeFirebaseAdmin();

export { adminDb };