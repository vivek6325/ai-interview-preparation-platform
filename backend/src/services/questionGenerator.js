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

    const totalCount =
      technical.length +
      behavioral.length +
      projects.length +
      experience.length +
      problemSolving.length;

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
    throw new Error(`Failed to generate personalized interview questions: ${err.message}`);
  }
}

export default {
  generatePersonalizedQuestions
};
