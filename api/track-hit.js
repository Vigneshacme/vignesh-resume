const admin = require('firebase-admin');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    if (!admin.apps.length) {
      // Vercel needs a server-side service account for the existing Firebase project.
      // Firebase/GCP environments can use Application Default Credentials instead.
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      admin.initializeApp(serviceAccount
        ? { credential: admin.credential.cert(JSON.parse(serviceAccount)) }
        : undefined);
    }
    const stats = admin.firestore().collection('stats').doc('visitors');
    await stats.set({
      count: admin.firestore.FieldValue.increment(1),
      lastVisitedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    const snapshot = await stats.get();
    const count = snapshot.data()?.count;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid visitor count');
    return res.status(200).json({ success: true, count, storage: 'firestore' });
  } catch (error) {
    console.error('[trackHit] Firestore counter unavailable:', error.message);
    return res.status(503).json({ success: false, error: 'Visitor count temporarily unavailable' });
  }
};
