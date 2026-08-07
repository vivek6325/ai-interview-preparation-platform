import express from 'express';
import { uploadResume } from '../middleware/uploadResume.js';
import {
  uploadResumeFile,
  saveResume,
  getResumes,
  getResumeById,
  deleteResume
} from '../controllers/resumeController.js';
import { parseResume } from '../controllers/resumeParserController.js';
import { extractResumeInfo } from '../controllers/resumeExtractorController.js';
import { generateResumeQuestionsController } from '../controllers/questionGeneratorController.js';

/**
 * Resume Router
 * Configures endpoints for candidate resume uploads, text parsing, AI structured data extraction,
 * personalized question generation, MongoDB persistence, and history management.
 */
const router = express.Router();

/**
 * Middleware wrapper allowing optional file upload for POST /extract
 */
const optionalUploadResume = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return uploadResume(req, res, next);
  }
  next();
};

/**
 * @route   POST /api/resume/upload
 * @desc    Upload candidate resume file (PDF or DOCX, max 5 MB)
 */
router.post('/upload', uploadResume, uploadResumeFile);

/**
 * @route   POST /api/resume/parse
 * @desc    Upload & parse candidate resume into plain text, character count, and word count
 */
router.post('/parse', uploadResume, parseResume);

/**
 * @route   POST /api/resume/extract
 * @desc    Extract structured candidate profile JSON using Gemini AI
 */
router.post('/extract', optionalUploadResume, extractResumeInfo);

/**
 * @route   POST /api/resume/questions
 * @desc    Generate 15-20 personalized interview questions based on structured resume JSON
 */
router.post('/questions', generateResumeQuestionsController);

/**
 * @route   POST /api/resume/save
 * @desc    Save or update candidate resume metadata and questions in MongoDB
 */
router.post('/save', saveResume);

/**
 * @route   GET /api/resume
 * @desc    Fetch all uploaded candidate resumes for history view
 */
router.get('/', getResumes);

/**
 * @route   GET /api/resume/:id
 * @desc    Fetch single candidate resume details by ID
 */
router.get('/:id', getResumeById);

/**
 * @route   DELETE /api/resume/:id
 * @desc    Delete resume record from MongoDB and delete binary file from disk
 */
router.delete('/:id', deleteResume);

export default router;
