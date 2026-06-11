import mongoose from 'mongoose';

/**
 * Sub-schema for individual questions within an interview session.
 * Each question tracks the prompt text, the user's answer, and AI feedback.
 */
const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  userAnswer: {
    type: String,
    default: '',
    trim: true,
  },
  feedback: {
    type: String,
    default: '',
    trim: true,
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot exceed 100'],
    default: null,
  },
});

/**
 * Main Interview Session Schema.
 * Tracks user configuration and overall interview session state.
 */
const InterviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty level',
      },
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'An interview session must contain at least one question.',
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the Mongoose model
const Interview = mongoose.model('Interview', InterviewSchema);
export default Interview;
