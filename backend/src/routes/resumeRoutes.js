import express from 'express';
import { uploadResume } from '../middleware/uploadResume.js';
import { uploadResumeFile } from '../controllers/resumeController.js';

/**
 * Resume Router
 * Configures endpoints for candidate resume uploads.
 */
const router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload candidate resume (PDF or DOCX, max 5 MB)
 * @access  Public
 */
router.post('/upload', uploadResume, uploadResumeFile);

export default router;
