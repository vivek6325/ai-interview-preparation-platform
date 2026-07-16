import { callGeminiModel } from './geminiClient.js';
import { buildQuestionPrompt, buildResumeQuestionPrompt } from './prompts.js';

/**
 * Validates the structure of the question array returned by Gemini.
 * Each item must contain id, question, difficulty, topic, and expectedAnswerPoints.
 */
function validateQuestionsSchema(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return false;
  return questions.every(q => 
    q &&
    typeof q.id !== 'undefined' &&
    typeof q.question === 'string' &&
    typeof q.difficulty === 'string' &&
    typeof q.topic === 'string' &&
    Array.isArray(q.expectedAnswerPoints)
  );
}

/**
 * Generates technical mock questions using Gemini based on role profile parameters.
 */
export const generateQuestions = async (role, experience, difficulty, totalQuestions = 5) => {
  const prompt = buildQuestionPrompt(role, experience, difficulty, totalQuestions);
  
  let result = null;
  let attempts = 0;
  
  while (attempts < 2) {
    try {
      attempts++;
      result = await callGeminiModel(prompt, true);
      
      if (validateQuestionsSchema(result)) {
        return result;
      }
      console.warn(`Attempt ${attempts} returned invalid JSON schema for questions. Retrying...`);
    } catch (err) {
      if (attempts >= 2) throw err;
      console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying...`);
    }
  }
  
  throw new Error('Gemini failed to return valid JSON matching the interview questions schema.');
};

/**
 * Generates tailored interview questions based on parsed candidate resume profile.
 */
export const generateQuestionsFromResume = async (parsedResume, totalQuestions = 5) => {
  const prompt = buildResumeQuestionPrompt(parsedResume, totalQuestions);
  
  let result = null;
  let attempts = 0;
  
  while (attempts < 2) {
    try {
      attempts++;
      result = await callGeminiModel(prompt, true);
      
      if (validateQuestionsSchema(result)) {
        return result;
      }
      console.warn(`Attempt ${attempts} returned invalid JSON schema for resume questions. Retrying...`);
    } catch (err) {
      if (attempts >= 2) throw err;
      console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying...`);
    }
  }
  
  throw new Error('Gemini failed to return valid JSON matching the resume questions schema.');
};
