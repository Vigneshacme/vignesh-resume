# Vignesh Kumar E - Cloud Resume & Serverless Architecture

Portfolio, Cloud Resume Challenge architecture, and RAG AI Recruiter Assistant for **Vignesh Kumar E (Tech Lead | Senior Full-Stack Engineer | Solution Architect)**.

---

## 🌟 Key Architecture Features

1. **Static Hosting on Global Edge CDN**:
   - Hosted on Google Firebase Hosting (100% Free Tier).
   - Fast, SSL-secured edge caching with HTTP/2 and asset optimization.
   - Works immediately on Firebase auto-generated URLs (`https://<project-id>.web.app` and `https://<project-id>.firebaseapp.com`) without requiring a custom domain.
2. **Serverless Hit-Tracking Micro-Backend**:
   - Client makes an asynchronous `fetch('/api/track-hit')` request on page load.
   - Powered by a TypeScript **Firebase Cloud Function (v2)**.
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
   - `.github/workflows/deploy.yml` triggers on push to `main`, executing Playwright E2E tests before deploying to Firebase Hosting.

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

## 🌐 Deploying to Firebase (Auto-Generated URL)

### Persistent visitor count

Both hosting backends increment the existing `stats/visitors` document in the
default Firestore database. Deployments must keep using the same Firebase project
(`vignesh-cloud-resume-vk` in `.firebaserc`); never seed or reset this document.
Firebase Functions use their runtime service account. For Vercel, configure the
server-side `FIREBASE_SERVICE_ACCOUNT` environment variable with service-account
JSON from that same project, with permission to read and write Firestore data.
Configure it for each Vercel environment that should use the counter.

The API returns 503 and the badge displays “Unavailable” if Firestore cannot be
accessed. No temporary in-memory or browser-only counts are shown. Previous
in-memory counts cannot be recovered from the repository; any existing Firestore
count is preserved. CI deploys hosting and `trackHit` together, without resetting
database data. The CI service account must have permission to deploy functions
as well as hosting.

Run counter regression tests with `node --test tests/visitor-counter.test.cjs`.

Because you do not have a custom domain yet, Firebase Hosting provides free, auto-generated URLs:
- `https://<YOUR_PROJECT_ID>.web.app`
- `https://<YOUR_PROJECT_ID>.firebaseapp.com`

### Deploy Steps:
1. **Login to Firebase CLI:**
   ```powershell
   npx -y firebase-tools@latest login
   ```
2. **Set or Create your Firebase Project:**
   ```powershell
   # If using an existing project:
   npx -y firebase-tools@latest use <YOUR_PROJECT_ID>

   # OR create a brand new project:
   npx -y firebase-tools@latest projects:create <project-id> --display-name "Vignesh Cloud Resume"
   ```
3. **Deploy with a Single Command:**
   ```powershell
   npx -y firebase-tools@latest deploy
   ```
Firebase will print the live hosting URL (`https://<project-id>.web.app`). When you acquire a custom domain in the future, you can attach it via `firebase hosting:channel:deploy` or through the Firebase Console with automated SSL certificate provisioning.
