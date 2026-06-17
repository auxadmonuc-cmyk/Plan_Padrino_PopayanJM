import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Build-time config via Vite (import.meta.env) with a runtime fallback to
// `window.__FIREBASE_CONFIG__` so deployments without repository secrets
// can still initialize Firebase by injecting the config in `index.html`.
const runtimeConfig = (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) || {};

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || runtimeConfig.apiKey || '',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || runtimeConfig.authDomain || '',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || runtimeConfig.projectId || '',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || runtimeConfig.storageBucket || '',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || runtimeConfig.messagingSenderId || '',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || runtimeConfig.appId || '',
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || runtimeConfig.measurementId || ''
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}


// Firebase is initialized. Standard firestore offline capabilities are enabled by default.

