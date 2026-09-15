import { test, describe } from 'node:test';
import assert from 'node:assert';
import analyticsService from '../src/services/analyticsService.js';

describe('Analytics Engine Suite', () => {
  const sampleInterviews = [
    {
      _id: 'session-1',
      title: 'React Senior Frontend Interview',
      role: 'React Developer',
      difficulty: 'hard',
      status: 'completed',
      overallScore: 9,
      questions: [
        { questionText: 'What is React Virtual DOM?', category: 'Technical', score: 9 },
        { questionText: 'Describe a time you handled conflict.', category: 'Behavioral', score: 8 }
      ],
      createdAt: new Date('2026-09-01T10:00:00Z')
    },
    {
      _id: 'session-2',
      title: 'Node.js Backend Deep Dive',
      role: 'Backend Engineer',
      difficulty: 'medium',
      status: 'completed',
      overallScore: 7,
      questions: [
        { questionText: 'Explain Node Event Loop.', category: 'Technical', score: 7 },
        { questionText: 'How to optimize SQL queries?', category: 'System Design', score: 6 }
      ],
      createdAt: new Date('2026-09-10T10:00:00Z')
    }
  ];

  test('calculateSummaryMetrics computes accurate score aggregations', () => {
    const summary = analyticsService.calculateSummaryMetrics(sampleInterviews);
    assert.strictEqual(summary.totalInterviews, 2);
    assert.strictEqual(summary.completedInterviews, 2);
    assert.strictEqual(summary.averageScore, 80);
    assert.strictEqual(summary.highestScore, 90);
    assert.strictEqual(summary.successRate, 100);
  });

  test('calculateCategoryBreakdown computes skill scores out of 100', () => {
    const breakdown = analyticsService.calculateCategoryBreakdown(sampleInterviews);
    assert.ok(breakdown['Technical Knowledge'] !== undefined, 'Technical Knowledge should exist');
    assert.ok(breakdown.Behavioral !== undefined, 'Behavioral should exist');
    assert.ok(breakdown.Communication !== undefined, 'Communication should exist');
    assert.strictEqual(typeof breakdown['Technical Knowledge'], 'number');
  });

  test('detectWeaknesses extracts top strengths and actionable weaknesses', () => {
    const categories = analyticsService.calculateCategoryBreakdown(sampleInterviews);
    const weaknesses = analyticsService.detectWeaknesses(sampleInterviews, categories);

    assert.ok(Array.isArray(weaknesses.topWeaknesses), 'topWeaknesses should be an array');
    assert.ok(Array.isArray(weaknesses.topStrengths), 'topStrengths should be an array');
    assert.ok(weaknesses.urgencyLevel, 'urgencyLevel should be defined');
  });

  test('generatePracticePlan creates a 4-week structured progression', () => {
    const categories = analyticsService.calculateCategoryBreakdown(sampleInterviews);
    const weaknesses = analyticsService.detectWeaknesses(sampleInterviews, categories);
    const plan = analyticsService.generatePracticePlan(sampleInterviews, weaknesses);

    assert.ok(plan.week1, 'Plan should contain week1');
    assert.ok(plan.week2, 'Plan should contain week2');
    assert.ok(plan.week3, 'Plan should contain week3');
    assert.ok(plan.week4, 'Plan should contain week4');
    assert.ok(plan.recommendedFrequency, 'Plan should specify recommendedFrequency');
  });
});
