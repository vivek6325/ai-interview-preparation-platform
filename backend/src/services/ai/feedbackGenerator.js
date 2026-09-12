import { callGeminiModel } from './geminiClient.js';
import { buildFeedbackPrompt, buildInterviewReportPrompt, buildCommunicationFeedbackPrompt } from './prompts.js';

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
 * Validates the schema of the communication feedback returned by Gemini.
 */
function validateCommunicationFeedbackSchema(data) {
  if (!data || typeof data !== 'object') return false;
  return (
    typeof data.communicationQualityScore === 'number' &&
    typeof data.overallAssessment === 'string' &&
    Array.isArray(data.strengths) &&
    (Array.isArray(data.areasToImprove) || Array.isArray(data.weaknesses)) &&
    (Array.isArray(data.recommendations) || Array.isArray(data.suggestions))
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

/**
 * Generates personalized AI communication quality score and feedback.
 */
export const generateCommunicationFeedback = async (transcript, analytics = {}, question = '') => {
  const prompt = buildCommunicationFeedbackPrompt(transcript, analytics, question);
  
  let result = null;
  let attempts = 0;
  
  while (attempts < 2) {
    try {
      attempts++;
      result = await callGeminiModel(prompt, true);
      
      if (validateCommunicationFeedbackSchema(result)) {
        return {
          communicationQualityScore: Math.min(100, Math.max(0, result.communicationQualityScore ?? 80)),
          clarity: Math.min(100, Math.max(0, result.clarity ?? 80)),
          directness: Math.min(100, Math.max(0, result.directness ?? 80)),
          coherence: Math.min(100, Math.max(0, result.coherence ?? 80)),
          professionalism: Math.min(100, Math.max(0, result.professionalism ?? 80)),
          overallAssessment: result.overallAssessment || '',
          strengths: Array.isArray(result.strengths) ? result.strengths : [],
          areasToImprove: Array.isArray(result.areasToImprove) ? result.areasToImprove : (Array.isArray(result.weaknesses) ? result.weaknesses : []),
          recommendations: Array.isArray(result.recommendations) ? result.recommendations : (Array.isArray(result.suggestions) ? result.suggestions : [])
        };
      }
      console.warn(`Attempt ${attempts} returned invalid JSON schema for communication feedback. Retrying...`);
    } catch (err) {
      if (attempts >= 2) throw err;
      console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying...`);
    }
  }
  
  throw new Error('Gemini failed to return valid JSON matching the communication feedback schema.');
};

