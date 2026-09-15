import { test, describe } from 'node:test';
import assert from 'node:assert';
import { mockDatabase } from '../src/controllers/interviewController.js';

describe('Interview Session Controller & Storage Suite', () => {
  test('Mock database initializes with pre-populated test interview sessions', () => {
    assert.ok(Array.isArray(mockDatabase), 'Mock database should be an array');
    assert.ok(mockDatabase.length >= 2, 'Mock database should contain initial test records');
  });

  test('Mock database items contain essential schema properties', () => {
    const item = mockDatabase[0];
    assert.ok(item._id, 'Interview should have _id');
    assert.ok(item.title, 'Interview should have title');
    assert.ok(item.role, 'Interview should have role');
    assert.ok(item.difficulty, 'Interview should have difficulty');
    assert.ok(Array.isArray(item.questions), 'Interview should have questions array');
  });

  test('Mock database records preserve question structure', () => {
    const completedSession = mockDatabase.find(i => i.status === 'completed');
    assert.ok(completedSession, 'Completed interview session should exist');
    assert.ok(completedSession.overallScore !== null, 'Completed session should have an overallScore');
    assert.ok(completedSession.grade, 'Completed session should have a grade');
  });
});
