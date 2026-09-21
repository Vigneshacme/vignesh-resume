/**
 * Qdrant Vector Seeding Script for Vignesh Kumar Ekambaram's Resume Knowledge Base
 * Uses Google Gemini (gemini-embedding-001) Neural Network Embeddings
 */
import { QdrantClient } from '@qdrant/js-client-rest';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as https from 'https';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const COLLECTION_NAME = 'resume_knowledge';
const VECTOR_DIMENSION = 768;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface ResumeKnowledgeChunk {
  id: number;
  title: string;
  category: 'summary' | 'skills' | 'experience' | 'projects' | 'architecture';
  tags: string[];
  content: string;
}

const KNOWLEDGE_BASE: ResumeKnowledgeChunk[] = [
  {
    id: 1,
    title: 'Professional Summary & Profile',
    category: 'summary',
    tags: ['Tech Lead', 'Architect', 'Full-Stack', 'Leadership', 'Client Delivery', 'AI Agents', 'MCP', 'RAG'],
    content: `Vignesh Kumar Ekambaram is a Tech Lead and Full-Stack Architect with 12+ years of enterprise experience engineering distributed, high-performance systems using .NET Core, Angular, Node.js, SQL Server, and AWS. He leads a five-member engineering team, manages project priorities and client requests, and coordinates delivery directly with stakeholders. His client-facing work includes multiple on-site visits to Thailand and a client visit to Japan for delivery support. He combines hands-on architecture, CI/CD, cloud engineering, machine-learning prediction systems, and multi-agent AI/RAG experimentation.`,
  },
  {
    id: 2,
    title: 'Technical Skills & Architecture Matrix',
    category: 'skills',
    tags: ['C#', 'TypeScript', '.NET Core', 'Angular', 'AWS', 'SQL Server', 'RabbitMQ', 'Redis', 'Playwright', 'YOLO'],
    content: `Core Technical Skills:
- Languages & Web: C#, TypeScript, JavaScript, SQL, HTML5, CSS3, JSON
- Backend Frameworks: ASP.NET Core, Web API, EF Core, Node.js, Express.js, WCF, YARP API Gateway
- Frontend Frameworks: Angular, React Native, PWA, RxJS
- Cloud & DevOps: AWS EC2, S3, ELB/ALB, CloudSearch, RDS for SQL Server and MySQL, WAF, Docker, GitLab CI/CD, GitLab Runner, IIS, Linux/Ubuntu, PM2, Firebase, Vercel
- Databases & Tuning: SQL Server, MySQL, Oracle, Query Store, Execution Plans, Indexing, Concurrency, Locking
- Messaging & Distributed: RabbitMQ, AWS SQS, Redis, SignalR, WebSockets, Async Processing, DLQ
- AI & Automation: AI Agents, Multi-Agent Orchestrator, Model Context Protocol (MCP), RAG Architecture, Qdrant Vector DB, HOG Feature Extraction, DecisionTreeRegressor, YOLO-based visual detection, Playwright MCP automation`,
  },
  {
    id: 3,
    title: 'Tech Lead Experience at alfaTKG (2022 - Present)',
    category: 'experience',
    tags: ['alfaTKG', 'Tech Lead', 'Team Leadership', 'Client Delivery', 'Thailand', 'Japan', 'RabbitMQ', 'SQS', 'Query Store'],
    content: `At alfaTKG as Tech Lead (2022 – Present):
- Architectural & Technical Leadership: Lead cross-functional engineering teams in delivering flagship manufacturing products (JQMS, PTE, AlfaDock) utilizing .NET, Angular, Node.js, and SQL Server.
- Delivery & Client Partnership: Lead a five-member engineering team, manage client requests and project priorities, coordinate delivery, and provide on-site client support in Thailand and Japan.
- AI Agents & Multi-Agent RAG Orchestration: Architected a domain-driven multi-agent ecosystem where specialized agents handle Quotation, Production Scheduling, and Machine IoT Data, coordinated via a central Agent Orchestrator and vector search.
- Scalable Async Infrastructure: Designed a queue-based processing engine using RabbitMQ, AWS SQS, and containerized .NET Worker Services to decouple heavy drawing/thumbnail workloads from API handlers, enabling independent horizontal scaling.
- Database & Query Tuning: Optimized enterprise SQL Server instances by analyzing Query Store, execution plans, locking/blocking, and index strategies to resolve severe CPU bottlenecks under high concurrency.
- Cloud & CI/CD Engineering: Architected AWS deployments using EC2, S3, ELB/ALB, CloudSearch, RDS for SQL Server and MySQL, and WAF with automated GitLab CI/CD pipelines driving multi-tenant IIS deployments.
- API & System Security: Implemented YARP API Gateway patterns, JWT authentication, distributed caching via Redis, and rate-limiting to protect mission-critical endpoints.`,
  },
  {
    id: 4,
    title: 'Senior Software Engineer at alfaTKG (2018 - 2022)',
    category: 'experience',
    tags: ['alfaTKG', 'Senior Software Engineer', 'Machine Learning', 'HOG', 'YOLO', 'DecisionTreeRegressor', 'Quotation', 'Sheet Metal'],
    content: `At alfaTKG as Senior Software Engineer (2018 – 2022):
- Machine Learning for Quote & Cycle Time Prediction: Engineered predictive ML pipelines for sheet metal manufacturing. Extracted visual and spatial features from CAD data using HOG and YOLO-based visual detection, then applied regression approaches including DecisionTreeRegressor to predict quotation pricing and machine process times.
- Sheet Metal Manufacturing Quotation System: Designed modular quotation calculation engines translating complex fabrication steps (laser cutting, punching, bending, welding) into automated cost estimations and bill of materials (BOM).
- Products Management Software Architecture: Engineered foundational core modules for AlfaDock and PTE product management platforms, enabling real-time manufacturing tracking and high-throughput transaction management.
- Mentorship & Code Quality: Mentored junior engineers, established unit testing and design pattern standards across ASP.NET Core and Angular codebases.`,
  },
  {
    id: 5,
    title: 'Project: ML Process Time & Quotation Price Prediction Engine',
    category: 'projects',
    tags: ['Machine Learning', 'HOG', 'YOLO', 'Computer Vision', 'DecisionTreeRegressor', 'Quotation', 'Process Time'],
    content: `Machine Learning Project for Sheet Metal Manufacturing Quotation:
- Goal: Predict accurate quotation prices and machine processing times for custom sheet metal parts based on engineering CAD drawings.
- Feature Extraction: Implemented computer vision pipelines using HOG and YOLO-based visual detection to extract contour, geometric edge, and spatial complexity features from part drawing images.
- Regression Modeling: Combined CAD features with tabular manufacturing attributes (material type, thickness, perimeter, cut length) into regression models including DecisionTreeRegressor to forecast machine cycle times and fabrication costs.
- Business Impact: Reduced quotation preparation time from hours to seconds with high prediction accuracy.`,
  },
  {
    id: 6,
    title: 'Project: Domain AI Agents & Multi-Agent Orchestrator',
    category: 'projects',
    tags: ['AI Agents', 'Agent Orchestrator', 'RAG', 'Qdrant', 'Quotation Agent', 'Scheduler Agent', 'Machine Data Agent'],
    content: `Domain AI Agents & Agent Orchestrator Architecture:
- Domain AI Agents: Engineered dedicated intelligent agents for distinct enterprise workflows:
  1. Quotation Agent: Analyzes part specifications, materials, and cost matrices.
  2. Production Scheduler Agent: Balances machine capacity, operator shifts, and delivery deadlines.
  3. Machine Data & Telemetry Agent: Monitors IoT sensor signals, cycle counts, and machine state.
- Agent Orchestration: Central Orchestrator routes incoming user intents to the appropriate specialized agents, aggregates their outputs, and performs Retrieval-Augmented Generation (RAG) using Qdrant vector database.`,
  },
  {
    id: 7,
    title: 'Project: Products Management Software & Sheet Metal Quotation',
    category: 'projects',
    tags: ['Sheet Metal', 'Products Management', 'AlfaDock', 'JQMS', 'PTE', 'Manufacturing'],
    content: `Manufacturing Products Management Software & Sheet Metal Quotation Suite:
- Sheet Metal Quotation Engine: Automated quoting workflow processing multi-part CAD files, nesting calculations, laser cutting paths, and bending sequences.
- Products Management Suite (JQMS, PTE, AlfaDock): Enterprise systems managing drawing revisions, shop-floor dispatch, quality assurance inspection, and master inventory across multi-tenant environments.`,
  },
  {
    id: 8,
    title: 'Software Development Engineer at alfaTKG (2015 - 2018)',
    category: 'experience',
    tags: ['alfaTKG', 'SDE', '.NET Core', 'SQL Server', 'RESTful API'],
    content: `At alfaTKG as Software Development Engineer (2015 – 2018):
- Full-Stack Engineering: Developed business-critical web applications and microservices using C#, .NET Core, SQL Server, and modern JavaScript.
- Integration & Lifecycle: Authored modular RESTful APIs, optimized database access queries, and provided tier-3 production incident triage.`,
  },
  {
    id: 9,
    title: 'Software Engineer at Sirpi (2013 - 2015)',
    category: 'experience',
    tags: ['Sirpi', 'Backend', 'C#', 'SQL Server', 'SDLC'],
    content: `At Sirpi as Software Engineer (2013 – 2015):
- Engineered foundational backend APIs and relational database structures using C# and SQL Server across the full SDLC.`,
  },
  {
    id: 10,
    title: 'Key Architecture: Decoupled Asynchronous Processing & SQL Tuning',
    category: 'architecture',
    tags: ['RabbitMQ', 'SQS', 'Redis', 'SQL Server', 'Query Store', 'SignalR'],
    content: `Enterprise Architecture Highlights:
- Decoupled Processing: Replaced legacy synchronous handlers with RabbitMQ/AWS SQS and .NET background workers, eliminating blocking API calls and using SignalR/WebSockets for live client notifications.
- SQL Server Tuning: Resolved severe high-concurrency CPU bottlenecks by analyzing Query Store, execution plans, indexing strategies, and deadlock mitigation.`,
  },
];

