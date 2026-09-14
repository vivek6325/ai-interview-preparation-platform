import { callGeminiModel } from './geminiClient.js';
import { buildQuestionPrompt, buildResumeQuestionPrompt } from './prompts.js';
import { getFallbackQuestions } from '../aiService.js';

/**
 * Validates the structure of the question array returned by Gemini.
 * Each item must contain id, question, difficulty, topic, and expectedAnswerPoints.
 */
function validateQuestionsSchema(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return false;
  return questions.every(q => 
    q &&
    typeof q.id !== 'undefined' &&
    typeof q.question === 'string'
  );
}

/**
 * Generates technical mock questions using Gemini based on role profile parameters.
 */
export const generateQuestions = async (role, experience, difficulty, totalQuestions = 5) => {
  try {
    const prompt = buildQuestionPrompt(role, experience, difficulty, totalQuestions);
    const result = await callGeminiModel(prompt, true);
    
    if (validateQuestionsSchema(result)) {
      return result;
    }
  } catch (err) {
    console.warn(`⚠️ [questionGenerator] Gemini API error (${err.message}). Using fallback question set.`);
  }
  
  const fallback = getFallbackQuestions(role, difficulty, '');
  return fallback.slice(0, totalQuestions).map((q, idx) => ({
    id: `q${idx + 1}`,
    question: q.question,
    difficulty: q.difficulty || difficulty,
    topic: q.category || 'Technical',
    expectedAnswerPoints: ['Key concepts and definitions', 'Practical real-world application', 'Trade-offs and architectural impact']
  }));
};

/**
 * Generates tailored interview questions based on parsed candidate resume profile.
 */
export const generateQuestionsFromResume = async (parsedResume, totalQuestions = 5) => {
  try {
    const prompt = buildResumeQuestionPrompt(parsedResume, totalQuestions);
    const result = await callGeminiModel(prompt, true);
    
    if (validateQuestionsSchema(result)) {
      return result;
    }
  } catch (err) {
    console.warn(`⚠️ [questionGenerator] Gemini API error (${err.message}). Using fallback resume question set.`);
  }

  const skills = Array.isArray(parsedResume?.skills) ? parsedResume.skills.join(', ') : 'software development';

  return [
    {
      id: 'q1',
      question: `Walk me through the key projects listed on your resume, specifically highlighting your work with ${skills}.`,
      difficulty: 'medium',
      topic: 'Resume Deep Dive',
      expectedAnswerPoints: ['Project scope and responsibilities', 'Technologies utilized', 'Measurable results achieved']
    },
    {
      id: 'q2',
      question: `Describe a major technical challenge you encountered during your past software development role and how you resolved it.`,
      difficulty: 'medium',
      topic: 'Problem Solving',
      expectedAnswerPoints: ['Root cause identification', 'Engineering decision process', 'Outcome and prevention']
    },
    {
      id: 'q3',
      question: `How do you approach designing scalable and maintainable architectures for your software applications?`,
      difficulty: 'hard',
      topic: 'System Design',
      expectedAnswerPoints: ['Modular design principles', 'Data flow and caching', 'Error handling and resilience']
    },
    {
      id: 'q4',
      question: `Describe a situation where you had to quickly learn a new technology or tool to deliver a project milestone.`,
      difficulty: 'easy',
      topic: 'Behavioral',
      expectedAnswerPoints: ['Learning approach and resources', 'Speed of adoption', 'Successful project integration']
    },
    {
      id: 'q5',
      question: `What automated testing or code review practices do you enforce to maintain code quality?`,
      difficulty: 'medium',
      topic: 'Code Quality',
      expectedAnswerPoints: ['Unit/integration testing strategy', 'CI/CD pipeline automation', 'Peer review guidelines']
    }
  ].slice(0, totalQuestions);
};

