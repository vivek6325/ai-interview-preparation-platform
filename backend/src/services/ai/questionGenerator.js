/**
 * Mock AI Question Generator Service
 * Structured repository of interview questions categorized by role, difficulty, and experience level.
 */

const QUESTION_BANK = {
  frontend: {
    fresher: {
      easy: [
        { question: "What is HTML semantic markup, and why is it important?", difficulty: "Easy" },
        { question: "Explain the difference between let, const, and var in JavaScript.", difficulty: "Easy" },
        { question: "What is the DOM in web development?", difficulty: "Easy" },
        { question: "What are CSS media queries and how do they work?", difficulty: "Easy" },
        { question: "What is the difference between relative, absolute, and fixed positioning?", difficulty: "Easy" }
      ],
      medium: [
        { question: "What is the difference between '==' and '===' in JavaScript?", difficulty: "Medium" },
        { question: "Explain event bubbling and event capturing in JavaScript.", difficulty: "Medium" },
        { question: "What are React Hooks and why were they introduced?", difficulty: "Medium" },
        { question: "Explain CSS Flexbox layout properties and alignment parameters.", difficulty: "Medium" },
        { question: "What is the difference between null and undefined in JS?", difficulty: "Medium" }
      ],
      hard: [
        { question: "Explain closures in JavaScript and provide a practical use case.", difficulty: "Hard" },
        { question: "What is the Virtual DOM and how does React reconcile changes?", difficulty: "Hard" },
        { question: "Explain the event loop in JavaScript and microtasks/macrotasks.", difficulty: "Hard" },
        { question: "What is the purpose of CORS, and how do you resolve CORS issues?", difficulty: "Hard" },
        { question: "Explain CSS Grid vs CSS Flexbox layouts.", difficulty: "Hard" }
      ]
    },
    "1-3 years": {
      easy: [
        { question: "Explain JavaScript Event Delegation.", difficulty: "Easy" },
        { question: "What are React keys and why are they necessary?", difficulty: "Easy" },
        { question: "What is CSS specificity?", difficulty: "Easy" },
        { question: "What is the purpose of useEffect hook in React?", difficulty: "Easy" },
        { question: "What is responsive web design?", difficulty: "Easy" }
      ],
      medium: [
        { question: "Explain JavaScript closures and scope chain.", difficulty: "Medium" },
        { question: "What is React Context API and when should it be used over Redux?", difficulty: "Medium" },
        { question: "Explain how the 'this' keyword behaves in arrow functions vs normal functions.", difficulty: "Medium" },
        { question: "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?", difficulty: "Medium" },
        { question: "Explain debouncing and throttling in JavaScript.", difficulty: "Medium" }
      ],
      hard: [
        { question: "How would you optimize performance in a React application with heavy lists?", difficulty: "Hard" },
        { question: "Describe the critical rendering path of a browser and how to optimize it.", difficulty: "Hard" },
        { question: "Explain JavaScript prototype inheritance and prototype chains.", difficulty: "Hard" },
        { question: "What is tree shaking in webpack/bundlers?", difficulty: "Hard" },
        { question: "How does async/await work under the hood using generators?", difficulty: "Hard" }
      ]
    },
    "3+ years": {
      easy: [
        { question: "Explain closures and their memory overhead in V8.", difficulty: "Easy" },
        { question: "What are the lifecycle methods in React classes vs functional hooks?", difficulty: "Easy" },
        { question: "What are progressive web apps (PWAs)?", difficulty: "Easy" },
        { question: "What is CSS-in-JS and what are its pros and cons?", difficulty: "Easy" },
        { question: "Explain cross-site scripting (XSS) prevention on frontend.", difficulty: "Easy" }
      ],
      medium: [
        { question: "Explain dynamic import and code splitting strategies in Vite/React.", difficulty: "Medium" },
        { question: "How do you design a state management architecture for a very large SaaS dashboard?", difficulty: "Medium" },
        { question: "What are Web Workers and when should they be used?", difficulty: "Medium" },
        { question: "Explain React Server Components vs client components.", difficulty: "Medium" },
        { question: "How does HTTP/2 multiplexing improve frontend asset loading?", difficulty: "Medium" }
      ],
      hard: [
        { question: "Describe how you would design and implement an accessible component library from scratch.", difficulty: "Hard" },
        { question: "Explain micro-frontend architectures, their deployment pipelines, and shared state challenges.", difficulty: "Hard" },
        { question: "How would you build a custom React state reconciliation engine? Explain fiber nodes.", difficulty: "Hard" },
        { question: "Explain how V8 handles memory allocation and garbage collection.", difficulty: "Hard" },
        { question: "What is security mitigation for CSRF and XSS in modern Single Page Apps?", difficulty: "Hard" }
      ]
    }
  },
  backend: {
    fresher: {
      easy: [
        { question: "What is Node.js and how does it differ from browser JS?", difficulty: "Easy" },
        { question: "Explain the purpose of package.json and npm.", difficulty: "Easy" },
        { question: "What are HTTP status codes? Explain 200, 404, and 500.", difficulty: "Easy" },
        { question: "What is the difference between GET and POST requests?", difficulty: "Easy" },
        { question: "What is SQL vs NoSQL?", difficulty: "Easy" }
      ],
      medium: [
        { question: "What is Express middleware and how does it work?", difficulty: "Medium" },
        { question: "Explain Node.js Event Emitters.", difficulty: "Medium" },
        { question: "What is the difference between authentication and authorization?", difficulty: "Medium" },
        { question: "Explain indexes in database queries and why they improve performance.", difficulty: "Medium" },
        { question: "How do you handle asynchronous operations in Node.js using Promises?", difficulty: "Medium" }
      ],
      hard: [
        { question: "Explain the Node.js Event Loop phases in detail.", difficulty: "Hard" },
        { question: "How does clustering work in Node.js to achieve multi-core parallel processing?", difficulty: "Hard" },
        { question: "Describe database normalization rules and forms (1NF, 2NF, 3NF).", difficulty: "Hard" },
        { question: "What is Redis and what are its primary use cases?", difficulty: "Hard" },
        { question: "How do you secure Express applications against SQL Injection and NoSQL Injection?", difficulty: "Hard" }
      ]
    },
    "1-3 years": {
      easy: [
        { question: "Explain RESTful API architecture principles.", difficulty: "Easy" },
        { question: "What is MongoDB Mongoose schema validation?", difficulty: "Easy" },
        { question: "What is the difference between process.nextTick() and setImmediate()?", difficulty: "Easy" },
        { question: "What are environment variables and why use them?", difficulty: "Easy" },
        { question: "What is CORS in backend routing?", difficulty: "Easy" }
      ],
      medium: [
        { question: "Explain JWT authentication and how refreshing access tokens works.", difficulty: "Medium" },
        { question: "Describe relational database foreign keys and transaction ACID properties.", difficulty: "Medium" },
        { question: "How do streams work in Node.js and why should you use them for file management?", difficulty: "Medium" },
        { question: "What is an ORM/ODM and what are their advantages?", difficulty: "Medium" },
        { question: "Explain connection pooling in PostgreSQL or MongoDB.", difficulty: "Medium" }
      ],
      hard: [
        { question: "Describe how to design a distributed message queue system using RabbitMQ or Kafka.", difficulty: "Hard" },
        { question: "How would you handle database race conditions and write-lock contentions in high concurrency systems?", difficulty: "Hard" },
        { question: "Explain horizontal vs vertical database scaling, partitioning, and replication patterns.", difficulty: "Hard" },
        { question: "What is rate limiting, and how would you implement a token bucket rate limiter in Redis?", difficulty: "Hard" },
        { question: "Explain memory leaks in Node.js, and how to profile heap snapshot dumps.", difficulty: "Hard" }
      ]
    },
    "3+ years": {
      easy: [
        { question: "Explain standard microservice communications (gRPC vs REST vs GraphQL).", difficulty: "Easy" },
        { question: "What are Docker containers and why use them for deployment?", difficulty: "Easy" },
        { question: "Explain load balancing strategies (Round Robin, Least Connections).", difficulty: "Easy" },
        { question: "What is horizontal scaling in cloud deployments?", difficulty: "Easy" },
        { question: "What is database sharding?", difficulty: "Easy" }
      ],
      medium: [
        { question: "How do you design a database migrations pipeline for zero-downtime deployments?", difficulty: "Medium" },
        { question: "Explain OAuth2 grant types and which to use for single-page vs mobile apps.", difficulty: "Medium" },
        { question: "How would you architect a caching strategy with Cache-Aside vs Write-Through configurations?", difficulty: "Medium" },
        { question: "Explain WebSockets vs Server-Sent Events (SSE) for real-time messaging updates.", difficulty: "Medium" },
        { question: "Explain MongoDB replica sets and election consensus protocols.", difficulty: "Medium" }
      ],
      hard: [
        { question: "Design a fault-tolerant, horizontally scalable notification engine that handles 10M pushes daily.", difficulty: "Hard" },
        { question: "Explain Event Sourcing and CQRS architecture designs. When are they appropriate?", difficulty: "Hard" },
        { question: "How would you diagnose high memory consumption or event-loop blockage in a production Kubernetes pod?", difficulty: "Hard" },
        { question: "Explain CAP theorem trade-offs in distributed systems and consensus protocols like Raft or Paxos.", difficulty: "Hard" },
        { question: "Explain OAuth SSO federated architectures.", difficulty: "Hard" }
      ]
    }
  }
};

