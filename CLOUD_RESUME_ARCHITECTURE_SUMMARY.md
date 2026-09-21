# Vignesh Kumar Ekambaram — Cloud Resume & AI Assistant System Summary

## Executive Summary

This project is a high-performance, serverless portfolio website and RAG-powered AI Career Assistant engineered for **Vignesh Kumar Ekambaram** (Tech Lead & Solution Architect). 

It demonstrates modern cloud computing principles, serverless microservices, atomic database operations, and state-of-the-art vector similarity search with LLM reasoning.

---

## 🌐 Live Production Links & Dashboards

| Service / Resource | Location / URL | Description |
|---|---|---|
| **Vercel Production Web App** | [https://vignesh-resume-chi.vercel.app](https://vignesh-resume-chi.vercel.app) | Primary live web application (Frontend + Serverless `/api/*`) |
| **Vercel Dashboard** | [https://vercel.com/vigneshacme/vignesh-resume](https://vercel.com/vigneshacme/vignesh-resume) | Project deployments, logs, and serverless metrics |
| **GitHub Source Code** | [https://github.com/Vigneshacme/vignesh-resume](https://github.com/Vigneshacme/vignesh-resume) | Main source repository (`main` branch) |
| **Qdrant Cloud Console** | [https://cloud.qdrant.io](https://cloud.qdrant.io) | Managed vector database cluster (`eu-central-1`) |
| **Qdrant Vector Dashboard** | [Dashboard UI Link](https://13ef6f67-e1be-4ed6-8f7b-2ae89c8eaee5.eu-central-1-0.aws.cloud.qdrant.io:6333/dashboard) | Live inspection of 10 neural vectors & payloads |
| **Firebase Cloud Console** | [vignesh-cloud-resume-vk](https://console.firebase.google.com/project/vignesh-cloud-resume-vk/overview) | Cloud Firestore Native database for visitor hit tracking |
| **Firebase Static Mirror** | [https://vignesh-cloud-resume-vk.web.app](https://vignesh-cloud-resume-vk.web.app) | Secondary static edge mirror |

---

## 🏗️ System Architecture & Component Interaction

```
                                  +-------------------------------------------------------+
                                  |                 Recruiter / Visitor                   |
                                  +-------------------------------------------------------+
                                                              |
                                                    HTTPS Request to Web App
                                                              v
                                  +-------------------------------------------------------+
                                  |           Vercel Global Edge Network (CDN)            |
                                  |         (https://vignesh-resume-chi.vercel.app)       |
                                  +-------------------------------------------------------+
                                          /                                       \
                         Static Web Assets                                    Serverless APIs
                                /                                                   \
      +----------------------------------+                        +----------------------------------+
      |  public/index.html & app.js      |                        |  api/track-hit.js & api/chat.js  |
      +----------------------------------+                        +----------------------------------+
                                                                       /                       \
                                                         Atomic Hit Counter                 Neural Vector Search
                                                                 /                                   \
                                            +--------------------------+               +--------------------------+
                                            | Google Cloud Firestore   |               | Qdrant Cloud Vector DB   |
                                            | (stats/visitors document)|               | (resume_knowledge 768-d) |
                                            +--------------------------+               +--------------------------+
                                                                                                   |
                                                                                           Retrieved Context
                                                                                                   v
                                                                                       +--------------------------+
                                                                                       | Google Gemini AI LLM     |
                                                                                       | (gemini-flash-latest)    |
                                                                                       +--------------------------+
```

---

## 🧠 AI Recruiter RAG (Retrieval-Augmented Generation) Pipeline

1. **Neural Vector Embeddings (`gemini-embedding-001`)**:
   - Instead of basic character matching, incoming recruiter questions are converted into **768-dimensional neural semantic vectors** via Google Gemini AI (`outputDimensionality: 768`).
   - This maps conceptual meanings, synonyms, and context into a multi-dimensional semantic space.

2. **Qdrant Vector Similarity Search (`resume_knowledge` Collection)**:
   - Queries the Qdrant Cloud cluster in `eu-central-1` using **Cosine Similarity**.
   - Retrieves the top matching resume chunks (e.g., matching *"how do you handle high message volumes?"* to *"RabbitMQ and AWS SQS queue worker services"* with high similarity scores).

3. **Grounded LLM Reasoning (`gemini-flash-latest`)**:
   - Constructs a prompt injecting the retrieved verified resume passages as context.
   - Google Gemini generates an articulate, concise, professional answer speaking on behalf of Vignesh's verified background.

---

## 📋 Vector Knowledge Base Breakdown (Qdrant Cloud)

The vector database consists of 10 structured, domain-specific knowledge chunks:

1. **Professional Summary & Profile**: 10+ years experience as Tech Lead & Full-Stack Solution Architect across .NET Core, Angular, SQL Server, AWS, and AI systems.
2. **Technical Skills Matrix**: Comprehensive listing of languages, frameworks, cloud services, databases, messaging, and AI tools.
3. **Tech Lead Experience at alfaTKG (2022 – Present)**: Architectural leadership of flagship manufacturing products (JQMS, PTE, AlfaDock), multi-agent RAG orchestrator, RabbitMQ/SQS queues, and SQL tuning.
4. **Senior Software Engineer at alfaTKG (2018 – 2022)**: Predictive ML model development for quote pricing and machining cycle times, sheet metal quotation engines, and core products software architecture.
5. **ML Quote & Machining Cycle Time Prediction Engine**: Feature extraction from CAD/image engineering drawings using HOG (Histogram of Oriented Gradients) combined with Decision Tree Regression.
6. **Domain AI Agents & Multi-Agent Orchestrator**: Multi-agent ecosystem (Quotation Agent, Production Scheduler Agent, Machine IoT Data Agent) coordinated via a central Agent Orchestrator.
7. **Manufacturing Products Management Suite & Sheet Metal Quotation**: Details on sheet metal quotation workflows, nesting calculations, laser cutting paths, and shop-floor management.
8. **Software Development Engineer at alfaTKG (2015 – 2018)**: Core backend microservices, RESTful APIs, and database design.
9. **Software Engineer at Sirpi (2013 – 2015)**: Full SDLC development with C# and SQL Server.
10. **Enterprise Architecture Highlights**: Decoupled asynchronous event processing, SignalR real-time feedback, and SQL Server Query Store bottleneck resolution.

---

## 📁 Codebase Directory Structure

```
resume/
 ├── api/
 │    ├── chat.js                 # Serverless RAG API (Gemini Neural Embedding + Qdrant Search + Gemini LLM Reasoning)
 │    └── track-hit.js            # Serverless Hit Counter API
 ├── public/
 │    ├── index.html              # Portfolio HTML (Full Name, Skills, Timeline, Featured Projects, Collapsible Architecture Plan)
 │    ├── styles.css              # Dark-mode styling, glassmorphism, responsive grid layout
 │    └── app.js                  # Client controller, hit tracker animation, chat drawer, and architecture toggle logic
 ├── functions/
 │    └── scripts/
 │         └── seedQdrant.ts      # Seeding script generating 768-dim Gemini Neural vectors & pushing to Qdrant Cloud
 ├── firestore.rules              # Firebase Cloud Firestore security rules (disallows raw client writes to stats/visitors)
 ├── vercel.json                  # Zero-config Vercel deployment route configuration
 ├── package.json                 # Root dependencies (@qdrant/js-client-rest, firebase-admin)
 ├── playwright.config.ts         # Playwright E2E test suite configuration
 └── CLOUD_RESUME_ARCHITECTURE_SUMMARY.md  # This comprehensive system summary
```

---

## 🛠️ Operational Commands & Seeding Guide

### Re-seeding Qdrant Cloud Knowledge Base
If you update your resume or add new projects, run:
```powershell
npm --prefix functions run seed:qdrant
```

### Testing the AI RAG Chat Handler Locally
```powershell
node -e "const h = require('./api/chat.js'); h({method:'POST', body:{question:'Tell me about Vignesh\'s machine learning quote prediction project'}}, {setHeader(){}, status(){return this;}, json(d){console.log(d);}});"
```

### Deploying Updates to Live Site
Simply commit and push changes to GitHub:
```powershell
git add .
git commit -m "update: portfolio improvements"
git push origin main
```
*Vercel automatically builds and deploys the update to [https://vignesh-resume-chi.vercel.app](https://vignesh-resume-chi.vercel.app).*
