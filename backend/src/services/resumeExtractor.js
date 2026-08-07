import { callGemini } from './aiService.js';

/**
 * AI-Powered Resume Information Extraction Service
 *
 * Consumes plain text extracted from candidate resumes, sends structured prompts to
 * Gemini AI, parses and validates JSON output, and returns standardized candidate profile data.
 */

/**
 * Safely parses string into JSON, handling code fences or surrounding text.
 *
 * @param {string|Object} rawInput - Raw AI response (string or object)
 * @returns {Object|null} Parsed JSON object or null if invalid
 */
export function safeParseJSON(rawInput) {
  if (!rawInput) return null;
  if (typeof rawInput === 'object') return rawInput;

  try {
    // Strip markdown code block wrappers if present
    let cleaned = rawInput
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Find JSON object bounds
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ [Resume Extractor] JSON Parse Error:', err.message);
    return null;
  }
}

/**
 * Sanitizes and validates extracted resume data to guarantee schema integrity.
 * Ensures all required keys exist with proper data types (strings or arrays).
 *
 * @param {Object} rawObj - Parsed JSON object from AI
 * @returns {Object} Sanitized structured resume data
 */
export function sanitizeExtractedResumeData(rawObj) {
  const data = rawObj && typeof rawObj === 'object' ? rawObj : {};

  const cleanString = (val) => (typeof val === 'string' ? val.trim() : '');
  const cleanArrayOfStrings = (val) =>
    Array.isArray(val) ? val.map(cleanString).filter(Boolean) : [];

  return {
    name: cleanString(data.name),
    email: cleanString(data.email),
    phone: cleanString(data.phone),
    location: cleanString(data.location),
    summary: cleanString(data.summary),
    skills: cleanArrayOfStrings(data.skills),
    technologies: cleanArrayOfStrings(data.technologies),
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj) => ({
          title: cleanString(proj?.title),
          description: cleanString(proj?.description),
          technologies: cleanArrayOfStrings(proj?.technologies)
        }))
      : [],
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp) => ({
          company: cleanString(exp?.company),
          role: cleanString(exp?.role),
          duration: cleanString(exp?.duration),
          description: cleanString(exp?.description)
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((edu) => ({
          institution: cleanString(edu?.institution),
          degree: cleanString(edu?.degree),
          year: cleanString(edu?.year)
        }))
      : [],
    certifications: cleanArrayOfStrings(data.certifications),
    languages: cleanArrayOfStrings(data.languages)
  };
}

/**
 * Extracts structured profile details from raw resume text using Gemini AI.
 *
 * @param {string} resumeText - Plain text content extracted from resume
 * @returns {Promise<Object>} Standardized structured resume profile object
 */
export async function extractResumeData(resumeText) {
  if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
    throw new Error('No resume text provided for extraction.');
  }

  const startTime = Date.now();
  console.log(
    `🤖 [Resume Extractor] Initiating AI structured extraction for text length: ${resumeText.length} chars...`
  );

  const prompt = `You are an expert AI Resume Parsing Engine. Extract structured candidate information from the plain text resume provided below.

RESUME TEXT:
${resumeText}

Extract the details and return ONLY a single valid JSON object matching the exact structure below.
Do NOT include markdown formatting, code fences (such as \`\`\`json), or conversational text.

{
  "name": "Candidate's full name",
  "email": "Candidate's email address",
  "phone": "Candidate's phone number",
  "location": "Candidate's city/state/location",
  "summary": "Brief candidate summary or professional objective",
  "skills": ["List of core soft and technical skills"],
  "technologies": ["List of technical tools, frameworks, databases, and programming languages"],
  "projects": [
    {
      "title": "Project title",
      "description": "Project summary or key highlights",
      "technologies": ["Technologies used in this project"]
    }
  ],
  "experience": [
    {
      "company": "Company or organization name",
      "role": "Job title or position",
      "duration": "Dates or tenure (e.g. Jan 2022 - Present)",
      "description": "Responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "University or institution name",
      "degree": "Degree or field of study",
      "year": "Graduation year or date range"
    }
  ],
  "certifications": ["List of certifications or licenses"],
  "languages": ["List of spoken/written languages"]
}

Important Constraints:
- If any field or detail is not explicitly mentioned in the resume text, return empty string "" or empty array [].
- Do NOT invent, hallucinate, or assume any information not present in the text.
- Preserve original spelling, formatting, and Unicode symbols accurately.`;

  try {
    // Call Gemini AI provider
    const aiResponse = await callGemini(prompt, true);
    const duration = Date.now() - startTime;
    console.log(`🤖 [Resume Extractor] Received AI response in ${duration}ms.`);

    const parsedObj = safeParseJSON(aiResponse);

    if (!parsedObj) {
      console.warn('⚠️ [Resume Extractor] JSON validation failed. Malformed response received.');
      throw new Error('AI provider returned malformed JSON structure.');
    }

    const sanitizedData = sanitizeExtractedResumeData(parsedObj);
    console.log('✅ [Resume Extractor] JSON validation passed successfully.');

    return sanitizedData;
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [Resume Extractor] Extraction failed after ${duration}ms:`,
      err.message
    );
    throw new Error(`Unable to extract structured resume information: ${err.message}`);
  }
}

export default {
  safeParseJSON,
  sanitizeExtractedResumeData,
  extractResumeData
};
