/**
 * Resume Controller
 * Handles candidate resume upload HTTP endpoints.
 * Returns structured metadata responses ready for future resume parsing and AI extraction.
 */

/**
 * Handles POST /api/resume/upload
 * Process successful resume upload and returns file metadata.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function uploadResumeFile(req, res, next) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file attached.'
      });
    }

    const uploadDate = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      file: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadDate
      }
    });
  } catch (err) {
    console.error('❌ [Resume Controller] Error processing upload:', err);
    next(err);
  }
}

export default {
  uploadResumeFile
};
