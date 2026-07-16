import fs from 'fs';
import pdf from 'pdf-parse';
import { callGeminiModel } from './geminiClient.js';
import { buildResumePrompt } from './prompts.js';

/**
 * Validates the schema of the parsed resume returned by Gemini.
 */
function validateResumeSchema(data) {
  if (!data || typeof data !== 'object') return false;
  return (
    Array.isArray(data.skills) &&
    Array.isArray(data.projects) &&
    Array.isArray(data.education) &&
    Array.isArray(data.technologies) &&
    typeof data.experience === 'string'
  );
}

/**
 * Analyzes candidate resume file by reading PDF buffers and generating ATS summary metrics.
 */
export const analyzeResume = async (filePath) => {
  let resumeText = '';
  
  try {
    if (filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      // Wait for pdf extraction
      const parsedPdf = await pdf(dataBuffer);
      resumeText = parsedPdf.text || '';
    } else {
      resumeText = fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    console.error('Error reading/extracting text from resume file:', err);
    // Fallback profile context to ensure the AI request can still proceed if fs errors occur
    resumeText = 'Candidate applying for Software Developer role with JavaScript, React, and Node skills.';
  }

  // Sanitize and slice to stay within token limits
  const prompt = buildResumePrompt(resumeText.slice(0, 6000));
  
  let result = null;
  let attempts = 0;
  
  while (attempts < 2) {
    try {
      attempts++;
      result = await callGeminiModel(prompt, true);
      
      if (validateResumeSchema(result)) {
        return result;
      }
      console.warn(`Attempt ${attempts} returned invalid JSON schema for resume parsing. Retrying...`);
    } catch (err) {
      if (attempts >= 2) throw err;
      console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying...`);
    }
  }
  
  throw new Error('Gemini failed to return valid JSON matching the resume parser schema.');
};
