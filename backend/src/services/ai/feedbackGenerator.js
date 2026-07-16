/**
 * Mock AI Feedback Generator Service
 * Returns detailed evaluation scores, strengths, weaknesses, and suggestions.
 */

export const generateFeedback = (question, answer) => {
  const ans = (answer || '').trim();
  
  if (ans.length === 0) {
    return {
      score: 1,
      strengths: ["None"],
      weaknesses: ["The answer field was left completely empty."],
      suggestions: ["Provide a complete conceptual overview of the asked topic including any code context."]
    };
  }

  if (ans.length < 30) {
    return {
      score: 4,
      strengths: ["Attempted to answer the question briefly."],
      weaknesses: ["Answer lacks technical depth, structural details, and clarity."],
      suggestions: ["Try using the STAR method (Situation, Task, Action, Result) to frame your technical answers."]
    };
  }

  // High-density responses
  let score = 7;
  if (ans.length > 200) {
    score = 9;
  } else if (ans.length > 100) {
    score = 8;
  }

  return {
    score,
    strengths: [
      "Demonstrates clear comprehension of the core computer science concepts.",
      "Uses appropriate terminology and structured sequencing in the explanation."
    ],
    weaknesses: [
      "Could elaborate more on performance trade-offs and complexity (Time/Space).",
      "Lacks concrete real-world usage scenarios or personal codebase examples."
    ],
    suggestions: [
      "Incorporate code snippets or diagrams when describing data flow architectures.",
      "Expand on how you would configure unit testing and mock dependencies for this system."
    ]
  };
};
