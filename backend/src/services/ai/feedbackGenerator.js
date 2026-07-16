import { callGeminiModel } from './geminiClient.js';
import { buildFeedbackPrompt, buildInterviewReportPrompt } from './prompts.js';

/**
 * Validates the schema of the feedback returned by Gemini.
 */
function validateFeedbackSchema(feedback) {
  if (!feedback || typeof feedback !== 'object') return false;
  return (
    typeof feedback.overallScore === 'number' &&
    typeof feedback.technicalAccuracy === 'number' &&
    typeof feedback.communication === 'number' &&
    Array.isArray(feedback.missingConcepts) &&
    Array.isArray(feedback.strengths) &&
    Array.isArray(feedback.weaknesses) &&
    Array.isArray(feedback.suggestions) &&
    typeof feedback.difficultyAssessment === 'string'
  );
}

/**
 * Validates the schema of the overall interview report returned by Gemini.
 */
function validateInterviewReportSchema(report) {
  if (!report || typeof report !== 'object') return false;
  return (
    typeof report.overallScore === 'number' &&
    typeof report.technicalRating === 'number' &&
    typeof report.communicationRating === 'number' &&
    typeof report.confidenceRating === 'number' &&
    Array.isArray(report.topStrengths) &&
    Array.isArray(report.improvementAreas) &&
    Array.isArray(report.recommendedTopics) &&
    typeof report.hiringRecommendation === 'string'
  );
}

/**
 * Evaluates candidate response using the Gemini model.
 */
export const generateFeedback = async (question, answer, expectedAnswerPoints) => {
  const prompt = buildFeedbackPrompt(question, answer, expectedAnswerPoints);
  
  let result = null;
  let attempts = 0;
  
  while (attempts < 2) {
    try {
      attempts++;
      result = await callGeminiModel(prompt, true);
      
      if (validateFeedbackSchema(result)) {
        return result;
      }
      console.warn(`Attempt ${attempts} returned invalid JSON schema for response feedback. Retrying...`);
    } catch (err) {
      if (attempts >= 2) throw err;
      console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying...`);
    }
  }
  
  throw new Error('Gemini failed to return valid JSON matching the response feedback schema.');
};

/**
 * Evaluates an entire interview session to generate a comprehensive hiring scorecard.
 */
export const generateInterviewReport = async (interviewData) => {
  const prompt = buildInterviewReportPrompt(interviewData);
  
  let result = null;
  let attempts = 0;
  
  while (attempts < 2) {
    try {
      attempts++;
      result = await callGeminiModel(prompt, true);
      
      if (validateInterviewReportSchema(result)) {
        return result;
      }
      console.warn(`Attempt ${attempts} returned invalid JSON schema for overall report. Retrying...`);
    } catch (err) {
      if (attempts >= 2) throw err;
      console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying...`);
    }
  }
  
  throw new Error('Gemini failed to return valid JSON matching the overall interview report schema.');
};
