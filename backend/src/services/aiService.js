import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Initializes and retrieves the Google Generative AI SDK client.
 * Uses GEMINI_API_KEY from environment variables.
 */
function getAIClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in backend environment variables.'
      );
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Helper providing high-quality curated fallback interview questions when Gemini API quota is reached.
 */
export function getFallbackQuestions(role = 'Software Engineer', difficulty = 'medium', technologies = '') {
  const roleLower = (role || '').toLowerCase();
  const techLower = (technologies || '').toLowerCase();

  let questions;

  if (roleLower.includes('front') || techLower.includes('react') || techLower.includes('css')) {
    questions = [
      { id: 'q1', question: 'Explain the Virtual DOM in React and how reconciliation optimizes DOM rendering.', category: 'Technical', difficulty },
      { id: 'q2', question: 'What is the difference between state and props in React? When would you use Context vs Redux?', category: 'Technical', difficulty },
      { id: 'q3', question: 'Describe CSS Flexbox vs CSS Grid. How do you implement a responsive mobile-first layout?', category: 'Technical', difficulty },
      { id: 'q4', question: 'How do JavaScript closures work? Provide a practical real-world application.', category: 'Technical', difficulty },
      { id: 'q5', question: 'Explain Event Delegation in JavaScript and how event bubbling works.', category: 'Technical', difficulty },
      { id: 'q6', question: 'What strategies do you use to optimize web application page load performance and Core Web Vitals?', category: 'Technical', difficulty },
      { id: 'q7', question: 'Describe a time when you resolved a difficult cross-browser layout or rendering bug.', category: 'Behavioral', difficulty },
      { id: 'q8', question: 'How do useEffect dependency arrays work, and how do you prevent infinite re-render loops?', category: 'Technical', difficulty },
      { id: 'q9', question: 'Explain the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR).', category: 'System Design', difficulty },
      { id: 'q10', question: 'How do you handle client-side security risks such as XSS (Cross-Site Scripting) and CSRF?', category: 'Technical', difficulty }
    ];
  } else if (roleLower.includes('back') || techLower.includes('node') || techLower.includes('sql')) {
    questions = [
      { id: 'q1', question: 'Explain the Node.js Event Loop and how asynchronous non-blocking I/O operates.', category: 'Technical', difficulty },
      { id: 'q2', question: 'Compare SQL relational databases vs NoSQL document databases. When would you choose MongoDB over PostgreSQL?', category: 'Technical', difficulty },
      { id: 'q3', question: 'How do RESTful API architectural principles differ from GraphQL? What are over-fetching and under-fetching?', category: 'System Design', difficulty },
      { id: 'q4', question: 'Describe database indexing strategies. How do indexes speed up read queries and impact write operations?', category: 'Technical', difficulty },
      { id: 'q5', question: 'How do JWT (JSON Web Tokens) work for stateless authentication? How do you implement refresh token rotation?', category: 'Technical', difficulty },
      { id: 'q6', question: 'Explain microservices vs monolithic architecture. What strategies do you use for inter-service communication?', category: 'System Design', difficulty },
      { id: 'q7', question: 'Describe a technical disagreement you had with a team member about database schema design and how you aligned.', category: 'Behavioral', difficulty },
      { id: 'q8', question: 'How do you implement API rate limiting and prevent DDoS attacks on backend services?', category: 'Technical', difficulty },
      { id: 'q9', question: 'What is database connection pooling, and why is it essential for high-concurrency Node.js applications?', category: 'Technical', difficulty },
      { id: 'q10', question: 'How do Redis caching layers improve application response latency? Explain cache eviction policies.', category: 'System Design', difficulty }
    ];
  } else if (roleLower.includes('dsa') || roleLower.includes('algorithm')) {
    questions = [
      { id: 'q1', question: 'Explain the difference between Time Complexity O(N) and Space Complexity O(1) in algorithm analysis.', category: 'Technical', difficulty },
      { id: 'q2', question: 'How does a Hash Map achieve average O(1) lookup time? Explain hash collisions and chaining.', category: 'Technical', difficulty },
      { id: 'q3', question: 'Describe the Two-Pointer approach vs Sliding Window technique for array and string algorithms.', category: 'Technical', difficulty },
      { id: 'q4', question: 'Explain Breadth-First Search (BFS) vs Depth-First Search (DFS) for graph traversal.', category: 'Technical', difficulty },
      { id: 'q5', question: 'What is Dynamic Programming? Contrast memoization (top-down) with tabulation (bottom-up).', category: 'Technical', difficulty },
      { id: 'q6', question: 'How do Binary Search Trees (BST) maintain sorted data? What happens when a tree becomes unbalanced?', category: 'Technical', difficulty },
      { id: 'q7', question: 'Explain QuickSort vs MergeSort algorithms in terms of stability, time complexity, and memory overhead.', category: 'Technical', difficulty },
      { id: 'q8', question: 'Describe how a Min-Heap / Priority Queue is implemented and used for Dijkstra’s shortest path algorithm.', category: 'Technical', difficulty },
      { id: 'q9', question: 'Walk me through how you approach solving an unseen LeetCode Hard problem during a live coding interview.', category: 'Behavioral', difficulty },
      { id: 'q10', question: 'How do LRU (Least Recently Used) cache data structures combine a Hash Map and a Doubly Linked List?', category: 'System Design', difficulty }
    ];
  } else {
    questions = [
      { id: 'q1', question: `Explain your core technical background and primary engineering responsibilities as a ${role}.`, category: 'Behavioral', difficulty },
      { id: 'q2', question: 'Describe a complex technical project you engineered from architectural design to production deployment.', category: 'Technical', difficulty },
      { id: 'q3', question: 'How do you approach debugging a critical production bug under severe time pressure?', category: 'Behavioral', difficulty },
      { id: 'q4', question: 'Explain key strategies you implement for code review quality, unit testing, and CI/CD pipelines.', category: 'Technical', difficulty },
      { id: 'q5', question: 'How do you handle trade-offs between shipping feature code quickly vs addressing technical debt?', category: 'Behavioral', difficulty },
      { id: 'q6', question: 'Describe how you collaborate with product managers, UX designers, and QA engineers in an agile team.', category: 'Behavioral', difficulty },
      { id: 'q7', question: 'What technical tools and frameworks do you rely on to monitor application health and error telemetry?', category: 'Technical', difficulty },
      { id: 'q8', question: 'Describe a situation where a software requirement changed midway through a sprint and how you adapted.', category: 'Behavioral', difficulty },
      { id: 'q9', question: 'How do you stay up-to-date with emerging technologies and continuous engineering learning?', category: 'Behavioral', difficulty },
      { id: 'q10', question: 'Walk me through a STAR scenario where you took initiative to optimize an inefficient team process.', category: 'Behavioral', difficulty }
    ];
  }

  return questions;
}

