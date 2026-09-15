import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getFallbackQuestions, evaluateFallbackSession } from '../src/services/aiService.js';
import { generateFollowUpQuestion } from '../src/services/ai/followUpGenerator.js';

describe('AI Question Generator & Answer Evaluator Suite', () => {
  test('getFallbackQuestions returns 10 structured questions for Frontend role', () => {
    const questions = getFallbackQuestions('React Frontend Engineer', 'medium', 'React, CSS, JavaScript');
    assert.strictEqual(questions.length, 10);
    assert.ok(questions[0].question, 'Question object should contain question text');
    assert.ok(questions[0].category, 'Question object should contain category');
  });

  test('getFallbackQuestions returns 10 structured questions for Backend role', () => {
    const questions = getFallbackQuestions('Node.js Backend Engineer', 'hard', 'Node, Express, MongoDB');
    assert.strictEqual(questions.length, 10);
    assert.strictEqual(questions[0].difficulty, 'hard');
  });

  test('evaluateFallbackSession correctly scores skipped questions as 0.0', () => {
    const questionsWithAnswers = [
      { questionText: 'Explain virtual DOM', userAnswer: 'skipped by candidate' }
    ];
    const result = evaluateFallbackSession(questionsWithAnswers);
    assert.strictEqual(result.questions[0].score, 0.0);
    assert.strictEqual(result.grade, 'Needs Development');
  });

  test('evaluateFallbackSession rewards comprehensive detailed answers', () => {
    const questionsWithAnswers = [
      {
        questionText: 'Explain Virtual DOM in React and reconciliation.',
        userAnswer: 'React relies on an in-memory Virtual DOM representation. When state changes, React constructs a new VDOM tree and executes its heuristic O(N) Reconciliation diffing algorithm against the previous VDOM snapshot using Fiber nodes to compute minimal DOM patches, maximizing rendering performance and avoiding layout thrashing.'
      }
    ];
    const result = evaluateFallbackSession(questionsWithAnswers);
    assert.ok(result.questions[0].score >= 8.0, 'Comprehensive answer should receive a high score');
    assert.strictEqual(result.grade, 'Expert Candidate');
  });

  test('generateFollowUpQuestion skips follow-up for empty or short answers', async () => {
    const result = await generateFollowUpQuestion({
      question: 'What is closures in JS?',
      answer: 'hi',
      role: 'Frontend Engineer',
      difficulty: 'medium'
    });
    assert.strictEqual(result.shouldFollowUp, false);
    assert.strictEqual(result.followUpQuestion, '');
  });
});
