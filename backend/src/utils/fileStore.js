import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.warn('⚠️ Could not create data directory:', err.message);
  }
}

const usersFilePath = path.join(dataDir, 'users.json');
const interviewsFilePath = path.join(dataDir, 'interviews.json');

/**
 * Reads user accounts from persistent local JSON file store.
 */
export function readUsersFromFile() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const raw = fs.readFileSync(usersFilePath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('⚠️ Could not read users file store:', err.message);
  }
  return [
    {
      _id: '60d5ec49f1b2c81234567890',
      fullName: 'Demo Candidate',
      email: 'test@example.com',
      password: 'password123',
      avatar: '',
      role: 'candidate'
    }
  ];
}

/**
 * Writes user accounts to persistent local JSON file store.
 */
export function writeUsersToFile(usersArray) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(usersArray, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not write users file store:', err.message);
  }
}

/**
 * Reads interview records from persistent local JSON file store.
 */
export function readInterviewsFromFile() {
  try {
    if (fs.existsSync(interviewsFilePath)) {
      const raw = fs.readFileSync(interviewsFilePath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('⚠️ Could not read interviews file store:', err.message);
  }
  return [
    {
      _id: 'mock-dsa-id',
      userId: '60d5ec49f1b2c81234567890',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mock-frontend-id',
      userId: '60d5ec49f1b2c81234567890',
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
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
}

/**
 * Writes interview records to persistent local JSON file store.
 */
export function writeInterviewsToFile(interviewsArray) {
  try {
    fs.writeFileSync(interviewsFilePath, JSON.stringify(interviewsArray, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not write interviews file store:', err.message);
  }
}

export default {
  readUsersFromFile,
  writeUsersToFile,
  readInterviewsFromFile,
  writeInterviewsToFile
};
