/* ============================================================
   VALIDATION TESTS — src/__tests__/validation.test.js
   Unit tests for client-side input validation utilities.
   ============================================================ */

import { describe, it, expect } from 'vitest';
import {
  OPERATION_MAP,
  isValidNumber,
  validateInputs,
  formatResult,
} from '../utils/validation';

describe('OPERATION_MAP', () => {
  it('maps all display symbols to API operation names', () => {
    expect(OPERATION_MAP['+']).toBe('add');
    expect(OPERATION_MAP['-']).toBe('subtract');
    expect(OPERATION_MAP['×']).toBe('multiply');
    expect(OPERATION_MAP['÷']).toBe('divide');
    expect(OPERATION_MAP['xʸ']).toBe('power');
    expect(OPERATION_MAP['√']).toBe('sqrt');
    expect(OPERATION_MAP['%']).toBe('percentage');
  });
});

describe('isValidNumber()', () => {
  it('returns true for valid number strings', () => {
    expect(isValidNumber('42')).toBe(true);
    expect(isValidNumber('-3.14')).toBe(true);
    expect(isValidNumber('0')).toBe(true);
    expect(isValidNumber('0.5')).toBe(true);
  });

  it('returns false for invalid inputs', () => {
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('-')).toBe(false);
    expect(isValidNumber('.')).toBe(false);
    expect(isValidNumber('abc')).toBe(false);
    expect(isValidNumber('Infinity')).toBe(false);
  });
});

describe('validateInputs()', () => {
  it('returns valid for a correct binary operation', () => {
    expect(validateInputs('add', 10, 5)).toEqual({ valid: true });
  });

  it('returns valid for sqrt with non-negative number', () => {
    expect(validateInputs('sqrt', 16)).toEqual({ valid: true });
  });

  it('rejects missing operation', () => {
    const result = validateInputs(null, 10, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('No operation');
  });

  it('rejects non-finite first operand', () => {
    const result = validateInputs('add', NaN, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid first operand');
  });

  it('rejects non-finite second operand for binary ops', () => {
    const result = validateInputs('add', 10, Infinity);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid second operand');
  });

  it('rejects sqrt of negative', () => {
    const result = validateInputs('sqrt', -4);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('negative');
  });

  it('rejects division by zero', () => {
    const result = validateInputs('divide', 10, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('zero');
  });
});

describe('formatResult()', () => {
  it('formats integers without decimal', () => {
    expect(formatResult(42)).toBe('42');
    expect(formatResult(0)).toBe('0');
    expect(formatResult(-7)).toBe('-7');
  });

  it('formats floats with limited precision', () => {
    const result = formatResult(1 / 3);
    expect(result.length).toBeLessThanOrEqual(12);
    expect(Number(result)).toBeCloseTo(1 / 3, 8);
  });

  it('returns "Error" for non-finite numbers', () => {
    expect(formatResult(Infinity)).toBe('Error');
    expect(formatResult(-Infinity)).toBe('Error');
    expect(formatResult(NaN)).toBe('Error');
  });
});
