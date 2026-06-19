import mongoose from 'mongoose';
import Interview from '../models/Interview.js';

// In-memory mock database fallback when MongoDB is offline
let mockDatabase = [
  {
    _id: 'mock-dsa-id',
    title: 'Data Structures & Algorithms Mock',
    role: 'Software Engineer',
    difficulty: 'Medium',
    status: 'pending',
    questions: [
      { _id: 'q1', questionText: 'Explain the difference between a list and a tuple in Python.', userAnswer: '', feedback: '', score: null },
      { _id: 'q2', questionText: 'How does a hash map work?', userAnswer: '', feedback: '', score: null }
    ],
    overallScore: null,
    overallFeedback: '',
    grade: '',
    strengths: [],
    improvements: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-frontend-id',
    title: 'Frontend React Panel',
    role: 'React Developer',
    difficulty: 'Easy',
    status: 'completed',
    questions: [
      { 
        _id: 'q3', 
        questionText: 'What are React hooks?', 
        userAnswer: 'React hooks let you use state and other React features without writing a class. Examples include useState and useEffect.', 
        feedback: 'Excellent answer. You covered technical details comprehensively with solid structure.', 
        score: 9, 
        strength: 'Accurately defines the purpose of hooks and gives basic examples.', 
        improvement: 'Proactively mention performance trade-offs or alternative approaches to show even deeper mastery.' 
      }
    ],
    overallScore: 9,
    overallFeedback: 'Excellent communication and technical clarity.',
    grade: 'Expert Candidate',
    strengths: [
      'Exceptional depth in explaining core engineering/technical principles.',
      'Highly structured delivery patterns (consistent with STAR framework).'
    ],
    improvements: [
      'Proactively outline edge cases or trade-offs before the interviewer prompts.'
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000)
  }
];

// Helper to check if MongoDB is active
const isDbConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

/**
 * Evaluates the questions of an interview session using rule-based AI scoring logic.
 * Scores answers out of 10 based on length, sequential structure, and key tech vocabulary.
 */