function generateNeuralEmbedding(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: VECTOR_DIMENSION,
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'VigneshResumeSeeder/1.0',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.embedding && parsed.embedding.values) {
            resolve(parsed.embedding.values);
          } else {
            reject(new Error(`API Error: ${data}`));
          }
        } catch (e: any) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Embedding request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runSeed() {
  const qdrantUrl = process.env.QDRANT_URL || 'https://13ef6f67-e1be-4ed6-8f7b-2ae89c8eaee5.eu-central-1-0.aws.cloud.qdrant.io:6333';
  const qdrantApiKey = process.env.QDRANT_API_KEY;

  if (!GEMINI_API_KEY || !qdrantApiKey) {
    throw new Error('GEMINI_API_KEY and QDRANT_API_KEY must be set before seeding Qdrant.');
  }

  console.log('Connecting to Qdrant Cloud at:', qdrantUrl);
  console.log('Generating Neural Network embeddings via Google Gemini (gemini-embedding-001)...');

  const client = new QdrantClient({
    url: qdrantUrl,
    apiKey: qdrantApiKey,
    checkCompatibility: false,
  });

  try {
    await client.deleteCollection(COLLECTION_NAME).catch(() => {});
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_DIMENSION,
        distance: 'Cosine',
      },
    });
    console.log(`[✓] Created collection "${COLLECTION_NAME}" with 768-dim Neural Cosine vectors.`);

    const points = [];
    for (const chunk of KNOWLEDGE_BASE) {
      console.log(`[Neural Embedding] Vectorizing chunk ${chunk.id}: "${chunk.title}"...`);
      const textToEmbed = `${chunk.title}\n${chunk.content}\nTags: ${chunk.tags.join(', ')}`;
      const vector = await generateNeuralEmbedding(textToEmbed);
      points.push({
        id: chunk.id,
        vector,
        payload: {
          title: chunk.title,
          category: chunk.category,
          tags: chunk.tags,
          content: chunk.content,
        },
      });
    }

    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    console.log(`\n=====================================================`);
    console.log(`[✓] Successfully seeded Qdrant Cloud with 10 Neural Vectors!`);
    console.log(`=====================================================`);
  } catch (error: any) {
    console.error('Seeding error:', error.message);
  }
}

runSeed();
