import { callGemini } from './aiService.js';

/**
 * AI Personalized Question Generator Service
 *
 * Consumes structured candidate resume JSON and generates 15-20 highly personalized,
 * concise interview questions grouped into 5 categories: Technical, Behavioral,
 * Project-based, Experience-based, and Problem-solving.
 */

/**
 * Helper function to safely format and sanitize question array items.
 *
 * @param {Array} rawArr - Raw list of questions from AI
 * @param {string} defaultCategory - Fallback category title
 * @param {string} prefix - ID prefix (e.g. 't', 'b', 'p')
 * @returns {Array} Cleaned array of question objects
 */
function sanitizeQuestionList(rawArr, defaultCategory, prefix) {
  if (!Array.isArray(rawArr)) return [];

  return rawArr.map((q, idx) => {
    const questionText = typeof q === 'string' ? q : q?.question || '';
    const difficulty =
      q?.difficulty && ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
        ? q.difficulty
        : idx % 3 === 0
        ? 'Easy'
        : idx % 3 === 1
        ? 'Medium'
        : 'Hard';

    return {
      id: q?.id || `${prefix}${idx + 1}`,
      question: typeof questionText === 'string' ? questionText.trim() : '',
      category: q?.category || defaultCategory,
      difficulty
    };
  }).filter((q) => Boolean(q.question));
}

/**
 * Generates personalized interview questions based on candidate's structured resume JSON.
 *
 * @param {Object} resumeData - Candidate profile JSON
 * @returns {Promise<Object>} Categorized questions object
 */
