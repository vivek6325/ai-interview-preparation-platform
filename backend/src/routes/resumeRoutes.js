import express from 'express';
import { uploadResume } from '../middleware/uploadResume.js';
import { uploadResumeFile } from '../controllers/resumeController.js';
import { parseResume } from '../controllers/resumeParserController.js';
import { extractResumeInfo } from '../controllers/resumeExtractorController.js';

/**
 * Resume Router
 * Configures endpoints for candidate resume uploads, text parsing, and AI structured data extraction.
 */
const router = express.Router();

/**
 * Middleware wrapper allowing optional file upload for POST /extract
 * (Supports both JSON payload `{ text: "..." }` and multipart file upload).
 */
const optionalUploadResume = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return uploadResume(req, res, next);
  }
  next();
};

/**
 * @route   POST /api/resume/upload
 * @desc    Upload candidate resume (PDF or DOCX, max 5 MB)
 * @access  Public
 */
router.post('/upload', uploadResume, uploadResumeFile);

/**
 * @route   POST /api/resume/parse
 * @desc    Upload & parse candidate resume into plain text, character count, and word count
 * @access  Public
 */
router.post('/parse', uploadResume, parseResume);

/**
 * @route   POST /api/resume/extract
 * @desc    Extract structured candidate profile JSON (skills, experience, education, projects) from text or resume file using Gemini AI
 * @access  Public
 */
router.post('/extract', optionalUploadResume, extractResumeInfo);

export default router;
