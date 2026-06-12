import mongoose from 'mongoose';
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

/**
 * @desc    Get all interview sessions
 * @route   GET /api/interviews
 * @access  Public (for now)
 */
export const getInterviews = async (req, res) => {
  try {
    // Fetch interviews, sorted by newest first (createdAt: -1)
    const interviews = await Interview.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: interviews.length,
      data: {
        interviews,
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while fetching interviews.',
    });
  }
};

/**
 * @desc    Get a single interview session by ID
 * @route   GET /api/interviews/:id
 * @access  Public (for now)
 */
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid interview ID format.',
      });
    }

    const interview = await Interview.findById(id);

    // If the interview document is not found, return 404
    if (!interview) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Error fetching interview by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while fetching the interview.',
    });
  }
};

/**
 * @desc    Update a single interview session (PATCH)
 * @route   PATCH /api/interviews/:id
 * @access  Public (for now)
 */
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid interview ID format.',
      });
    }

    // Find and update the interview document.
    // { new: true } returns the updated document rather than the old one.
    // { runValidators: true } runs schema validation on the updated fields.
    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // If the interview document is not found, return 404
    if (!updatedInterview) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        interview: updatedInterview,
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

    console.error('Error updating interview:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while updating the interview.',
    });
  }
};

/**
 * @desc    Delete a single interview session by ID
 * @route   DELETE /api/interviews/:id
 * @access  Public (for now)
 */
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid interview ID format.',
      });
    }

    const deletedInterview = await Interview.findByIdAndDelete(id);

    // If the interview document is not found, return 404
    if (!deletedInterview) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found.',
      });
    }

    // Standard REST response for DELETE is either 204 No Content or 200/202 with confirmation JSON
    // We send 200 with a success message as it is user-friendly for API consumption confirmation
    res.status(200).json({
      status: 'success',
      message: 'Interview session successfully deleted.',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while deleting the interview.',
    });
  }
};