function evaluateSession(questions) {
  let totalScore = 0;
  const evaluatedQuestions = questions.map((q) => {
    const text = q.questionText || '';
    const answer = q.userAnswer || '';
    
    // 1. Length scoring (up to 3 points)
    let lengthScore = 1;
    if (answer.length >= 300) {
      lengthScore = 3;
    } else if (answer.length >= 150) {
      lengthScore = 2.5;
    } else if (answer.length >= 50) {
      lengthScore = 2;
    } else if (answer.length > 10) {
      lengthScore = 1.5;
    }

    // 2. Structure scoring (up to 3 points)
    const structureKeywords = [
      'first', 'second', 'third', 'finally', 'lastly', 'however', 'therefore',
      'for example', 'specifically', 'resolved', 'outcome', 'situation', 'task',
      'action', 'result', 'because', 'consequently', 'furthermore', 'in addition'
    ];
    let matchedStructure = 0;
    structureKeywords.forEach(kw => {
      if (answer.toLowerCase().includes(kw)) {
        matchedStructure++;
      }
    });
    let structureScore = 1;
    if (matchedStructure >= 4) {
      structureScore = 3;
    } else if (matchedStructure >= 2) {
      structureScore = 2.3;
    } else if (matchedStructure >= 1) {
      structureScore = 1.8;
    }

    // 3. Keyword matching (up to 4 points)
    let techKeywords;
    const qLower = text.toLowerCase();
    if (qLower.includes('rest') || qLower.includes('graphql')) {
      techKeywords = ['rest', 'graphql', 'query', 'mutation', 'schema', 'endpoint', 'over-fetching', 'under-fetching', 'http', 'json', 'post', 'resolver'];
    } else if (qLower.includes('memoization') || qLower.includes('react') || qLower.includes('render')) {
      techKeywords = ['memoization', 'react', 'memo', 'usememo', 'usecallback', 'render', 're-render', 'dependency', 'cache', 'state', 'props', 'performance'];
    } else if (qLower.includes('sql') || qLower.includes('query') || qLower.includes('optimize') || qLower.includes('database')) {
      techKeywords = ['sql', 'query', 'optimize', 'index', 'indices', 'execution plan', 'explain', 'join', 'select', 'where', 'indexes', 'slow', 'cache', 'bottleneck'];
    } else if (qLower.includes('security') || qLower.includes('vulnerabilities') || qLower.includes('xss') || qLower.includes('csrf')) {
      techKeywords = ['security', 'xss', 'csrf', 'sanitize', 'token', 'cookie', 'http', 'header', 'cors', 'validate', 'encode', 'escape'];
    } else if (qLower.includes('conflict') || qLower.includes('disagree') || qLower.includes('colleague')) {
      techKeywords = ['disagree', 'colleague', 'conflict', 'communication', 'listen', 'compromise', 'respect', 'feedback', 'perspective', 'resolution', 'align'];
    } else {
      techKeywords = ['experience', 'process', 'team', 'challenge', 'result', 'measure', 'solve', 'solution', 'analyze', 'implement'];
    }

    let matchedTech = 0;
    techKeywords.forEach(kw => {
      if (answer.toLowerCase().includes(kw)) {
        matchedTech++;
      }
    });

    let keywordScore = 1;
    if (matchedTech >= 5) {
      keywordScore = 4;
    } else if (matchedTech >= 3) {
      keywordScore = 3;
    } else if (matchedTech >= 1) {
      keywordScore = 2;
    }

    let score = parseFloat((lengthScore + structureScore + keywordScore).toFixed(1));
    score = Math.max(1, Math.min(10, score));
    totalScore += score;

    let qFeedback;
    let qStrength;
    let qImprovement;

    if (score >= 9) {
      qFeedback = 'Excellent answer. You covered technical details comprehensively with solid structure.';
      qStrength = `Great usage of terms like ${techKeywords.slice(0, 3).join(', ')} and clear logical flow.`;
      qImprovement = 'Proactively mention performance trade-offs or alternative approaches to show even deeper mastery.';
    } else if (score >= 7) {
      qFeedback = 'Good explanation, but could incorporate more specific terminology or deeper structure.';
      qStrength = 'Good articulation of the key concepts and reasonable detail length.';
      qImprovement = `Incorporate more target keywords such as: ${techKeywords.filter(k => !answer.toLowerCase().includes(k)).slice(0, 3).join(', ')}.`;
    } else if (score >= 5) {
      qFeedback = 'Average answer. Focus on expanding technical explanations and structuring the response.';
      qStrength = 'Demonstrates basic familiarity with the concepts.';
      qImprovement = 'Expand your answer to cover specific scenarios, improve grammatical flow, and add real-world examples.';
    } else {
      qFeedback = 'Poor explanation. The response is too short or lacks technical substance.';
      qStrength = 'Attempted to address the question prompt.';
      qImprovement = 'Significantly increase detail length, use structured explanation patterns, and explain how the underlying technology operates.';
    }

    return {
      _id: q._id || new mongoose.Types.ObjectId().toString(),
      questionText: text,
      userAnswer: answer,
      score: score,
      feedback: qFeedback,
      strength: qStrength,
      improvement: qImprovement
    };
  });

  const averageScore = parseFloat((totalScore / questions.length).toFixed(1));

  let overallFeedback;
  let badge;
  let strengths;
  let improvements;

  if (averageScore >= 8) {
    overallFeedback = 'Excellent communication and technical clarity.';
    badge = 'Expert Candidate';
    strengths = [
      'Exceptional depth in explaining core engineering/technical principles.',
      'Highly structured delivery patterns (consistent with STAR framework).',
      'Strong integration of industry-standard jargon and relevant concepts.'
    ];
    improvements = [
      'Proactively outline edge cases or trade-offs before the interviewer prompts.',
      'Reduce vocal filler simulation by maintaining composed pause structures.'
    ];
  } else if (averageScore >= 6) {
    overallFeedback = 'Good answers but improve depth and examples.';
    badge = 'Capable Professional';
    strengths = [
      'Clear baseline explanation of technical concepts.',
      'Well-organized transition words helping the logical flow.',
      'Good engagement with the key components of the prompts.'
    ];
    improvements = [
      'Incorporate more concrete metrics, tools, or real-world experience details.',
      'Extend answer lengths to cover structural details rather than just high-level overviews.',
      'Ensure standard engineering terms are always mentioned where relevant.'
    ];
  } else {
    overallFeedback = 'Needs better structure and stronger technical explanation.';
    badge = 'Needs Development';
    strengths = [
      'Completed all interview questions under timer constraints.',
      'Identified core terms related to the question topic.'
    ];
    improvements = [
      'Significantly restructure responses using clear numbering or sequential steps.',
      'Practice technical definitions and write more comprehensive, detailed descriptions.',
      'Study underlying concepts to increase keyword usage and depth.'
    ];
  }

  return {
    questions: evaluatedQuestions,
    overallScore: averageScore,
    overallFeedback: overallFeedback,
    grade: badge,
    strengths: strengths,
    improvements: improvements
  };
}

/**
 * @desc    Create a new interview session
 * @route   POST /api/interviews
 * @access  Public (for now)
 */
