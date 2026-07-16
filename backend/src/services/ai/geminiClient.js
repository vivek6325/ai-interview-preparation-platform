import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export const getGeminiClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in backend environment variables.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Reusable wrapper to call the Gemini model with a retry policy (runs up to 2 times).
 * @param {string} prompt - Prompt to pass to Gemini
 * @param {boolean} isJson - Parse response as JSON
 * @returns {Promise<any>} Response text or parsed JSON object
 */
export const callGeminiModel = async (prompt, isJson = true) => {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
  });

  let attempt = 0;
  const MAX_RETRIES = 2; // Fulfills 'Retry once' rule

  while (attempt < MAX_RETRIES) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      if (isJson) {
        // Remove potential markdown wrappers if returned
        const cleanedText = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        return JSON.parse(cleanedText);
      }
      return text;
    } catch (error) {
      attempt++;
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      console.warn(`⚠️ Gemini API call failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in 1.5s...`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
};
