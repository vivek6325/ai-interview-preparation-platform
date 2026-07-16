import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { 
  generateSession, 
  evaluateSession,
  generateQuestionsController,
  resumeUploadController,
  evaluateFeedbackController,
  generateInterviewReportController
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

// Setup upload folder configuration
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

/**
 * Route: POST /api/ai/generate
 * Description: Dynamically generates interview questions using Gemini and stores them in MongoDB
 * Access: Private
 */
router.post('/generate', protect, generateSession);

/**
 * Route: POST /api/ai/evaluate
 * Description: Evaluates candidate answers using Gemini and saves the scorecard/feedback to MongoDB
 * Access: Private
 */
router.post('/evaluate', protect, evaluateSession);

/**
 * Route: POST /api/ai/questions
 * Description: Generates a list of mock questions depending on role, experience, difficulty
 * Access: Private
 */
router.post('/questions', protect, generateQuestionsController);

/**
 * Route: POST /api/ai/resume
 * Description: Uploads and extracts parsed metrics from candidate resume
 * Access: Private
 */
router.post('/resume', protect, upload.single('resume'), resumeUploadController);

/**
 * Route: POST /api/ai/feedback
 * Description: Evaluates a candidate's answer for a single question
 * Access: Private
 */
router.post('/feedback', protect, evaluateFeedbackController);

/**
 * Route: POST /api/ai/interview-report
 * Description: Generates a comprehensive hiring scorecard overall report
 * Access: Private
 */
router.post('/interview-report', protect, generateInterviewReportController);

export default router;