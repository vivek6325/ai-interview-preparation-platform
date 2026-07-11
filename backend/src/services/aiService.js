import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Initializes and retrieves the Google Generative AI SDK client.
 * Uses GEMINI_API_KEY from environment variables.
 */
function getAIClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in backend environment variables.'
      );
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Calls Gemini API with retry logic and JSON validation helper.
 * Automatically retries transient failures such as
 * HTTP 503 (Service Unavailable) using exponential backoff.
 *
 * @param {string} prompt - Prompt to send.
 * @param {boolean} isJsonResponse - Whether to validate and parse output as JSON.
 * @returns {Promise<any>} Response text or parsed JSON object.
 */
async function callGemini(prompt, isJsonResponse = true) {
  const client = getAIClient();

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: isJsonResponse
      ? {
        responseMimeType: 'application/json',
      }
      : undefined,
  });

  let attempt = 0;
  const MAX_RETRIES = 3;

  while (attempt < MAX_RETRIES) {
    try {
      // Send prompt to Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (isJsonResponse) {
        // Strip markdown code block wraps if present
        const cleanedText = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        return JSON.parse(cleanedText);
      }

      return text;
    } catch (error) {
      attempt++;

      // Stop retrying after reaching the maximum retry count
      if (attempt >= MAX_RETRIES) {
        throw error;
      }

      // Exponential backoff
      // Attempt 1 -> Wait 2 seconds
      // Attempt 2 -> Wait 4 seconds
      // Attempt 3 -> Throw error
      const delay = attempt * 2000;

      console.warn(
        `⚠️ Gemini API call failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Dynamically generates 10 interview questions based on candidate profile.
 *
 * @param {Object} params - Candidate criteria
 * @returns {Promise<Array>} List of questions matching schema
 */
export async function generateInterviewQuestions({
  role,
  difficulty,
  experience,
  technologies,
}) {
  const prompt = `You are a professional technical interviewer. Generate exactly 10 interview questions for a candidate with the following profile:
- Target Role: ${role}
- Experience Level: ${experience} years
- Difficulty Rating: ${difficulty}
- Core Technologies: ${technologies || 'General software engineering principles'
    }

The questions must be structured as a JSON array of objects. Do not include formatting like markdown wraps. The output must strictly match this JSON schema:
[
  {
    "id": "q1",
    "question": "Detailed question text...",
    "category": "Technical | Behavioral | System Design",
    "difficulty": "${difficulty}"
  }
]`;

  return await callGemini(prompt, true);
}

/**
 * Evaluates candidate responses for an interview session using AI scoring.
 *
 * @param {Array} questionsWithAnswers - List of question and answer objects
 * @returns {Promise<Object>} Evaluation results matching the database schema
 */
export async function evaluateInterviewAnswers(questionsWithAnswers) {
  const formattedQuestions = questionsWithAnswers
    .map(
      (q, index) =>
        `Question ${index + 1}: ${q.questionText}\nCandidate Answer: ${q.userAnswer || 'No response provided.'
        }`
    )
    .join('\n\n---\n\n');

  const prompt = `You are an AI Interview Evaluator. Critically evaluate the candidate's answers below:

${formattedQuestions}

Analyze each response based on accuracy, depth, and structural organization (such as the STAR method for behavioral questions).

You must return a JSON object, and nothing else. The output must strictly match this schema:
{
  "questions": [
    {
      "questionText": "The original question text...",
      "userAnswer": "The candidate's answer...",
      "score": 8.0,
      "feedback": "Constructive feedback details...",
      "strength": "One specific strength demonstrated in the answer...",
      "improvement": "One concrete area where the answer could be improved..."
    }
  ],
  "overallScore": 8.0,
  "grade": "Expert Candidate | Capable Professional | Needs Development",
  "overallFeedback": "Overall evaluation summary narrative...",
  "strengths": [
    "Overall strength 1",
    "Overall strength 2"
  ],
  "improvements": [
    "Overall improvement 1",
    "Overall improvement 2"
  ]
}

Note:
- Set score out of 10.
- Overall grade should be "Expert Candidate" (score >= 8), "Capable Professional" (score >= 6), or "Needs Development" (score < 6).`;

  return await callGemini(prompt, true);
}