import type { VercelRequest, VercelResponse } from '@vercel/node';
import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'resume_knowledge';
const VECTOR_DIMENSION = 768;

// Initialize Qdrant client from Vercel environment variables
function getQdrantClient(): QdrantClient {
  const url = process.env.QDRANT_URL || 'http://127.0.0.1:6333';
  const apiKey = process.env.QDRANT_API_KEY || undefined;
  return new QdrantClient({ url, apiKey, checkCompatibility: false });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST with { question: string }' });
  }

  const question = (req.body?.question ?? '').trim();
  if (!question) {
    return res.status(400).json({ error: 'Missing "question" field in request body' });
  }

  try {
    // 1. Generate a deterministic embedding vector for the query
    const queryVector = generateEmbeddingVector(question);

    // 2. Search Qdrant for the top matching resume knowledge chunks
    const client = getQdrantClient();
    const results = await client.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: 3,
      with_payload: true,
    });

    if (results.length > 0) {
      const top = results[0];
      const payload = top.payload as { title: string; content: string; category: string; tags: string[] };
      const sources = results.map((r) => (r.payload as { title: string }).title);

      return res.status(200).json({
        answer: `Based on Vignesh's verified portfolio data (${payload.title}):\n\n${payload.content}`,
        sources,
        similarityScore: top.score,
        engine: 'qdrant-rag',
      });
    }

    // 3. Grounded fallback if Qdrant is not yet seeded
    return res.status(200).json({
      answer: generateFallbackAnswer(question),
      sources: ['Resume & Cloud Strategy Document'],
      engine: 'grounded-knowledge-base',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.warn('[chat] Qdrant unavailable, using grounded fallback:', msg);
    return res.status(200).json({
      answer: generateFallbackAnswer(question),
      sources: ['Resume & Cloud Strategy Document'],
      engine: 'grounded-knowledge-base',
      note: 'Set QDRANT_URL and QDRANT_API_KEY in Vercel env vars to enable full vector search.',
    });
  }
}

function generateEmbeddingVector(text: string): number[] {
  const vector = new Array(VECTOR_DIMENSION).fill(0);
  const normalized = text.toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (i * 31 + charCode) % VECTOR_DIMENSION;
    vector[index] += Math.sin(charCode);
  }
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((v) => v / norm);
}

function generateFallbackAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('async') || q.includes('queue') || q.includes('rabbitmq') || q.includes('sqs')) {
    return 'At alfaTKG (Tech Lead), Vignesh architected a high-throughput queue processing engine using RabbitMQ, AWS SQS, and containerized .NET Worker Services. This decoupled heavy file/thumbnail workloads from API handlers, enabling horizontal scaling and replacing polling with SignalR/WebSockets for real-time feedback.';
  }
  if (q.includes('sql') || q.includes('database') || q.includes('tuning') || q.includes('query')) {
    return 'Vignesh has specialized SQL Server tuning expertise: resolving severe CPU bottlenecks under high concurrency at alfaTKG using Query Store analysis, execution plan inspection, locking/blocking identification, and targeted index strategies.';
  }
  if (q.includes('cloud') || q.includes('aws') || q.includes('firebase') || q.includes('infra')) {
    return 'Vignesh\'s cloud expertise spans AWS (EC2, ALB, RDS, WAF, S3) with multi-AZ zero-downtime deployments, Google Firebase (Hosting, Firestore), and automated CI/CD via GitLab Runner and GitHub Actions. Infrastructure as Code via Terraform.';
  }
  if (q.includes('ai') || q.includes('qdrant') || q.includes('rag') || q.includes('mcp') || q.includes('agent')) {
    return 'Vignesh is actively leading R&D initiatives integrating AI Agents, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG) using Qdrant vector database into enterprise automation workflows.';
  }
  if (q.includes('leadership') || q.includes('lead') || q.includes('team') || q.includes('mentor')) {
    return 'As Tech Lead at alfaTKG, Vignesh leads cross-functional engineering teams delivering flagship manufacturing products (JQMS, PTE, AlfaDock). He drives architectural decisions, mentors engineers, sets code quality standards, and manages CI/CD release pipelines.';
  }
  return 'Vignesh Kumar E is a Tech Lead and Solution Architect with 10+ years of enterprise experience engineering distributed, high-performance web systems using .NET Core, Angular, Node.js, SQL Server, and AWS. Open to international & onsite assignments.';
}
