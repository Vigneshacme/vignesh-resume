import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin using environment variables (set in Vercel dashboard)
function initFirebase() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      // Fallback: initialize with project ID only (for local preview)
      initializeApp({ projectId: 'vignesh-cloud-resume-vk' });
    }
  }
  return getFirestore();
}

// In-memory fallback counter when Firestore credentials are not configured
let memCounter = 142;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = initFirebase();
    const statsRef = db.collection('stats').doc('visitors');

    // Atomic increment - race-condition-free across all concurrent visitors
    await statsRef.set(
      {
        count: FieldValue.increment(1),
        lastVisitedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const snapshot = await statsRef.get();
    const count = snapshot.exists ? (snapshot.data()?.count ?? 1) : 1;

    return res.status(200).json({
      success: true,
      count,
      storage: 'firestore',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'unknown error';
    console.warn('[track-hit] Firestore unavailable, using in-memory fallback:', msg);
    memCounter += 1;

    return res.status(200).json({
      success: true,
      count: memCounter,
      storage: 'memory-fallback',
      note: 'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Vercel env vars to persist to Firestore.',
    });
  }
}
