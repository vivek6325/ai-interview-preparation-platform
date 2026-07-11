import Interview from '../models/Interview.js';
import { generateInterviewQuestions, evaluateInterviewAnswers } from '../services/aiService.js';

/**
 * Handles creation and dynamic question generation for an interview.
 * POST /api/ai/generate
 */
export const generateSession = async (req, res) => {
  try {
    const { role, difficulty, experience, technologies } = req.body;

    if (!role || !difficulty || !experience) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide role, difficulty, and experience levels.',
      });
    }

    // Call Gemini API service to generate questions
    const questionsList = await generateInterviewQuestions({
      role,
      difficulty,
      experience,
      technologies,
    });

    if (!questionsList || !Array.isArray(questionsList) || questionsList.length === 0) {
      throw new Error('Gemini API returned an empty or malformed questions list.');
    }

    // Create and save a new pending Interview document in MongoDB
    const newInterview = new Interview({
      title: `${role} AI Interview`,
      role,
      difficulty: difficulty.toLowerCase(),
      status: 'pending',
      questions: questionsList.map((q) => ({
        questionText: q.question,
        userAnswer: '',
        score: null,
        feedback: '',
        strength: '',
        improvement: '',
      })),
    });

    const savedInterview = await newInterview.save();

    res.status(201).json({
      status: 'success',
      data: {
        interviewId: savedInterview._id,
      },
    });
  } catch (error) {
    console.error('Error generating AI interview:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred during AI interview generation.',
    });
  }
};

/**
 * Evaluates candidate responses for an interview session using AI.
 * POST /api/ai/evaluate
 */
export const evaluateSession = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide interviewId.',
      });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found in the database.',
      });
    }

    // Update answers in memory if provided in request body
    if (answers && Array.isArray(answers)) {
      answers.forEach((ans, idx) => {
        if (interview.questions[idx]) {
          interview.questions[idx].userAnswer = ans;
        }
      });
    }

    // Prepare questions with answers for Gemini API evaluation request
    const questionsWithAnswers = interview.questions.map((q) => ({
      questionText: q.questionText,
      userAnswer: q.userAnswer || 'No response provided.',
    }));

    // Call Gemini API to evaluate responses
    const evaluation = await evaluateInterviewAnswers(questionsWithAnswers);

    // Save evaluation outcomes to Mongoose document
    interview.questions.forEach((q, idx) => {
      const evalItem = evaluation.questions[idx] || {};
      q.score = evalItem.score ?? 0;
      q.feedback = evalItem.feedback ?? '';
      q.strength = evalItem.strength ?? '';
      q.improvement = evalItem.improvement ?? '';
    });

    interview.overallScore = evaluation.overallScore ?? 0;
    interview.overallFeedback = evaluation.overallFeedback ?? '';
    interview.grade = evaluation.grade ?? 'Needs Development';
    interview.strengths = evaluation.strengths ?? [];
    interview.improvements = evaluation.improvements ?? [];
    interview.status = 'completed';

    const savedInterview = await interview.save();

    res.status(200).json({
      status: 'success',
      data: {
        interview: savedInterview,
      },
    });
  } catch (error) {
    console.error('Error evaluating AI interview responses:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred during AI interview evaluation.',
    });
  }
};
