/* ============================================================
   INPUT VALIDATION — src/utils/validation.js
   Helpers for validating calculator inputs before API calls.
   ============================================================ */

/**
 * Map of display symbols → API operation names.
 */
export const OPERATION_MAP = {
  '+': 'add',
  '-': 'subtract',
  '×': 'multiply',
  '÷': 'divide',
  'xʸ': 'power',
  '√': 'sqrt',
  '%': 'percentage',
};

/**
 * Check whether a string represents a valid finite number.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidNumber(value) {
  if (value === '' || value === '-' || value === '.') return false;
  const num = Number(value);
  return !Number.isNaN(num) && Number.isFinite(num);
}

/**
 * Validate inputs before calling the API.
 *
 * @param {string} operation — API operation name
 * @param {number} a
 * @param {number} [b]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateInputs(operation, a, b) {
  if (!operation) {
    return { valid: false, error: 'No operation selected.' };
  }

  if (typeof a !== 'number' || !Number.isFinite(a)) {
    return { valid: false, error: 'Invalid first operand.' };
  }

  // sqrt only needs one operand
  if (operation === 'sqrt') {
    if (a < 0) {
      return { valid: false, error: 'Cannot take square root of a negative number.' };
    }
    return { valid: true };
  }

  if (typeof b !== 'number' || !Number.isFinite(b)) {
    return { valid: false, error: 'Invalid second operand.' };
  }

  if (operation === 'divide' && b === 0) {
    return { valid: false, error: 'Cannot divide by zero.' };
  }

  return { valid: true };
}

/**
 * Format a number for display (avoid excessively long decimals).
 * @param {number} num
 * @returns {string}
 */
export function formatResult(num) {
  if (!Number.isFinite(num)) return 'Error';

  // If the number is an integer, show it as-is
  if (Number.isInteger(num)) return num.toString();

  // Otherwise cap to 10 significant digits to prevent overflow
  const str = parseFloat(num.toPrecision(10)).toString();
  return str;
}
