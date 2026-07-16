/**
 * Reusable AI Prompts Store
 * Separates prompt templates and token optimization guidelines from business logic.
 */

/**
 * Prompt for general question generation
 */
export const buildQuestionPrompt = (role, experience, difficulty, totalQuestions) => {
  return `You are an expert technical interviewer. Generate exactly ${totalQuestions} interview questions for a candidate with this profile:
- Target Role: ${role}
- Experience level: ${experience}
- Difficulty rating: ${difficulty}

Return a JSON array of objects, and nothing else. Do not wrap in markdown tags. Match this schema:
[
  {
    "id": 1,
    "question": "Detailed question text...",
    "difficulty": "${difficulty}",
    "topic": "General topic label (e.g. React hooks, SQL indices, JavaScript closures)",
    "expectedAnswerPoints": [
      "Key point 1 that must be mentioned in a high-scoring answer",
      "Key point 2 that must be mentioned in a high-scoring answer"
    ]
  }
]`;
};

/**
 * Prompt for resume profile extraction
 */
export const buildResumePrompt = (resumeText) => {
  return `You are an expert ATS system parser. Extract and summarize the profile metrics from this resume:
"${resumeText}"

Return a JSON object, and nothing else. Do not wrap in markdown tags. Match this schema:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "projects": ["Project Name 1: Short summary description", "Project Name 2: Short summary description"],
  "education": ["Degree - School/University (GPA if available)"],
  "technologies": ["Tech 1", "Tech 2", "Tech 3"],
  "experience": "Detailed summary description of years and levels of experience"
}`;
};

/**
 * Prompt for generating questions from a parsed resume profile
 */
export const buildResumeQuestionPrompt = (parsedResume, totalQuestions) => {
  return `You are an expert technical interviewer. Review the parsed resume details of this candidate:
- Skills: ${JSON.stringify(parsedResume.skills)}
- Projects: ${JSON.stringify(parsedResume.projects)}
- Technologies: ${JSON.stringify(parsedResume.technologies)}
- Experience: "${parsedResume.experience}"

Generate exactly ${totalQuestions} interview questions. Mix general engineering concepts with questions tailored to the candidate's projects, technologies, and experience.

Return a JSON array of objects, and nothing else. Do not wrap in markdown tags. Match this schema:
[
  {
    "id": 1,
    "question": "Detailed question text...",
    "difficulty": "Medium",
    "topic": "General topic label",
    "expectedAnswerPoints": [
      "Key point 1 that must be mentioned in a high-scoring answer",
      "Key point 2 that must be mentioned in a high-scoring answer"
    ]
  }
]`;
};

/**
 * Prompt for evaluating individual question responses
 */
export const buildFeedbackPrompt = (question, answer, expectedAnswerPoints) => {
  return `You are an AI Interview Evaluator. Evaluate this response:
- Question: "${question}"
- Expected Answer Points: ${JSON.stringify(expectedAnswerPoints || [])}
- Candidate Answer: "${answer || 'No response provided.'}"

Assess accuracy, depth, and communication. Return a JSON object, and nothing else. Do not wrap in markdown tags. Match this schema:
{
  "overallScore": 8.0,
  "technicalAccuracy": 8.0,
  "communication": 8.0,
  "missingConcepts": [
    "Concept 1 the candidate missed or explained poorly",
    "Concept 2 the candidate missed or explained poorly"
  ],
  "strengths": [
    "Specific strength 1 demonstrated in the answer",
    "Specific strength 2 demonstrated in the answer"
  ],
  "weaknesses": [
    "Specific weakness 1 demonstrated in the answer",
    "Specific weakness 2 demonstrated in the answer"
  ],
  "suggestions": [
    "Concrete suggestion 1 for improvement",
    "Concrete suggestion 2 for improvement"
  ],
  "difficultyAssessment": "Easy | Medium | Hard"
}`;
};

/**
 * Prompt for overall mock interview report cards
 */
export const buildInterviewReportPrompt = (interviewData) => {
  return `You are an expert hiring panel evaluator. Analyze the candidate's performance across the entire mock interview session:
- Target Role: ${interviewData.role}
- Difficulty: ${interviewData.difficulty}
- Session Questions and Evaluations: ${JSON.stringify(interviewData.questions)}

Generate a comprehensive overall interview report card.
Return a JSON object, and nothing else. Do not wrap in markdown tags. Match this schema:
{
  "overallScore": 8.0,
  "technicalRating": 8.0,
  "communicationRating": 8.0,
  "confidenceRating": 8.0,
  "topStrengths": [
    "Strength 1 across the session",
    "Strength 2 across the session"
  ],
  "improvementAreas": [
    "Improvement Area 1 across the session",
    "Improvement Area 2 across the session"
  ],
  "recommendedTopics": [
    "Topic 1 recommended for study",
    "Topic 2 recommended for study"
  ],
  "hiringRecommendation": "Strong Hire | Hire | No Hire assessment with short rationale explanation"
}`;
};
