/**
 * Qdrant Seeding Script
 * Chunks Vignesh Kumar E's Resume, vectorizes the chunks, and indexes them into Qdrant.
 * 
 * Usage:
 *   npx tsx scripts/seedQdrant.ts
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import * as dotenv from 'dotenv';

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://127.0.0.1:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;
const COLLECTION_NAME = 'resume_knowledge';
const VECTOR_DIMENSION = 768;

const client = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
  checkCompatibility: false,
});

interface ResumeKnowledgeChunk {
  id: number;
  title: string;
  category: 'summary' | 'skills' | 'experience' | 'architecture';
  tags: string[];
  content: string;
}

const KNOWLEDGE_BASE: ResumeKnowledgeChunk[] = [
  {
    id: 1,
    title: 'Professional Summary & Profile',
    category: 'summary',
    tags: ['Tech Lead', 'Architect', 'Full-Stack', 'Leadership', 'AI Agents', 'MCP', 'RAG'],
    content: `Vignesh Kumar E is a Tech Lead and Full-Stack Architect with 10+ years of enterprise experience engineering distributed, high-performance web systems using .NET Core, Angular, Node.js, SQL Server, and AWS. Proven track record in API design, microservices, complex asynchronous processing, and SQL database tuning. Demonstrates hands-on leadership across CI/CD automation, cloud architecture, security, and developer mentoring. Actively integrating AI Agents, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG) into modern enterprise automation workflows.`,
  },
  {
    id: 2,
    title: 'Technical Skills & Architecture Matrix',
    category: 'skills',
    tags: ['C#', 'TypeScript', '.NET Core', 'Angular', 'AWS', 'SQL Server', 'RabbitMQ', 'Redis'],
    content: `Core Technical Skills:
- Languages & Web: C#, TypeScript, JavaScript, SQL, HTML5, CSS3, JSON
- Backend Frameworks: ASP.NET Core, Web API, EF Core, Node.js, Express.js, WCF, YARP API Gateway
- Frontend Frameworks: Angular, React Native, PWA, RxJS
- Cloud & DevOps: AWS (EC2, ALB, RDS, WAF, S3), Docker, GitLab CI/CD, GitLab Runner, IIS, Linux/Ubuntu, PM2, Firebase Hosting
- Databases & Tuning: SQL Server, MySQL, Oracle, Query Store, Execution Plans, Indexing, Concurrency, Locking
- Messaging & Distributed: RabbitMQ, AWS SQS, Redis, SignalR, WebSockets, Async Processing, DLQ
- AI & Automation: AI Agents, MCP, RAG, LangGraph concepts, Qdrant / Vector Databases, Playwright`,
  },
  {
    id: 3,
    title: 'Tech Lead Experience at alfaTKG (2022 - Present)',
    category: 'experience',
    tags: ['alfaTKG', 'Tech Lead', 'JQMS', 'PTE', 'AlfaDock', 'RabbitMQ', 'SQS', 'Query Store'],
    content: `At alfaTKG as Tech Lead (2022 – Present):
- Architectural & Technical Leadership: Lead cross-functional engineering teams in delivering flagship manufacturing products (JQMS, PTE, AlfaDock) utilizing .NET, Angular, Node.js, and SQL Server.
- Scalable Async Infrastructure: Designed a queue-based processing engine using RabbitMQ, AWS SQS, and containerized .NET Worker Services to decouple heavy file/thumbnail workloads from API handlers, enabling independent horizontal scaling.
- Database & Query Tuning: Optimized enterprise SQL Server instances by analyzing Query Store, execution plans, locking/blocking, and index strategies to resolve severe CPU bottlenecks under high concurrency.
- Cloud & CI/CD Engineering: Architected AWS deployments using EC2, ALB, RDS, and WAF with automated GitLab CI/CD pipelines driving automated deployments to multi-tenant IIS environments.
- API & System Security: Implemented YARP API Gateway patterns, JWT authentication, distributed caching via Redis, and rate-limiting to protect mission-critical endpoints.
- AI Integration R&D: Driving technical initiatives to integrate AI Agents, RAG architecture, vector databases (Qdrant), and Model Context Protocol (MCP) into core enterprise workflows.`,
  },
  {
    id: 4,
    title: 'Software Development Engineer at alfaTKG (2015 - 2018)',
    category: 'experience',
    tags: ['alfaTKG', 'SDE', '.NET Core', 'SQL Server', 'RESTful API'],
    content: `At alfaTKG as Software Development Engineer (2015 – 2018):
- Full-Stack Engineering: Developed business-critical web applications and microservices using C#, .NET Core, SQL Server, and modern JavaScript.
- Integration & Lifecycle: Authored modular RESTful APIs, optimized database access queries, and provided tier-3 production incident triage.`,
  },
  {
    id: 5,
    title: 'Software Engineer at Sirpi (2013 - 2015)',
    category: 'experience',
    tags: ['Sirpi', 'Backend', 'C#', 'SQL Server', 'SDLC'],
    content: `At Sirpi as Software Engineer (2013 – 2015):
- Engineered foundational backend APIs and relational database structures using C# and SQL Server across the full SDLC.`,
  },
  {
    id: 6,
    title: 'Key Architecture Highlight: Decoupled Asynchronous Processing',
    category: 'architecture',
    tags: ['RabbitMQ', 'Redis', 'Event Bus', 'SignalR', 'WebSockets', 'Latency'],
    content: `Replaced legacy synchronous handlers with RabbitMQ/Redis event buses, reducing API latency for heavy document payloads by eliminating polling patterns via SignalR/WebSockets. Workers process document conversions and background queues independently.`,
  },
  {
    id: 7,
    title: 'Key Architecture Highlight: High-Availability Cloud Design',
    category: 'architecture',
    tags: ['AWS', 'ALB', 'Multi-AZ', 'RDS', 'Zero-Downtime'],
    content: `Managed zero-downtime application deployments behind AWS Application Load Balancers with multi-AZ RDS databases, failover strategies, and automated scaling groups.`,
  },
  {
    id: 8,
    title: 'Cloud Resume Strategy: Firebase Serverless Architecture',
    category: 'architecture',
    tags: ['Firebase', 'Cloud Functions', 'Firestore', 'Hit Tracking', 'Free Tier'],
    content: `Serverless Cloud Resume Challenge Architecture:
- Hosting: Global edge caching via Firebase Hosting with auto-provisioned SSL.
- Micro-backend: Node.js / TypeScript Firebase Cloud Function (v2).
- Persistence: Cloud Firestore with atomic FieldValue.increment(1) to guarantee race-condition-free counting.
- Observability: Google Analytics 4 (GA4) for recruiter traffic analysis + Google Cloud Logging.`,
  },
  {
    id: 9,
    title: 'Tech Leadership Upgrades: Qdrant Vector Search & Terraform IaC',
    category: 'architecture',
    tags: ['Qdrant', 'RAG', 'Terraform', 'Playwright', 'E2E Testing'],
    content: `Hands-on Upgrades to Demonstrate Tech Leadership:
- AI Assistant: RAG-powered recruiter assistant using Qdrant vector database for semantic search.
- Infrastructure as Code (IaC): Terraform configuration provisioning Firebase, Cloud Functions, and Firestore.
- Playwright E2E Automation: Automated verification of UI and hit-counter connectivity in GitHub Actions.
- Real-time Observability: Live visitor badge and Cloud Logging.`,
  },
];

function generateEmbedding(text: string): number[] {
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

async function runSeed() {
  console.log('=====================================================');
  console.log('       QDRANT VECTOR DATABASE SEEDING PROCESS        ');
  console.log('=====================================================');
  console.log(`Connecting to Qdrant at: ${QDRANT_URL}`);

  try {
    // 1. Check or create collection
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (exists) {
      console.log(`[✓] Collection "${COLLECTION_NAME}" exists. Re-indexing points...`);
    } else {
      console.log(`[i] Creating collection "${COLLECTION_NAME}" with ${VECTOR_DIMENSION}-dim Cosine distance...`);
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_DIMENSION,
          distance: 'Cosine',
        },
      });
      console.log(`[✓] Created collection "${COLLECTION_NAME}".`);
    }

    // 2. Vectorize and prepare points
    console.log(`[i] Vectorizing ${KNOWLEDGE_BASE.length} knowledge chunks...`);
    const points = KNOWLEDGE_BASE.map((chunk) => {
      const textToEmbed = `${chunk.title}\nTags: ${chunk.tags.join(', ')}\n${chunk.content}`;
      const vector = generateEmbedding(textToEmbed);

      return {
        id: chunk.id,
        vector: vector,
        payload: {
          title: chunk.title,
          category: chunk.category,
          tags: chunk.tags,
          content: chunk.content,
        },
      };
    });

    // 3. Upsert points into Qdrant
    console.log(`[i] Upserting points into Qdrant collection...`);
    const upsertResult = await client.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    console.log(`[✓] Upsert finished with status:`, upsertResult.status);
    console.log('-----------------------------------------------------');
    console.log('Qdrant Collection Status:');
    const info = await client.getCollection(COLLECTION_NAME);
    console.log(`- Points Count: ${info.points_count}`);
    console.log(`- Vector Dimension: ${info.config.params.vectors?.size ?? VECTOR_DIMENSION}`);
    console.log(`- Distance Metric: ${info.config.params.vectors?.distance ?? 'Cosine'}`);
    console.log('=====================================================');
    console.log('Seeding completed successfully!');
  } catch (error: any) {
    console.error('[!] Seeding failed:');
    console.error(error?.message || error);
    console.log('\nTIP: Make sure Qdrant is running:');
    console.log('  docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant');
  }
}

runSeed();
