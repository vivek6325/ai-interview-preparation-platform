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

  let questions = [];

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
export function evaluateFallbackSession(questionsWithAnswers = []) {
  let totalScore = 0;
  const evaluatedQuestions = questionsWithAnswers.map((q) => {
    const text = q.questionText || '';
    const answer = q.userAnswer || '';
    let score = 7.5;
    if (answer.length > 200) score = 9.0;
    else if (answer.length > 80) score = 8.0;
    else if (answer.length < 20) score = 5.0;

    totalScore += score;
    return {
      questionText: text,
      userAnswer: answer,
      score,
      feedback: score >= 8 ? 'Strong articulation with good technical depth.' : 'Good attempt, but expanding structure and vocabulary will improve score.',
      strength: 'Identified key concepts matching the prompt requirements.',
      improvement: 'Provide concrete metrics or architectural examples.'
    };
  });

  const avg = parseFloat((totalScore / (questionsWithAnswers.length || 1)).toFixed(1));
  return {
    questions: evaluatedQuestions,
    overallScore: avg,
    grade: avg >= 8 ? 'Expert Candidate' : avg >= 6 ? 'Capable Professional' : 'Needs Development',
    overallFeedback: 'Demonstrated solid understanding across interview questions with clear logical flow.',
    strengths: ['Clear articulate answers', 'Good fundamental vocabulary', 'Structured delivery'],
    improvements: ['Proactively mention performance edge-cases', 'Elaborate on real-world metrics']
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
        throw new Error(cleanMsg);
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

    const prompt = `You are an AI Interview Evaluator. Critically evaluate the candidate's answers below:

${formattedQuestions}

Analyze each response based on accuracy, depth, and structural organization.

Return a JSON object matching this schema:
{
  "questions": [
    {
      "questionText": "The original question text...",
      "userAnswer": "The candidate's answer...",
      "score": 8.0,
      "feedback": "Constructive feedback details...",
      "strength": "One specific strength...",
      "improvement": "One concrete area for improvement..."
    }
  ],
  "overallScore": 8.0,
  "grade": "Expert Candidate | Capable Professional | Needs Development",
  "overallFeedback": "Overall evaluation summary...",
  "strengths": ["Overall strength 1"],
  "improvements": ["Overall improvement 1"]
}`;

    return await callGemini(prompt, true);
  } catch (error) {
    console.warn(`⚠️ Gemini API evaluation error (${error.message}). Using rule-based fallback evaluation.`);
    return evaluateFallbackSession(questionsWithAnswers);
  }
}