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
  strength: {
    type: String,
    default: '',
    trim: true,
  },
  improvement: {
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
  topic: {
    type: String,
    default: '',
    trim: true,
  },
  expectedAnswerPoints: {
    type: [String],
    default: [],
  },
});

/**
 * Main Interview Session Schema.
 * Tracks user configuration and overall interview session state.
 */
const InterviewSchema = new mongoose.Schema(
  {
    // User association (optional for backward compatibility, referencing User model)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
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
      trim: true,
      lowercase: true, // Automatically normalizes "Medium" -> "medium", "Easy" -> "easy", "Hard" -> "hard"
      enum: {
        values: ['easy', 'medium', 'hard'],
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
    // New fields requested for Step 5
    answers: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: null,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      default: 0,
    },
    // Existing fields for backward compatibility with controllers and UI
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    overallScore: {
      type: Number,
      min: [0, 'Overall score cannot be less than 0'],
      max: [100, 'Overall score cannot exceed 100'],
      default: null,
    },
    overallFeedback: {
      type: String,
      default: '',
      trim: true,
    },
    grade: {
      type: String,
      default: '',
      trim: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    resumeSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    overallReport: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
