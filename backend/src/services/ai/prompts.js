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
  return `You are a strict, highly accurate AI Technical Interview Evaluator. Evaluate this response:
- Question: "${question}"
- Expected Answer Points: ${JSON.stringify(expectedAnswerPoints || [])}
- Candidate Answer: "${answer || 'No response provided.'}"

SCORING RUBRIC (0.0 to 10.0 scale):
- 0.0: Candidate skipped, provided no answer, or timer expired without response.
- 1.0 - 3.0: Answer is incorrect, off-topic, or fundamentally inaccurate.
- 4.0 - 6.0: Answer is partial, brief, or lacks technical depth.
- 7.0 - 10.0: Answer is accurate, structured, and comprehensive.

Assess accuracy, depth, and communication strictly based on the rubric. Return a JSON object, and nothing else. Do not wrap in markdown tags. Match this schema:
{
  "overallScore": 0.0,
  "technicalAccuracy": 0.0,
  "communication": 0.0,
  "missingConcepts": [
    "Concept 1 the candidate missed or explained poorly",
    "Concept 2 the candidate missed or explained poorly"
  ],
  "strengths": [
    "Specific strength 1 demonstrated in the answer (or N/A if skipped)",
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

SCORING GUIDELINES:
- Calculate real scores based on actual question accuracy.
- If multiple questions were skipped or answered poorly, assign an appropriate low rating and "No Hire" or "Needs Development" recommendation.
- Do NOT issue generic praise for incomplete or skipped interviews.

Generate a comprehensive overall interview report card.
Return a JSON object, and nothing else. Do not wrap in markdown tags. Match this schema:
{
  "overallScore": 0.0,
  "technicalRating": 0.0,
  "communicationRating": 0.0,
  "confidenceRating": 0.0,
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

/**
 * Prompt for analyzing interview response communication quality and personalized feedback
 */
export const buildCommunicationFeedbackPrompt = (transcript, analytics = {}, question = '') => {
  return `You are an expert executive communication coach for technical interviews. Analyze the candidate's spoken interview response and voice analytics metrics:
- Question Context: "${question || 'General technical interview question'}"
- Transcript: "${transcript}"
- Speaking Pace: ${analytics.wordsPerMinute ? analytics.wordsPerMinute + ' WPM (' + (analytics.pace?.label || 'N/A') + ')' : 'N/A'}
- Filler Words: ${analytics.fillerAnalysis?.totalFillers ?? 0} fillers (${analytics.fillerAnalysis?.fillerPercentage ?? 0}%)
- Voice Delivery Confidence: ${analytics.confidenceAnalysis?.score ? analytics.confidenceAnalysis.score + '/100 (' + (analytics.confidenceAnalysis?.level || 'N/A') + ')' : 'N/A'}
- Tone & Sentiment: ${analytics.toneAnalysis?.tone || 'Neutral'} tone, ${analytics.toneAnalysis?.sentiment || 'Neutral'} sentiment (${analytics.toneAnalysis?.uncertaintyIndicators ?? 0} uncertainty indicators)

Evaluate candidate transcript communication quality (clarity, coherence, professionalism, directness).
Return a JSON object ONLY. Do not wrap in markdown tags or extra text. Match this exact schema:
{
  "communicationQualityScore": 82,
  "clarity": 85,
  "directness": 78,
  "coherence": 84,
  "professionalism": 88,
  "overallAssessment": "2-3 sentence summary of candidate's delivery and communication strengths and areas to refine.",
  "strengths": [
    "Concrete strength 1 based on pace, tone, or structure",
    "Concrete strength 2 based on delivery"
  ],
  "areasToImprove": [
    "Actionable area to improve 1",
    "Actionable area to improve 2"
  ],
  "recommendations": [
    "Practical recommendation 1 for upcoming mock practice",
    "Practical recommendation 2 for upcoming mock practice"
  ]
}`;
};
