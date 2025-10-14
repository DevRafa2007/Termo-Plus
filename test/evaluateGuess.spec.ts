import { describe, it, expect } from 'vitest';
import { evaluateSolutionGuess } from '../src/utils/evaluateGuess';

describe('evaluateSolutionGuess', () => {
  it('marks correct letters', () => {
    const res = evaluateSolutionGuess('apple', 'apart');
    expect(res[0]).toBe('correct'); // a
  });

  it('handles repeated letters correctly (single occurrence in solution)', () => {
    // solution has one "a" at pos 0; guess has two 'a's -> only first should be correct, second absent
    const res = evaluateSolutionGuess('arbor', 'aaxxx');
    expect(res[0]).toBe('correct');
    expect(res[1]).toBe('absent');
  });

  it('marks present when counts allow', () => {
    const res = evaluateSolutionGuess('level', 'hello');
    // 'l' present and corrects/presents accordingly
    expect(res.filter(s => s === 'present').length).toBeGreaterThanOrEqual(1);
  });
});
