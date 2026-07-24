import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts raw text content from a PDF file path or buffer.
 * Compatible with Node.js 22 and ES Modules.
 * 
 * @param {string|Buffer} input - File path or Buffer of the PDF file.
 * @returns {Promise<string>} Extracted text string from the PDF document.
 */
export async function extractTextFromPDF(input) {
  try {
    let dataBuffer;
    if (typeof input === 'string') {
      dataBuffer = fs.readFileSync(input);
    } else if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else {
      throw new Error('Invalid input for PDF parsing. Expected a file path string or Buffer.');
    }

    const data = await pdf(dataBuffer);
    const extractedText = data && data.text ? data.text.trim() : '';

    if (!extractedText) {
      console.warn('⚠️ [PDF Parser] Document parsed successfully but contains no extractable text layer.');
    } else {
      console.log(`📄 [PDF Parser] Extracted ${extractedText.length} characters from PDF.`);
    }

    return extractedText;
  } catch (error) {
    console.error('❌ [PDF Parser] Error extracting text from PDF file:', error);
    throw new Error(`Failed to extract text from PDF file: ${error.message}`);
  }
}

export default extractTextFromPDF;
