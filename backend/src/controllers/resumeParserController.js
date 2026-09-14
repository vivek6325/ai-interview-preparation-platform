import { parseResumeFile } from '../services/resumeParser.js';

/**
 * Resume Parser Controller
 * Handles HTTP requests to parse candidate resumes (PDF & DOCX) into plain text.
 */

/**
 * Handles POST /api/resume/parse
 * Accepts an uploaded file from uploadResume middleware, extracts raw text using resumeParser,
 * and returns character and word metrics.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function parseResume(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Unable to parse resume.'
      });
    }

    // Process resume file using Resume Parsing Engine service
    const parsedData = await parseResumeFile(file.path, file.originalname);

    return res.status(200).json({
      success: true,
      text: parsedData.text,
      characterCount: parsedData.characterCount,
      wordCount: parsedData.wordCount
    });
  } catch (err) {
    console.error('❌ [Resume Parser Controller] Parsing Failure:', err.message);

    // Return exact specified failure response format
    return res.status(400).json({
      success: false,
      message: 'Unable to parse resume.'
    });
  }
}

export default {
  parseResume
};