/**
 * Helper providing fallback session evaluation when Gemini API is rate-limited.
 */
/**
 * Helper providing fallback session evaluation when Gemini API is rate-limited.
 */
export function evaluateFallbackSession(questionsWithAnswers = []) {
  let totalScore = 0;
  const evaluatedQuestions = questionsWithAnswers.map((q) => {
    const text = q.questionText || '';
    const rawAns = (q.userAnswer || '').trim();
    const ansLower = rawAns.toLowerCase();

    const isSkippedOrEmpty =
      !rawAns ||
      ansLower.includes('no response provided') ||
      ansLower.includes('skipped by candidate') ||
      ansLower.includes('timer limit');

    let score;
    let feedback;
    let strength;
    let improvement;
    let modelAnswer = 'A comprehensive answer should cover fundamental principles, real-world examples, and performance trade-offs relevant to the prompt.';
    let deductions;
    let mistakes;

    if (text.toLowerCase().includes('react') || text.toLowerCase().includes('dom')) {
      modelAnswer = 'React relies on a lightweight in-memory Virtual DOM representation. When state changes occur, React creates a new VDOM tree and executes its heuristic O(N) Reconciliation diffing algorithm against the previous VDOM snapshot to calculate minimal DOM patches via Fiber nodes, maximizing render performance.';
    } else if (text.toLowerCase().includes('sql') || text.toLowerCase().includes('query') || text.toLowerCase().includes('database')) {
      modelAnswer = 'To optimize database performance, use B-Tree indexes on heavily queried column clauses (WHERE, JOIN, ORDER BY), examine execution plans using EXPLAIN ANALYZE, eliminate N+1 query patterns with eager joins, and maintain connection pools to prevent I/O bottlenecks.';
    } else if (text.toLowerCase().includes('rest') || text.toLowerCase().includes('graphql') || text.toLowerCase().includes('node')) {
      modelAnswer = 'Stateless REST architectures communicate using standard HTTP verbs and status codes, whereas GraphQL exposes a single flexible endpoint allowing clients to request exact fields via queries and mutations, eliminating over-fetching and under-fetching issues.';
    }

    if (isSkippedOrEmpty) {
      score = 0.0;
      feedback = 'No response provided for this question.';
      strength = 'N/A - Question skipped.';
      improvement = 'Review technical definitions and practice answering within time constraints.';
      deductions = [
        '-100% Complete penalty: No response submitted or question skipped'
      ];
      mistakes = 'Candidate did not attempt to answer this question.';
    } else if (rawAns.length < 25) {
      score = 2.5;
      feedback = 'Response was extremely brief and lacked technical detail or structure.';
      strength = 'Attempted to address the prompt.';
      improvement = 'Provide a structured explanation with key domain terms and real-world examples.';
      deductions = [
        '-40% Insufficient detail and length',
        '-35% Missing technical terminology and mechanisms'
      ];
      mistakes = 'The response was too short to demonstrate technical proficiency.';
    } else if (rawAns.length < 75) {
      score = 5.0;
      feedback = 'Baseline answer provided, but needs deeper explanation of underlying mechanisms.';
      strength = 'Covered basic concept definitions.';
      improvement = 'Elaborate on edge-cases, performance trade-offs, and implementation details.';
      deductions = [
        '-30% Omitted edge-case handling and production metrics',
        '-20% Lacks explicit STAR framework structuring'
      ];
      mistakes = 'Answer gave a superficial high-level overview without architectural depth.';
    } else if (rawAns.length >= 200) {
      score = 8.5;
      feedback = 'Strong, detailed response with solid articulation and structured flow.';
      strength = 'Comprehensive technical coverage matching interview benchmarks.';
      improvement = 'Proactively highlight real-world production metrics and monitoring.';
      deductions = [
        '-15% Minor omission of real-world production telemetry metrics'
      ];
      mistakes = 'Could have proactively mentioned edge cases before being prompted.';
    } else {
      score = 7.0;
      feedback = 'Good technical response addressing the primary aspects of the question.';
      strength = 'Clear logical explanation of core principles.';
      improvement = 'Structure response using explicit STAR (Situation, Task, Action, Result) points.';
      deductions = [
        '-20% Missing explicit STAR structure transitions',
        '-10% Omitted detailed trade-off analysis'
      ];
      mistakes = 'Response was good but could be structured more cleanly using STAR points.';
    }

    totalScore += score;
    return {
      questionText: text,
      userAnswer: rawAns || 'No response provided.',
      score: parseFloat(score.toFixed(1)),
      feedback,
      strength,
      improvement,
      modelAnswer,
      deductions,
      mistakes
    };
  });

  const count = questionsWithAnswers.length || 1;
  const avg = parseFloat((totalScore / count).toFixed(1));
  const grade = avg >= 8.0 ? 'Expert Candidate' : avg >= 5.5 ? 'Capable Professional' : 'Needs Development';

  return {
    questions: evaluatedQuestions,
    overallScore: avg,
    grade,
    overallFeedback: avg >= 5.5
      ? 'Demonstrated clear technical engagement across answered interview prompts.'
      : 'Session completed with several skipped or incomplete answers requiring further practice.',
    strengths: avg >= 5.5
      ? ['Completed key interview prompts', 'Good baseline technical vocabulary']
      : ['Attempted mock interview session'],
    improvements: [
      'Attempt all questions without skipping',
      'Use STAR framework (Situation, Task, Action, Result) for structured responses'
    ]
  };
}

