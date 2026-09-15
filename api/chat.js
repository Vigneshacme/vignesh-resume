const https = require('https');

const QDRANT_HOST = '13ef6f67-e1be-4ed6-8f7b-2ae89c8eaee5.eu-central-1-0.aws.cloud.qdrant.io';
const QDRANT_PORT = 6333;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = 'resume_knowledge';
const VECTOR_DIMENSION = 768;

module.exports = async function handler(req, res) {
  // Always handle CORS and OPTIONS preflight
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST' });
  }

  // Parse body safely
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }
  const question = (body?.question || '').trim();
  if (!question) {
    return res.status(400).json({ error: 'Missing question parameter' });
  }

  try {
    // 1. Generate deterministic 768-dim query embedding
    const queryVector = generateEmbeddingVector(question);

    // 2. Query Qdrant Cloud via native HTTPS (Zero-dependency)
    const qdrantResults = await searchQdrant(queryVector);

    if (qdrantResults && qdrantResults.length > 0) {
      const top = qdrantResults[0];
      const payload = top.payload || {};
      const sources = qdrantResults.map((r) => r.payload?.title || 'Verified Resume');

      return res.status(200).json({
        answer: `Based on Vignesh's verified experience (${payload.title}):\n\n${payload.content}`,
        sources: sources,
        similarityScore: top.score,
        engine: 'qdrant-cloud-rag',
      });
    }

    return res.status(200).json({
      answer: generateFallbackAnswer(question),
      sources: ['Tech Lead Resume & Cloud Strategy'],
      engine: 'grounded-knowledge-base',
    });
  } catch (error) {
    console.error('[chat] Search error:', error);
    return res.status(200).json({
      answer: generateFallbackAnswer(question),
      sources: ['Tech Lead Resume & Cloud Strategy'],
      engine: 'grounded-knowledge-base',
    });
  }
};

function searchQdrant(vector) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      vector: vector,
      limit: 3,
      with_payload: true,
    });

    const options = {
      hostname: QDRANT_HOST,
      port: QDRANT_PORT,
      path: `/collections/${COLLECTION_NAME}/points/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': QDRANT_API_KEY,
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.result || []);
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });

    req.write(postData);
    req.end();
  });
}

function generateEmbeddingVector(text) {
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

function generateFallbackAnswer(question) {
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
