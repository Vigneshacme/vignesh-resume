# Vignesh Kumar E - Cloud Resume & Serverless Architecture

Portfolio, Cloud Resume Challenge architecture, and RAG AI Recruiter Assistant for **Vignesh Kumar E (Tech Lead | Senior Full-Stack Engineer | Solution Architect)**.

---

## 🌟 Key Architecture Features

1. **Static Hosting on Global Edge CDN**:
   - Hosted on Vercel, with Cloud Firestore on the Firebase Spark plan.
   - Fast, SSL-secured edge caching with HTTP/2 and asset optimization.
   - Works immediately on Firebase auto-generated URLs (`https://<project-id>.web.app` and `https://<project-id>.firebaseapp.com`) without requiring a custom domain.
2. **Serverless Hit-Tracking Micro-Backend**:
   - Client makes an asynchronous `fetch('/api/track-hit')` request on page load.
   - Powered by the **Vercel serverless endpoint** in `api/track-hit.js`.
   - Atomically increments visitor counts using Cloud Firestore's `FieldValue.increment(1)` to eliminate concurrency race conditions.
3. **Interactive RAG AI Recruiter Assistant**:
   - Embeds a slide-out chatbot drawer on the portfolio.
   - Connects to **Qdrant Vector Database** storing semantic embeddings of Vignesh's 10+ years of technical experience, projects, and architecture highlights.
   - Allows recruiters to interactively query skills, database tuning strategies, and distributed systems design.
4. **Infrastructure as Code (IaC)**:
   - Full **Terraform** configuration in `terraform/` to provision GCP APIs, Firebase Hosting, and Firestore database.
5. **End-to-End Automated Testing (Playwright)**:
   - Automated tests in `tests/portfolio.spec.ts` verifying UI rendering, skills matrix, hit-counter connectivity, and AI chat drawer interaction.
6. **CI/CD Pipeline (GitHub Actions)**:
   - `.github/workflows/deploy.yml` runs counter regression and Playwright tests. The Vercel Git integration handles deployment separately; GitHub tests do not gate Vercel deployment by default.

---

## 📁 Repository Structure

```
resume/
├── public/                       # Frontend static web application
│   ├── index.html                # Semantic HTML5 portfolio & resume portal
│   ├── styles.css                # Modern responsive dark-mode styling
│   └── app.js                    # Client hit-tracker & chat drawer controller
├── functions/                    # Firebase Cloud Functions (v2 TypeScript)
│   ├── src/
│   │   ├── index.ts              # /api/track-hit & /api/chat endpoints
│   │   └── qdrantService.ts      # Qdrant client & vector search wrapper
│   ├── scripts/
│   │   └── seedQdrant.ts         # Ingestion script to vectorize resume into Qdrant
│   ├── package.json
│   └── tsconfig.json
├── terraform/                    # Infrastructure as Code (Terraform)
│   ├── main.tf                   # GCP services, Firestore, & Firebase site
│   ├── variables.tf
│   └── outputs.tf
├── tests/                        # Playwright E2E Automation
│   └── portfolio.spec.ts         # Automated browser test suite
├── .github/workflows/
│   └── deploy.yml                # Automated CI/CD test & deploy workflow
├── firebase.json                 # Firebase Hosting, Functions, & rewrites config
├── .firebaserc                   # Firebase project mapping
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Database indexes
├── playwright.config.ts          # Playwright test runner configuration
├── package.json                  # Root npm scripts
├── QDRANT_SETUP_GUIDE.md         # Qdrant vector database learning guide
└── README.md                     # Documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. View Frontend Portfolio Locally
You can preview the portfolio immediately in your browser:

```powershell
npm run serve
```
Visit **[http://localhost:5000](http://localhost:5000)** in your browser.

---

### 2. Learn & Run Qdrant Vector Database
Follow our step-by-step tutorial in **[QDRANT_SETUP_GUIDE.md](QDRANT_SETUP_GUIDE.md)**.

**Quick Docker start:**
```powershell
docker run -d -p 6333:6333 -p 6334:6334 --name qdrant-resume qdrant/qdrant
```
Access the Qdrant Web UI at: **[http://localhost:6333/dashboard](http://localhost:6333/dashboard)**

**Seed the resume knowledge vectors:**
```powershell
npm run seed:qdrant
```

---

### 3. Build & Test Cloud Functions Locally

```powershell
cd functions
npm install
npm run build
```

---

### 4. Run Automated Playwright Tests

```powershell
npm install
npx playwright install chromium
npm run test:e2e
```

---

## Deployment: Vercel + Firestore (Spark)

The active Firebase project is `vignesh-resume-dbaaf`. Create its Standard
`(default)` Firestore database in production mode. Hosting and API requests run
on Vercel; the GitHub workflow only runs tests and does not deploy Firebase
Functions or require Blaze. Connect the repository to the Vercel project with
production branch `main` if it is not already connected.

Create a dedicated service account in this project's Google Cloud IAM console
with the Cloud Datastore User role (`roles/datastore.user`). Create a JSON key
and store its complete contents in the Vercel project's server-side environment
variable `FIREBASE_SERVICE_ACCOUNT` for Production. Redeploy to apply the
variable. Do not commit the key or place it in `public/`. Preview deployments
should use a separate test database/project if they should not affect live views.
GitHub no longer needs Firebase deployment secrets for this workflow.

The endpoint atomically increments `stats/visitors.count` and preserves existing
data. Initialize this document once with a verified historical total, or start
at zero. New projects do not inherit data from old projects. Never reset or seed
this document during deployment. If Firestore is unavailable, the API returns
503 and the badge shows “Unavailable” instead of a fabricated total.

Run counter regression tests with `node --test tests/visitor-counter.test.cjs`.

The legacy Firebase Hosting/Functions configuration and Terraform infrastructure
remain available for reference. They are not part of this Spark deployment;
do not run an unscoped `firebase deploy` or apply the legacy Terraform setup.