/**
 * Calls Gemini API with retry logic and JSON validation helper.
 */
export async function callGemini(prompt, isJsonResponse = true) {
  const client = getAIClient();

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: isJsonResponse
      ? {
        responseMimeType: 'application/json',
      }
      : undefined,
  });

  let attempt = 0;
  const MAX_RETRIES = 2;

  while (attempt < MAX_RETRIES) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (isJsonResponse) {
        const cleanedText = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        return JSON.parse(cleanedText);
      }

      return text;
    } catch (error) {
      attempt++;

      if (attempt >= MAX_RETRIES) {
        const cleanMsg = (error.message || '').includes('429') || (error.message || '').includes('Quota') || (error.message || '').includes('Too Many Requests')
          ? 'Gemini API quota rate limited.'
          : (error.message || 'Gemini API call failed.');
        throw new Error(cleanMsg, { cause: error });
      }

      const delay = attempt * 1500;
      console.warn(
        `⚠️ Gemini API call failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Dynamically generates 10 interview questions based on candidate profile.
 */
export async function generateInterviewQuestions({
  role,
  difficulty,
  experience,
  technologies,
}) {
  try {
    const prompt = `You are a professional technical interviewer. Generate exactly 10 interview questions for a candidate with the following profile:
- Target Role: ${role}
- Experience Level: ${experience} years
- Difficulty Rating: ${difficulty}
- Core Technologies: ${technologies || 'General software engineering principles'}

The questions must be structured as a JSON array of objects matching this schema:
[
  {
    "id": "q1",
    "question": "Detailed question text...",
    "category": "Technical | Behavioral | System Design",
    "difficulty": "${difficulty}"
  }
]`;

    return await callGemini(prompt, true);
  } catch (error) {
    console.warn(`⚠️ Gemini API call error (${error.message}). Using curated fallback questions for ${role}.`);
    return getFallbackQuestions(role, difficulty, technologies);
  }
}

/**
 * Evaluates candidate responses for an interview session using AI scoring.
 */
export async function evaluateInterviewAnswers(questionsWithAnswers) {
  try {
    const formattedQuestions = questionsWithAnswers
      .map(
        (q, index) =>
          `Question ${index + 1}: ${q.questionText}\nCandidate Answer: ${q.userAnswer || 'No response provided.'}`
      )
      .join('\n\n---\n\n');

    const prompt = `You are a strict, highly accurate AI Technical Interview Evaluator. Evaluate the candidate's answers below with precision:

${formattedQuestions}

CRITICAL SCORING RUBRIC (Score out of 10 for each question):
- 0.0: The answer is missing, skipped, contains "No response provided", "Question was skipped", or timer expired without response.
- 1.0 - 3.0: The answer is incorrect, off-topic, gibberish, or fundamentally inaccurate.
- 4.0 - 6.0: The answer is partial, overly brief, or lacks technical depth/correct terminology.
- 7.0 - 8.5: The answer is technically accurate, well-structured, and directly answers the question.
- 9.0 - 10.0: Comprehensive, exceptional answer with deep architectural insight, edge cases, and clear STAR format.

Be honest and objective. Do NOT award high scores for wrong, vague, or empty answers.

Return a JSON object matching this schema:
{
  "questions": [
    {
      "questionText": "The original question text...",
      "userAnswer": "The candidate's answer...",
      "score": 0.0,
      "feedback": "Specific, honest feedback detailing what was correct or missing...",
      "strength": "Specific strength or 'N/A - Question skipped'...",
      "improvement": "Concrete action step to improve this response...",
      "modelAnswer": "The gold-standard, ideal technical answer to this question...",
      "deductions": [
        "-30% Missing key technical terms...",
        "-20% Omitted STAR framework structuring..."
      ],
      "mistakes": "Detailed explanation of where and why the candidate went wrong..."
    }
  ],
  "overallScore": 0.0,
  "grade": "Expert Candidate | Capable Professional | Needs Development",
  "overallFeedback": "Honest overall evaluation summary...",
  "strengths": ["Key overall strength 1"],
  "improvements": ["Key overall area for improvement 1"]
}`;

    return await callGemini(prompt, true);
  } catch (error) {
    console.warn(`⚠️ Gemini API evaluation error (${error.message}). Using rule-based fallback evaluation.`);
    return evaluateFallbackSession(questionsWithAnswers);
  }
}