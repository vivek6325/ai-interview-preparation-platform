import fs from 'node:fs';
import path from 'node:path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

/**
 * Resume Parsing Engine Service
 *
 * Provides reusable functions to parse PDF (.pdf) and Word (.docx) candidate resumes,
 * clean and normalize extracted raw text, handle Unicode characters, preserve paragraph
 * boundaries, and calculate character/word count metrics.
 */

/**
 * Cleans and normalizes extracted raw text:
 * 1. Standardizes line breaks (\r\n -> \n).
 * 2. Normalizes multiple horizontal spaces and tabs to a single space.
 * 3. Preserves paragraph breaks by condensing 3+ newlines to double newlines (\n\n).
 * 4. Ensures full Unicode compatibility and removes non-printable control codes.
 * 5. Trims leading and trailing whitespace.
 *
 * @param {string} rawText - Unprocessed raw text extracted from document
 * @returns {string} Normalized, clean text
 */
export function cleanExtractedText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Standardize line endings
    .replace(/\r\n|\r/g, '\n')
    // Remove non-printable control characters except line feeds and tabs
    .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '')
    // Replace horizontal whitespace (spaces/tabs) with a single space
    .replace(/[ \t]+/g, ' ')
    // Collapse multiple consecutive newlines (3+) into paragraph breaks (\n\n)
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing spaces from each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Final trim
    .trim();
}

/**
 * Calculates text metrics (character count and word count).
 *
 * @param {string} text - Cleaned document text
 * @returns {{ characterCount: number, wordCount: number }} Text metrics object
 */
export function calculateTextMetrics(text) {
  if (!text || typeof text !== 'string') {
    return { characterCount: 0, wordCount: 0 };
  }

  const trimmed = text.trim();
  const characterCount = trimmed.length;
  // Split on whitespace sequences to accurately count words
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];

  return {
    characterCount,
    wordCount: words.length
  };
}

/**
 * Parses PDF document buffer using pdf-parse library.
 * Preserves page text layout and handles single or multi-page PDFs.
 *
 * @param {Buffer} dataBuffer - Binary buffer of the PDF file
 * @returns {Promise<string>} Extracted raw PDF text
 */
export async function parsePDFBuffer(dataBuffer) {
  try {
    if (!dataBuffer || dataBuffer.length === 0) {
      throw new Error('PDF file buffer is empty.');
    }
    const parsed = await pdfParse(dataBuffer);
    return parsed.text || '';
  } catch (err) {
    console.error('❌ [Resume Parser Service] PDF Parsing Error:', err.message);
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}

/**
 * Parses DOCX document buffer using mammoth library.
 * Converts Word XML structures into clean plain text.
 *
 * @param {Buffer} dataBuffer - Binary buffer of the DOCX file
 * @returns {Promise<string>} Extracted raw DOCX text
 */
export async function parseDOCXBuffer(dataBuffer) {
  try {
    if (!dataBuffer || dataBuffer.length === 0) {
      throw new Error('DOCX file buffer is empty.');
    }
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value || '';
  } catch (err) {
    console.error('❌ [Resume Parser Service] DOCX Parsing Error:', err.message);
    throw new Error(`Failed to parse DOCX document: ${err.message}`);
  }
}

/**
 * Main Resume Parser Entry Point.
 * Automatically detects file format from file path or extension and extracts text.
 *
 * @param {string} filePath - Absolute or relative local path to uploaded resume file
 * @param {string} [originalName] - Original file name (used for extension detection)
 * @returns {Promise<{ text: string, characterCount: number, wordCount: number }>} Extracted text payload
 */
export async function parseResumeFile(filePath, originalName) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Resume file does not exist on disk.');
  }

  const fileNameToInspect = originalName || filePath;
  const ext = path.extname(fileNameToInspect).toLowerCase();

  // Read binary file buffer from local disk
  const fileBuffer = fs.readFileSync(filePath);
  if (fileBuffer.length === 0) {
    throw new Error('Attached resume file is empty (0 bytes).');
  }

  let rawText = '';

  // File Format Detection & Parsing Dispatch
  if (ext === '.pdf') {
    rawText = await parsePDFBuffer(fileBuffer);
  } else if (ext === '.docx') {
    rawText = await parseDOCXBuffer(fileBuffer);
  } else {
    throw new Error(`Unsupported file format '${ext}'. Only PDF (.pdf) and DOCX (.docx) files are supported.`);
  }

  // Clean and normalize extracted text
  const cleanedText = cleanExtractedText(rawText);

  if (!cleanedText || cleanedText.length === 0) {
    throw new Error('No readable text content could be extracted from the document.');
  }

  // Calculate metrics
  const metrics = calculateTextMetrics(cleanedText);

  return {
    text: cleanedText,
    characterCount: metrics.characterCount,
    wordCount: metrics.wordCount
  };
}

export default {
  cleanExtractedText,
  calculateTextMetrics,
  parsePDFBuffer,
  parseDOCXBuffer,
  parseResumeFile
};