// Map similar roles to either frontend or backend
const normalizeRole = (role) => {
  const r = role.toLowerCase();
  if (r.includes('front') || r.includes('react') || r.includes('ui') || r.includes('client')) {
    return 'frontend';
  }
  return 'backend'; // Default/fallback to backend sets
};

const normalizeExperience = (exp) => {
  const e = exp.toLowerCase();
  if (e.includes('fresh') || e.includes('entry') || e.includes('0-')) {
    return 'fresher';
  }
  if (e.includes('3+') || e.includes('senior') || e.includes('lead')) {
    return '3+ years';
  }
  return '1-3 years'; // Default fallback
};

const normalizeDifficulty = (diff) => {
  const d = diff.toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('hard')) return 'hard';
  return 'medium'; // Default fallback
};

export const generateQuestions = (role, experience, difficulty, totalQuestions = 5) => {
  const targetRole = normalizeRole(role);
  const targetExp = normalizeExperience(experience);
  const targetDiff = normalizeDifficulty(difficulty);

  const roleQuestions = QUESTION_BANK[targetRole] || QUESTION_BANK.backend;
  const expQuestions = roleQuestions[targetExp] || roleQuestions['1-3 years'];
  const pool = expQuestions[targetDiff] || expQuestions.medium;

  // Clone and shuffle/slice to get dynamic subsets
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(totalQuestions, shuffled.length));

  // If we need more questions than are in the pool, append fallback generic questions
  while (selected.length < totalQuestions) {
    selected.push({
      question: `What are your strategies for testing, debugging, and maintaining software quality in ${role} development?`,
      difficulty: targetDiff.toUpperCase()
    });
  }

  // Format with incremental IDs
  return selected.map((q, idx) => ({
    id: idx + 1,
    question: q.question,
    difficulty: q.difficulty
  }));
};