export async function generatePersonalizedQuestions(resumeData) {
  if (!resumeData || typeof resumeData !== 'object') {
    throw new Error('Valid candidate resume data object is required.');
  }

  const hasExperience = Array.isArray(resumeData.experience) && resumeData.experience.length > 0;

  console.log(
    `🤖 [Question Generator] Generating 15-20 personalized questions (Has Work Experience: ${hasExperience})...`
  );

  const prompt = `You are a world-class technical interviewer. Generate 15 to 20 highly personalized, concise interview questions based strictly on the candidate's resume provided below.

CANDIDATE RESUME PROFILE:
${JSON.stringify(resumeData, null, 2)}

Output Schema:
Return ONLY a single valid JSON object adhering to this exact format (no markdown, no code fences):
{
  "technical": [
    { "id": "t1", "question": "...", "category": "Technical", "difficulty": "Easy" }
  ],
  "behavioral": [
    { "id": "b1", "question": "...", "category": "Behavioral", "difficulty": "Medium" }
  ],
  "projects": [
    { "id": "p1", "question": "...", "category": "Project-based", "difficulty": "Hard" }
  ],
  "experience": [
    { "id": "e1", "question": "...", "category": "Experience-based", "difficulty": "Medium" }
  ],
  "problemSolving": [
    { "id": "ps1", "question": "...", "category": "Problem-solving", "difficulty": "Hard" }
  ]
}

Strict Requirements:
1. Generate between 15 and 20 total questions (approx 3-4 questions per category).
2. Avoid duplicate or repetitive questions.
3. Base EVERY single question directly on the candidate's actual projects, skills, technologies, and work history.
4. Scale question difficulty appropriately based on candidate's experience, project complexity, and listed tech stack.
5. ${
    hasExperience
      ? 'Include realistic experience-based questions focusing on candidate companies, roles, and achievements.'
      : 'Since candidate work experience is empty, replace experience questions with additional project-based and technical scenario questions.'
  }
6. Never hallucinate or invent details not present in the resume.
7. Keep question text concise, focused, and professional.
8. Mix Easy, Medium, and Hard difficulty ratings across questions.`;

  try {
    const aiResponse = await callGemini(prompt, true);

    const questionsObj = typeof aiResponse === 'object' ? aiResponse : {};

    // Sanitize and validate every category array
    const technical = sanitizeQuestionList(questionsObj.technical, 'Technical', 't');
    const behavioral = sanitizeQuestionList(questionsObj.behavioral, 'Behavioral', 'b');
    const projects = sanitizeQuestionList(questionsObj.projects, 'Project-based', 'p');
    const experience = hasExperience
      ? sanitizeQuestionList(questionsObj.experience, 'Experience-based', 'e')
      : sanitizeQuestionList(questionsObj.projects?.slice(3) || [], 'Project-based', 'p_extra');
    const problemSolving = sanitizeQuestionList(questionsObj.problemSolving, 'Problem-solving', 'ps');

    let totalCount =
      technical.length +
      behavioral.length +
      projects.length +
      experience.length +
      problemSolving.length;

    if (totalCount === 0) {
      console.warn('⚠️ [Question Generator] AI response returned 0 questions. Using candidate-tailored fallback questions.');
      const skillsList = Array.isArray(resumeData?.skills) && resumeData.skills.length > 0
        ? resumeData.skills.slice(0, 5)
        : ['JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL/NoSQL'];
      const projectList = Array.isArray(resumeData?.projects) && resumeData.projects.length > 0
        ? resumeData.projects
        : [{ title: 'Full Stack Web Application' }];

      return {
        technical: [
          { id: 't1', question: `Can you explain core architectural concepts of ${skillsList[0] || 'JavaScript'} and how you optimize performance in high-load scenarios?`, category: 'Technical', difficulty: 'Medium' },
          { id: 't2', question: `How do you handle state management, asynchronous data flows, and error boundaries in ${skillsList[1] || 'React'} applications?`, category: 'Technical', difficulty: 'Medium' },
          { id: 't3', question: `What strategies do you use for database index optimization, API rate limiting, and caching when building backend services with ${skillsList[2] || 'Node.js'}?`, category: 'Technical', difficulty: 'Hard' },
          { id: 't4', question: `Explain how you design RESTful interfaces and handle authentication, CORS, and token refresh mechanisms safely.`, category: 'Technical', difficulty: 'Easy' }
        ],
        behavioral: [
          { id: 'b1', question: `Tell me about a time when you faced an architectural disagreement with team members. How did you align on a solution?`, category: 'Behavioral', difficulty: 'Medium' },
          { id: 'b2', question: `Describe a situation where a critical production bug occurred. How did you debug and mitigate the impact?`, category: 'Behavioral', difficulty: 'Hard' },
          { id: 'b3', question: `How do you prioritize technical debt against tight feature deadlines?`, category: 'Behavioral', difficulty: 'Medium' }
        ],
        projects: [
          { id: 'p1', question: `Walk me through the architecture of your project "${projectList[0]?.title || 'Web Application'}". What were the main technical challenges you solved?`, category: 'Project-based', difficulty: 'Hard' },
          { id: 'p2', question: `How did you choose the tech stack and database schema for "${projectList[0]?.title || 'your project'}"? What tradeoffs did you consider?`, category: 'Project-based', difficulty: 'Medium' },
          { id: 'p3', question: `What automated testing or CI/CD deployment pipelines did you set up for your project builds?`, category: 'Project-based', difficulty: 'Medium' }
        ],
        experience: [
          { id: 'e1', question: `Can you outline your primary responsibilities in your recent engineering work and key highlights of your contributions?`, category: 'Experience-based', difficulty: 'Medium' },
          { id: 'e2', question: `How do you approach cross-functional collaboration with product managers, QA, and DevOps engineers?`, category: 'Experience-based', difficulty: 'Easy' },
          { id: 'e3', question: `What processes do you establish during peer code reviews to maintain high quality and consistency across teams?`, category: 'Experience-based', difficulty: 'Medium' }
        ],
        problemSolving: [
          { id: 'ps1', question: `How would you design a scalable system for real-time notifications supporting 100,000 active concurrent users?`, category: 'Problem-solving', difficulty: 'Hard' },
          { id: 'ps2', question: `If an API endpoint experiences a sudden spike in latency from 100ms to 5000ms, how would you systematically diagnose the bottleneck?`, category: 'Problem-solving', difficulty: 'Hard' }
        ]
      };
    }

    console.log(
      `✅ [Question Generator] Successfully generated ${totalCount} personalized questions.`
    );

    return {
      technical,
      behavioral,
      projects,
      experience,
      problemSolving
    };
  } catch (err) {
    console.error('❌ [Question Generator] Failure:', err.message);
    const skillsList = Array.isArray(resumeData?.skills) && resumeData.skills.length > 0
      ? resumeData.skills.slice(0, 5)
      : ['JavaScript', 'React', 'Node.js', 'REST APIs'];

    return {
      technical: [
        { id: 't1', question: `Can you explain core architectural concepts of ${skillsList[0] || 'JavaScript'} and performance tuning?`, category: 'Technical', difficulty: 'Medium' },
        { id: 't2', question: `How do you handle state management and error boundaries in modern web applications?`, category: 'Technical', difficulty: 'Medium' }
      ],
      behavioral: [
        { id: 'b1', question: `Describe a situation where a critical production bug occurred. How did you resolve it?`, category: 'Behavioral', difficulty: 'Hard' }
      ],
      projects: [
        { id: 'p1', question: `Walk me through the architecture of your main software project and the technical tradeoffs you made.`, category: 'Project-based', difficulty: 'Hard' }
      ],
      experience: [
        { id: 'e1', question: `What are the key technical contributions you have made in your recent software engineering role?`, category: 'Experience-based', difficulty: 'Medium' }
      ],
      problemSolving: [
        { id: 'ps1', question: `How would you design a real-time notification system handling high traffic?`, category: 'Problem-solving', difficulty: 'Hard' }
      ]
    };
  }
}

export default {
  generatePersonalizedQuestions
};
