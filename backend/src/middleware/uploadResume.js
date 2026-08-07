import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Resume Upload Middleware Configuration using Multer.
 *
 * Requirements handled:
 * 1. Creates/verifies 'uploads' directory automatically.
 * 2. Restricts uploads to PDF (.pdf) and DOCX (.docx) files.
 * 3. Enforces 5 MB maximum file size limit.
 * 4. Generates unique filenames (timestamp + random suffix + original extension).
 * 5. Provides clean error handling for missing files, invalid types, and size limits.
 */

// Target directory for uploaded candidate resumes
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Verify and auto-create the uploads directory if it does not exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 5 MB File Size Limit in bytes
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed file extensions and MIME types
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

/**
 * Multer Disk Storage Configuration
 * Saves files to local uploads directory with unique timestamped filenames.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists prior to saving
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    
    cb(null, `resume_${sanitizedBase}_${uniqueSuffix}${ext}`);
  }
});

/**
 * Multer File Filter
 * Restricts uploaded files to valid PDF or DOCX formats.
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeAllowed = file.mimetype ? ALLOWED_MIME_TYPES.includes(file.mimetype) : true;

  if (isExtensionAllowed && isMimeAllowed) {
    return cb(null, true);
  }

  const customError = new Error(
    `Invalid file type (${ext || 'unknown'}). Only PDF (.pdf) and DOCX (.docx) files are allowed.`
  );
  customError.code = 'INVALID_FILE_TYPE';
  return cb(customError, false);
};

// Initialize Multer instance with single 'resume' field
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
}).single('resume');

/**
 * Reusable Express Middleware: uploadResume
 * Intercepts Multer single file upload errors and returns structured JSON error responses.
 */
export function uploadResume(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      // Handle Multer-specific errors (e.g. file size exceeded)
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds maximum allowed limit of 5 MB.',
            error: 'LIMIT_FILE_SIZE'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          error: err.code || 'MULTER_ERROR'
        });
      }

      // Handle custom file filter validation errors
      if (err.code === 'INVALID_FILE_TYPE' || err.message?.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          message: err.message,
          error: 'INVALID_FILE_TYPE'
        });
      }

      // Handle unexpected system/storage errors
      return res.status(500).json({
        success: false,
        message: err.message || 'An unexpected error occurred during resume upload.',
        error: 'UPLOAD_FAILED'
      });
    }

    // Validate that a file was attached in the 'resume' field
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided. Please attach a PDF or DOCX file in the "resume" form-data field.',
        error: 'MISSING_FILE'
      });
    }

    next();
  });
}

export default uploadResume;
