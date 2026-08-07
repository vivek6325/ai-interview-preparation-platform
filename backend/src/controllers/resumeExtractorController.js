import { extractResumeData } from '../services/resumeExtractor.js';
import { parseResumeFile } from '../services/resumeParser.js';

/**
 * Resume Extractor Controller
 * Handles HTTP requests to extract structured candidate information from resume text.
 */

/**
 * Handles POST /api/resume/extract
 * Extracts structured JSON candidate data from raw resume text or attached file.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function extractResumeInfo(req, res, next) {
  try {
    let resumeText = req.body?.text;

    // If a file was attached via uploadResume middleware, parse text first
    if (!resumeText && req.file) {
      const parsedData = await parseResumeFile(req.file.path, req.file.originalname);
      resumeText = parsedData.text;
    }

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Unable to extract structured resume information.'
      });
    }

    // Call AI Resume Extractor Service
    const extractedData = await extractResumeData(resumeText);

    return res.status(200).json({
      success: true,
      data: extractedData
    });
  } catch (err) {
    console.error('❌ [Resume Extractor Controller] Failure:', err.message);

    // Return exact specified failure response format
    return res.status(400).json({
      success: false,
      message: 'Unable to extract structured resume information.'
    });
  }
}

export default {
  extractResumeInfo
};
