import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { qdrantService, VECTOR_DIMENSION } from './qdrantService';

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  console.log('[Firebase Admin] Already initialized or running in test harness');
}

const db = admin.firestore();
const corsHandler = cors({ origin: true });

/**
 * 1. Serverless Hit Tracker Endpoint (Cloud Resume Challenge Architecture)
 * Atomically increments visitor count in Cloud Firestore using FieldValue.increment(1)
 */
export const trackHit = onRequest({ cors: true }, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  corsHandler(req, res, async () => {
    if (!['GET', 'POST'].includes(req.method)) {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      return;
    }
    try {
      const statsDocRef = db.collection('stats').doc('visitors');

      // Atomic increment in Firestore - prevents race conditions across concurrent hits
      await statsDocRef.set(
        {
          count: admin.firestore.FieldValue.increment(1),
          lastVisitedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Read updated value
      const snapshot = await statsDocRef.get();
      const count = snapshot.data()?.count;
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid visitor count');

      res.status(200).json({
        success: true,
        count: count,
        storage: 'firestore',
      });
    } catch (error: any) {
      console.error('[trackHit] Firestore counter unavailable:', error?.message);
      res.status(503).json({
        success: false,
        error: 'Visitor count temporarily unavailable',
      });
    }
  });
});

/**
 * 2. RAG AI Recruiter Chatbot Endpoint with Qdrant Vector Search
 * Receives recruiter queries, retrieves matching semantic chunks from Qdrant, and generates answers.
 */
export const chat = onRequest({ cors: true }, async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed. Use POST with { question: string }' });
      return;
    }

    const question = req.body?.question?.trim();
    if (!question) {
      res.status(400).json({ error: 'Missing "question" field in request body' });
      return;
    }

    try {
      // 1. Generate query vector embedding (mock vector generator for Qdrant testing)
      const queryVector = generateEmbeddingVector(question);

      // 2. Query Qdrant vector database for top matching resume chunks
      const matches = await qdrantService.searchRelevantChunks(queryVector, 3);

      if (matches.length > 0) {
        const topChunk = matches[0].payload;
        const sources = matches.map((m) => m.payload.title);

        const answer = `Based on Vignesh's verified portfolio data (${topChunk.title}):\n\n${topChunk.content}`;

        res.status(200).json({
          answer,
          sources,
          similarityScore: matches[0].score,
          engine: 'qdrant-rag',
        });
        return;
      }

      // 3. Fallback answer if Qdrant has not yet been seeded or is offline
      const answer = generateResumeAnswer(question);
      res.status(200).json({
        answer,
        sources: ['Tech Lead Resume & Cloud Strategy'],
        engine: 'grounded-knowledge-base',
      });
    } catch (error: any) {
      console.error('[chat] Error handling recruiter question:', error);
      res.status(500).json({
        error: 'Failed to process AI query',
        details: error?.message,
      });
    }
  });
});

/**
 * Generates a normalized deterministic embedding vector of dimension 768.
 * Compatible with Qdrant collection vector size.
 */
function generateEmbeddingVector(text: string): number[] {
  const vector = new Array(VECTOR_DIMENSION).fill(0);
  const normalized = text.toLowerCase();

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (i * 31 + charCode) % VECTOR_DIMENSION;
    vector[index] += Math.sin(charCode);
  }

  // L2 normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((v) => v / norm);
}

/**
 * Grounded rule-based synthesizer used for fast zero-cost evaluation and fallback.
 */
function generateResumeAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('async') || q.includes('rabbitmq') || q.includes('queue') || q.includes('sqs')) {
    return "At alfaTKG (Tech Lead), Vignesh architected a high-throughput queue processing engine using RabbitMQ, AWS SQS, and containerized .NET Worker Services. This decoupled heavy file and thumbnail workloads from API handlers, enabling horizontal scaling and cutting API latency by replacing polling with SignalR/WebSockets.";
  }

  if (q.includes('sql') || q.includes('query') || q.includes('tuning') || q.includes('database')) {
    return "Vignesh has specialized enterprise SQL Server tuning experience. He resolved severe CPU bottlenecks under high concurrency at alfaTKG by analyzing Query Store, execution plans, locking/blocking dynamics, and creating optimized index strategies.";
  }

  if (q.includes('cloud') || q.includes('aws') || q.includes('iac') || q.includes('terraform')) {
    return "Vignesh's cloud expertise includes AWS (EC2, ALB, RDS, WAF, S3) with multi-AZ zero-downtime deployments, and Google Cloud / Firebase (Hosting, Cloud Functions, Firestore). He manages automated CI/CD pipelines via GitLab Runner and GitHub Actions, with Infrastructure as Code via Terraform.";
  }

  if (q.includes('ai') || q.includes('qdrant') || q.includes('rag') || q.includes('mcp')) {
    return "Vignesh is actively spearheading R&D initiatives integrating AI Agents, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG) using Qdrant vector database and LangGraph concepts into enterprise workflows.";
  }

  return "Vignesh Kumar E is a Tech Lead and Solution Architect with 10+ years of experience engineering scalable systems in .NET Core, Angular, Node.js, SQL Server, and AWS. He leads cross-functional teams and is open to international & onsite assignments.";
}