export const createInterview = async (req, res) => {
  try {
    const { title, role, difficulty, questions } = req.body;

    if (!title || !role || !difficulty) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: title, role, and difficulty.',
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'An interview session must contain at least one question.',
      });
    }

    // Format questions to match schema items
    const formattedQuestions = questions.map(q => {
      const qText = typeof q === 'string' ? q : (q.questionText || q.text || '');
      return {
        questionText: qText,
        userAnswer: typeof q === 'object' ? (q.userAnswer || '') : '',
        feedback: typeof q === 'object' ? (q.feedback || '') : '',
        score: typeof q === 'object' ? (q.score || null) : null,
        strength: typeof q === 'object' ? (q.strength || '') : '',
        improvement: typeof q === 'object' ? (q.improvement || '') : ''
      };
    });

    if (isDbConnected()) {
      const newInterview = new Interview({
        title,
        role,
        difficulty,
        questions: formattedQuestions,
      });

      const savedInterview = await newInterview.save();
      return res.status(201).json({
        status: 'success',
        data: {
          interview: savedInterview,
        },
      });
    } else {
      // In-memory Save Fallback
      const newMockInterview = {
        _id: new mongoose.Types.ObjectId().toString(),
        title,
        role,
        difficulty,
        questions: formattedQuestions.map(q => ({ ...q, _id: new mongoose.Types.ObjectId().toString() })),
        status: 'pending',
        overallScore: null,
        overallFeedback: '',
        grade: '',
        strengths: [],
        improvements: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabase.unshift(newMockInterview);
      return res.status(201).json({
        status: 'success',
        data: {
          interview: newMockInterview,
        },
      });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('Error creating interview:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while creating the interview.',
    });
  }
};

/**
 * @desc    Get all interview sessions
 * @route   GET /api/interviews
 * @access  Public (for now)
 */
export const getInterviews = async (req, res) => {
  try {
    let interviews = [];
    if (isDbConnected()) {
      try {
        interviews = await Interview.find().sort({ createdAt: -1 });
      } catch (dbError) {
        console.warn('⚠️ MongoDB error fetching interviews, falling back to mock database:', dbError.message);
        interviews = mockDatabase;
      }
    } else {
      interviews = mockDatabase;
    }

    res.status(200).json({
      status: 'success',
      results: interviews.length,
      data: {
        interviews,
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while fetching interviews.',
    });
  }
};

/**
 * @desc    Get a single interview session by ID
 * @route   GET /api/interviews/:id
 * @access  Public (for now)
 */
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const interview = await Interview.findById(id);
      if (interview) {
        return res.status(200).json({
          status: 'success',
          data: {
            interview,
          },
        });
      }
    }

    // Check mock database
    const mockInterview = mockDatabase.find(i => i._id === id);
    if (!mockInterview) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        interview: mockInterview,
      },
    });
  } catch (error) {
    console.error('Error fetching interview by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while fetching the interview.',
    });
  }
};

/**
 * @desc    Update a single interview session (PATCH)
 * @route   PATCH /api/interviews/:id
 * @access  Public (for now)
 */
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    let updatePayload = { ...req.body };

    // Run evaluation scoring if the status is transitioning to completed
    if (updatePayload.status === 'completed' && updatePayload.questions && Array.isArray(updatePayload.questions)) {
      const evaluation = evaluateSession(updatePayload.questions);
      updatePayload = {
        ...updatePayload,
        questions: evaluation.questions,
        overallScore: evaluation.overallScore,
        overallFeedback: evaluation.overallFeedback,
        grade: evaluation.grade,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      };
    }

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const updatedInterview = await Interview.findByIdAndUpdate(
        id,
        updatePayload,
        {
          new: true,
          runValidators: true,
        }
      );

      if (updatedInterview) {
        return res.status(200).json({
          status: 'success',
          data: {
            interview: updatedInterview,
          },
        });
      }
    }

    // Fallback to updating in mockDatabase
    const index = mockDatabase.findIndex(i => i._id === id);
    if (index === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found.',
      });
    }

    // Merge changes in memory
    const existing = mockDatabase[index];
    const questionsMerged = updatePayload.questions || existing.questions;

    let updatedMock = {
      ...existing,
      ...updatePayload,
      questions: questionsMerged,
      updatedAt: new Date()
    };

    // Evaluate in memory if completing
    if (updatePayload.status === 'completed') {
      const evaluation = evaluateSession(questionsMerged);
      updatedMock = {
        ...updatedMock,
        questions: evaluation.questions,
        overallScore: evaluation.overallScore,
        overallFeedback: evaluation.overallFeedback,
        grade: evaluation.grade,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      };
    }

    mockDatabase[index] = updatedMock;

    res.status(200).json({
      status: 'success',
      data: {
        interview: updatedMock,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('Error updating interview:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while updating the interview.',
    });
  }
};

/**
 * @desc    Delete a single interview session by ID
 * @route   DELETE /api/interviews/:id
 * @access  Public (for now)
 */
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const deletedInterview = await Interview.findByIdAndDelete(id);
      if (deletedInterview) {
        return res.status(200).json({
          status: 'success',
          message: 'Interview session successfully deleted.',
          data: null,
        });
      }
    }

    // Fallback to mockDatabase deletion
    const index = mockDatabase.findIndex(i => i._id === id);
    if (index === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Interview session not found.',
      });
    }

    mockDatabase.splice(index, 1);

    res.status(200).json({
      status: 'success',
      message: 'Interview session successfully deleted from mock database.',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while deleting the interview.',
    });
  }
};
