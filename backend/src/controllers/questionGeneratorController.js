import { generatePersonalizedQuestions } from '../services/questionGenerator.js';

/**
 * Question Generator Controller
 * Handles POST /api/resume/questions requests to generate personalized interview questions.
 */

/**
 * Handles POST /api/resume/questions
 * Consumes candidate resume JSON payload and returns 15-20 personalized AI questions.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function generateResumeQuestionsController(req, res, next) {
  try {
    const resumeData = req.body?.resumeData || req.body;

    if (!resumeData || typeof resumeData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Unable to generate personalized interview questions.'
      });
    }

    const questions = await generatePersonalizedQuestions(resumeData);

    return res.status(200).json({
      success: true,
      questions
    });
  } catch (err) {
    console.error('❌ [Question Generator Controller] Failure:', err.message);

    // Return exact specified failure response format
    return res.status(400).json({
      success: false,
      message: 'Unable to generate personalized interview questions.'
    });
  }
}

export default {
  generateResumeQuestionsController
};
