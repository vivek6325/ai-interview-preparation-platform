import express from 'express';
import { uploadResume } from '../middleware/uploadResume.js';
import { uploadResumeFile } from '../controllers/resumeController.js';
import { parseResume } from '../controllers/resumeParserController.js';

/**
 * Resume Router
 * Configures endpoints for candidate resume uploads and text parsing.
 */
const router = express.Router();

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

export default router;
