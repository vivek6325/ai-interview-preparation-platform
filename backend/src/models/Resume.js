import mongoose from 'mongoose';

/**
 * Resume Model Schema
 * Stores candidate upload metadata, raw parsed text, structured AI extraction,
 * generated interview questions, and overall session status.
 */
const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    storedFileName: {
      type: String,
      required: [true, 'Stored file name is required'],
      trim: true,
      index: true
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      uppercase: true,
      enum: {
        values: ['PDF', 'DOCX'],
        message: '{VALUE} is not a supported file type'
      }
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    parsedText: {
      type: String,
      default: ''
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    interviewQuestions: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    interviewMode: {
      type: String,
      default: 'resume'
    },
    status: {
      type: String,
      default: 'extracted',
      enum: {
        values: ['parsed', 'extracted', 'questions_generated', 'completed'],
        message: '{VALUE} is not a valid resume status'
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast history queries and user aggregation
ResumeSchema.index({ userId: 1, createdAt: -1 });
ResumeSchema.index({ userId: 1, status: 1 });

const Resume = mongoose.model('Resume', ResumeSchema);
export default Resume;
