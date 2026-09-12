import fs from 'fs';
import { getGeminiClient } from './geminiClient.js';

/**
 * Transcribes an audio file using Gemini AI multimodal capabilities.
 * 
 * @param {string} filePath - Absolute or relative path to the audio file
 * @param {string} mimeType - MIME type of the audio file (e.g. 'audio/webm', 'audio/wav', 'audio/mp3')
 * @returns {Promise<string>} Transcribed text string
 */
export const transcribeAudioFile = async (filePath, mimeType = 'audio/webm') => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Audio file not found for transcription.');
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    throw new Error('Recorded audio file is empty.');
  }

  const audioBuffer = fs.readFileSync(filePath);
  const base64Audio = audioBuffer.toString('base64');

  const client = getGeminiClient();
  
  // Try gemini-2.5-flash first, fallback to gemini-1.5-flash if needed
  const modelNames = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const modelName of modelNames) {
    try {
      const model = client.getGenerativeModel({ model: modelName });

      const audioPart = {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType || 'audio/webm'
        }
      };

      const prompt = `Transcribe the spoken words in this audio recording accurately into text. 
Output ONLY the verbatim transcribed text. Do NOT include introductory phrases, conversational fillers, notes, quotes, or markdown formatting around the output text.`;

      const result = await model.generateContent([prompt, audioPart]);
      const response = await result.response;
      const text = response.text() ? response.text().trim() : '';

      return text;
    } catch (err) {
      console.warn(`⚠️ Transcription failed using ${modelName}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || 'Speech-to-text transcription service failed.');
};

export default transcribeAudioFile;
