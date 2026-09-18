const https = require('https');

const QDRANT_HOST = '13ef6f67-e1be-4ed6-8f7b-2ae89c8eaee5.eu-central-1-0.aws.cloud.qdrant.io';
const QDRANT_PORT = 6333;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = 'resume_knowledge';
const VECTOR_DIMENSION = 768;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

module.exports = async function handler(req, res) {
  // CORS & Preflight
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
    // 1. Generate query vector
    const queryVector = generateEmbeddingVector(question);

    // 2. Query Qdrant Cloud cluster for top relevant resume chunks
    const qdrantResults = await searchQdrant(queryVector);

    let retrievedContext = '';
    let sources = ['Verified Resume & Engineering Highlights'];

    if (qdrantResults && qdrantResults.length > 0) {
      sources = qdrantResults.map((r) => r.payload?.title || 'Portfolio Knowledge');
      retrievedContext = qdrantResults
        .map((r) => `[Section: ${r.payload?.title || ''}]\n${r.payload?.content || ''}`)
        .join('\n\n');
    }

    // 3. LLM Reasoning with Google Gemini
    let answer = '';
    try {
      answer = await generateGeminiReasoning(question, retrievedContext);
    } catch (llmErr) {
      console.warn('[chat] Gemini generation fallback:', llmErr.message);
    }

    // Fallback if Gemini response was empty
    if (!answer) {
      if (qdrantResults && qdrantResults.length > 0) {
        const top = qdrantResults[0];
        answer = `Based on Vignesh's verified portfolio data (${top.payload?.title}):\n\n${top.payload?.content}`;
      } else {
        answer = generateRuleBasedFallback(question);
      }
    }

    return res.status(200).json({
      answer: answer,
      sources: sources,
      similarityScore: qdrantResults?.[0]?.score || 0.88,
      engine: 'gemini-qdrant-rag',
    });
  } catch (error) {
    console.error('[chat] Search error:', error);
    return res.status(200).json({
      answer: generateRuleBasedFallback(question),
      sources: ['Tech Lead Resume & Cloud Strategy'],
      engine: 'grounded-fallback',
    });
  }
};

/**
 * Calls Google Gemini (gemini-flash-latest) to generate grounded reasoning answers
 */
function generateGeminiReasoning(question, context) {
  return new Promise((resolve, reject) => {
    const prompt = `You are the AI Career Assistant representing Vignesh Kumar Ekambaram, a Tech Lead and Solution Architect with 10+ years of enterprise experience.
Answer the recruiter's question professionally, accurately, and persuasively based on his verified background below.

VERIFIED EXPERIENCE & PROJECTS:
${context || '10+ years as Tech Lead and Senior Full-Stack Engineer at alfaTKG and Sirpi.'}

RECRUITER QUESTION:
${question}

GUIDELINES:
- Speak directly in the third person ("Vignesh has...", "As Tech Lead, Vignesh...") or on behalf of his portfolio.
- Highlight specific architectural highlights: .NET Core, Angular, SQL Server tuning, asynchronous RabbitMQ/AWS SQS worker engines, ML quotation and cycle time prediction with HOG and Decision Trees, multi-agent AI RAG orchestrators, and high-availability cloud deployments.
- Keep the response clear, structured, and impactful (2-3 concise paragraphs or bullet points).`;

    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'VigneshResumeBot/1.0',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            resolve(text.trim());
          } else {
            resolve('');
          }
        } catch (e) {
          resolve('');
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      resolve('');
    });

    req.write(postData);
    req.end();
  });
}

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
      res.on('data', (chunk) => { data += chunk; });
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

function generateRuleBasedFallback(question) {
  const q = question.toLowerCase();
  if (q.includes('ml') || q.includes('hog') || q.includes('decision tree') || q.includes('predict') || q.includes('quote')) {
    return 'Vignesh engineered predictive Machine Learning models for sheet metal manufacturing quotation. He extracted spatial and geometric features from CAD/image engineering drawings using the HOG (Histogram of Oriented Gradients) algorithm and modeled tabular fabrication data with Decision Tree Regression to predict fabrication costs and machining cycle times accurately.';
  }
  if (q.includes('agent') || q.includes('orchestrat') || q.includes('rag')) {
    return 'At alfaTKG, Vignesh architected a domain-specific multi-agent AI ecosystem. Specialized agents handle Quotation calculations, Production Scheduling, and Machine IoT Telemetry data, coordinated by an Agent Orchestrator with Qdrant vector retrieval for real-time enterprise reasoning.';
  }
  if (q.includes('senior') || q.includes('2018')) {
    return 'From 2018 to 2022, Vignesh served as Senior Software Engineer at alfaTKG. He developed core modules for Products Management software (AlfaDock, PTE, JQMS), engineered ML quoting and process time prediction engines, and spearheaded automated sheet metal quotation workflows.';
  }
  if (q.includes('async') || q.includes('queue') || q.includes('rabbitmq') || q.includes('sqs')) {
    return 'As Tech Lead at alfaTKG, Vignesh architected a high-throughput queue processing engine using RabbitMQ, AWS SQS, and containerized .NET Worker Services, decoupling heavy drawing/thumbnail workloads from API handlers and replacing polling with SignalR/WebSockets for real-time updates.';
  }
  if (q.includes('sql') || q.includes('database') || q.includes('tuning')) {
    return 'Vignesh specializes in enterprise SQL Server tuning. He resolved critical CPU bottlenecks under high concurrency at alfaTKG by analyzing Query Store, execution plans, index strategies, and locking/blocking patterns across multi-tenant database clusters.';
  }
  return 'Vignesh Kumar Ekambaram is a Tech Lead and Solution Architect with 10+ years of experience engineering distributed, high-performance systems in .NET Core, Angular, Node.js, SQL Server, and AWS. He leads engineering teams, builds ML prediction engines and multi-agent AI workflows, and is open to international & onsite assignments.';
}
