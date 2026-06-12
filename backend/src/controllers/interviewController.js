import Interview from '../models/Interview.js';

/**
 * Controller to handle operations related to Interviews.
 */

/**
 * @desc    Create a new interview session
 * @route   POST /api/interviews
 * @access  Public (for now)
 */
export const createInterview = async (req, res) => {
  try {
    const { title, role, difficulty, questions } = req.body;

    // Basic request body validation before sending to Mongoose
    if (!title || !role || !difficulty) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: title, role, and difficulty.',
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'An interview session must contain at least one question.',
      });
    }

    // Create a new instance of the Interview model
    const newInterview = new Interview({
      title,
      role,
      difficulty,
      questions,
    });

    // Save the document to the MongoDB database
    const savedInterview = await newInterview.save();

    // Respond with 201 Created status and the saved document
    res.status(201).json({
      status: 'success',
      data: {
        interview: savedInterview,
      },
    });
  } catch (error) {
    // If it is a Mongoose validation error, return 400 Bad Request
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: messages,
      });
    }

    // Otherwise, return 500 Internal Server Error
    console.error('Error creating interview:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while creating the interview.',
    });
  }
};
