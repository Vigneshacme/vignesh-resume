/**
 * Vignesh Kumar E - Portfolio Client Script
 * Implements:
 * 1. Serverless Hit Tracker (/api/track-hit)
 * 2. RAG AI Recruiter Chatbot Client (/api/chat)
 * 3. Dynamic Environment Detection
 */

document.addEventListener('DOMContentLoaded', () => {
  initEnvironmentInfo();
  initHitTracker();
  initChatDrawer();
  initArchToggle();
});

function initArchToggle() {
  const btn = document.getElementById('toggle-arch-btn');
  const section = document.getElementById('my-architecture');
  if (!btn || !section) return;

  btn.addEventListener('click', () => {
    const isHidden = section.style.display === 'none' || !section.style.display;
    if (isHidden) {
      section.style.display = 'block';
      btn.setAttribute('aria-expanded', 'true');
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Hide Architecture Plan';
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      section.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      const span = btn.querySelector('span');
      if (span) span.textContent = 'View Architecture Plan';
    }
  });
}

/* --------------------------------------------------------------------------
   1. Environment Info
   -------------------------------------------------------------------------- */
function initEnvironmentInfo() {
  const urlBadge = document.getElementById('app-url-info');
  if (!urlBadge) return;

  const hostname = window.location.hostname;
  if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) {
    urlBadge.textContent = `Live on Firebase (${hostname})`;
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    urlBadge.textContent = `Local Dev / Emulator (${window.location.host})`;
  } else {
    urlBadge.textContent = `Hosted at ${hostname}`;
  }
}

/* --------------------------------------------------------------------------
   2. Serverless Hit Tracker (Cloud Resume Challenge Architecture)
   -------------------------------------------------------------------------- */
async function initHitTracker() {
  const countEl = document.getElementById('hit-count');
  if (!countEl) return;

  try {
    let response = await fetch('/api/track-hit', { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      response = await fetch('https://vignesh-resume-chi.vercel.app/api/track-hit', { headers: { 'Accept': 'application/json' } });
    }

    if (response.ok) {
      const data = await response.json();
      animateCounter(countEl, data.count || 1);
      return;
    }
  } catch (err) {
    try {
      const vRes = await fetch('https://vignesh-resume-chi.vercel.app/api/track-hit', { headers: { 'Accept': 'application/json' } });
      if (vRes.ok) {
        const data = await vRes.json();
        animateCounter(countEl, data.count || 1);
        return;
      }
    } catch (e) {}
  }
  handleLocalHitCounter(countEl);
}

function handleLocalHitCounter(element) {
  // Local storage simulation for offline previewing
  const LOCAL_STORAGE_KEY = 'vignesh_resume_hits_local';
  let localCount = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '142', 10);
  localCount += 1;
  localStorage.setItem(LOCAL_STORAGE_KEY, localCount.toString());
  animateCounter(element, localCount);
}

function animateCounter(element, target) {
  let current = 0;
  const increment = Math.max(1, Math.floor(target / 40));
  const duration = 1200; // ms
  const stepTime = duration / (target / increment);

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = current.toLocaleString();
  }, Math.max(15, stepTime));
}

/* --------------------------------------------------------------------------
   3. AI Recruiter Chatbot Drawer (Qdrant Vector DB & RAG)
   -------------------------------------------------------------------------- */
function initChatDrawer() {
  const drawer = document.getElementById('chat-drawer');
  const overlay = document.getElementById('chat-overlay');
  const openBtn = document.getElementById('ai-chat-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');

  if (!drawer || !openBtn) return;

  function openChat() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    input?.focus();
  }

  function closeChat() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  openBtn.addEventListener('click', openChat);
  closeBtn?.addEventListener('click', closeChat);
  overlay?.addEventListener('click', closeChat);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeChat();
    }
  });

  // Global helper for suggestion chips
  window.askQuestion = (questionText) => {
    if (input) {
      input.value = questionText;
      form?.dispatchEvent(new Event('submit'));
    }
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // Append user message
    appendMessage(messagesContainer, 'user', query);
    input.value = '';

    let data = null;
    try {
      let response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      // If on Firebase where /api/chat is 404, fallback to Vercel serverless backend
      if (!response.ok) {
        response = await fetch('https://vignesh-resume-chi.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query })
        });
      }

      if (response.ok) {
        data = await response.json();
      }
    } catch (error) {
      try {
        const vRes = await fetch('https://vignesh-resume-chi.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query })
        });
        if (vRes.ok) data = await vRes.json();
      } catch (e) {}
    }

    removeLoadingIndicator(loadingId);

    if (data && data.answer) {
      appendMessage(messagesContainer, 'bot', data.answer, data.sources);
    } else {
      const fallbackAnswer = generateClientFallbackAnswer(query);
      appendMessage(messagesContainer, 'bot', fallbackAnswer);
    }
  });
}

function appendMessage(container, sender, text, sources) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;

  const p = document.createElement('p');
  p.textContent = text;
  bubble.appendChild(p);

  if (sources && sources.length > 0) {
    const sourceWrap = document.createElement('div');
    sourceWrap.style.marginTop = '0.5rem';
    sourceWrap.style.fontSize = '0.75rem';
    sourceWrap.style.color = '#93c5fd';
    sourceWrap.textContent = `Indexed from: ${sources.join(', ')}`;
    bubble.appendChild(sourceWrap);
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendLoadingIndicator(container) {
  const id = `loading-${Date.now()}`;
  const bubble = document.createElement('div');
  bubble.id = id;
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = '<span style="font-style: italic; color: #9ca3af;">Querying Qdrant vector database & generating answer...</span>';
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeLoadingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * Intelligent client-side fallback knowledge base
 * Ensures interactive recruiter testing even before Qdrant cluster / Cloud Functions are connected.
 */
function generateClientFallbackAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes('async') || q.includes('rabbitmq') || q.includes('queue') || q.includes('message')) {
    return "At alfaTKG, Vignesh designed a high-throughput queue processing engine using RabbitMQ, AWS SQS, and containerized .NET Worker Services. This decoupled heavy document/thumbnail generation from synchronous API handlers and eliminated polling patterns using SignalR/WebSockets.";
  }

  if (q.includes('sql') || q.includes('tune') || q.includes('database') || q.includes('query')) {
    return "Vignesh has extensive SQL Server performance tuning expertise: resolving high CPU bottlenecks under concurrency using Query Store, analyzing execution plans, indexing strategies, and managing locking/blocking across multi-tenant enterprise databases.";
  }

  if (q.includes('cloud') || q.includes('aws') || q.includes('infra') || q.includes('iac') || q.includes('firebase')) {
    return "Vignesh's cloud architecture background spans AWS (EC2, ALB, RDS, WAF, S3) and Google Firebase (Hosting, Cloud Functions, Cloud Firestore). He designs for zero-downtime high availability behind load balancers with multi-AZ replication, and automates CI/CD via GitLab and GitHub Actions.";
  }

  if (q.includes('ai') || q.includes('qdrant') || q.includes('agent') || q.includes('rag') || q.includes('mcp')) {
    return "Vignesh actively leads R&D integrating AI Agents, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG). He uses Qdrant vector database for semantic similarity search, hybrid retrieval, and LLM grounding.";
  }

  return "Vignesh Kumar E is a Tech Lead and Solution Architect with 10+ years of experience engineering scalable systems in .NET Core, Angular, Node.js, SQL Server, and AWS. He leads engineering teams, designs decoupled asynchronous architectures, and optimizes enterprise cloud systems.";
}
