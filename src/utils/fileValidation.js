/**
 * Utility functions for resume file validation and formatting.
 * Purpose: Provides centralized validation logic for file extensions, size limits (5 MB),
 * mime types, and human-readable file size formatting.
 */

// Maximum allowed file size in bytes (5 MB)
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed file extensions
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

/**
 * Formats a numeric byte size into a human-readable string (e.g. 1.2 MB, 450 KB).
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i === 0) return `${bytes} B`;
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Extracts lowercase file extension from a filename.
 * @param {string} fileName - Name of the file
 * @returns {string} Extension with leading dot (e.g., '.pdf')
 */
export function getFileExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') return '';
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return fileName.slice(lastDotIndex).toLowerCase();
}

/**
 * Validates a resume file against format (.pdf, .docx) and size (<= 5 MB) constraints.
 * @param {File} file - Browser File object
 * @returns {{ isValid: boolean, error?: string, fileDetails?: Object }} Validation result object
 */
export function validateResumeFile(file) {
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided. Please select a resume file.'
    };
  }

  const extension = getFileExtension(file.name);
  const isExtensionValid = ALLOWED_EXTENSIONS.includes(extension);
  const isMimeValid = file.type ? ALLOWED_MIME_TYPES.includes(file.type) : true;

  if (!isExtensionValid && !isMimeValid) {
    return {
      isValid: false,
      error: `Invalid format (${extension || 'unknown'}). Only PDF and DOCX files are allowed.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const formattedSize = formatFileSize(file.size);
    const formattedMax = formatFileSize(MAX_FILE_SIZE_BYTES);
    return {
      isValid: false,
      error: `File size (${formattedSize}) exceeds the maximum allowed limit of ${formattedMax}.`
    };
  }

  return {
    isValid: true,
    error: null,
    fileDetails: {
      name: file.name,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      type: file.type,
      extension: extension.replace('.', '').toUpperCase()
    }
  };
}
