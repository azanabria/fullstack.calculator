/* ============================================================
   CALCULATOR COMPONENT — src/components/Calculator.jsx
   Main calculator logic: state management, input handling,
   API calls, and button layout.
   ============================================================ */

import React, { useState, useCallback, useEffect } from 'react';
import Display from './Display';
import Button from './Button';
import { calculate } from '../services/api';
import {
  OPERATION_MAP,
  isValidNumber,
  validateInputs,
  formatResult,
} from '../utils/validation';

/** Maximum digits allowed on the display to prevent overflow. */
const MAX_DIGITS = 15;

/**
 * The button layout of the calculator.
 * Each entry: [label, variant, extraClassName?]
 */
const BUTTON_LAYOUT = [
  ['C',  'function'],
  ['⌫',  'function'],
  ['%',  'operator'],
  ['÷',  'operator'],

  ['7',  'number'],
  ['8',  'number'],
  ['9',  'number'],
  ['×',  'operator'],

  ['4',  'number'],
  ['5',  'number'],
  ['6',  'number'],
  ['-',  'operator'],

  ['1',  'number'],
  ['2',  'number'],
  ['3',  'number'],
  ['+',  'operator'],

  ['0',  'number',   'btn--zero'],
  ['.',  'number'],
  ['±',  'function'],

  ['√',  'operator'],
  ['xʸ', 'operator'],
  ['=',  'equals'],
];

export default function Calculator() {
  // -------- State --------
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateResult, setAnimateResult] = useState(false);

  // -------- Helpers --------

  /** Reset all state to initial. */
  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
    setHasError(false);
    setIsLoading(false);
    setAnimateResult(false);
  }, []);

  /** Trigger a brief animation on the result. */
  const flashResult = useCallback(() => {
    setAnimateResult(true);
    setTimeout(() => setAnimateResult(false), 350);
  }, []);

  // -------- Input Handlers --------

  /** Append a digit to the display. */
  const inputDigit = useCallback(
    (digit) => {
      if (hasError) clearAll();

      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
        return;
      }

      // Replace leading '0' unless we're building a decimal
      setDisplay((prev) => {
        if (prev === '0' && digit !== '0') return digit;
        if (prev === '-0') return `-${digit}`;
        if (prev.replace(/[^0-9]/g, '').length >= MAX_DIGITS) return prev;
        return prev + digit;
      });
    },
    [waitingForOperand, hasError, clearAll],
  );

  /** Handle decimal point. */
  const inputDot = useCallback(() => {
    if (hasError) clearAll();

    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    setDisplay((prev) => (prev.includes('.') ? prev : prev + '.'));
  }, [waitingForOperand, hasError, clearAll]);

  /** Backspace — remove last character. */
  const backspace = useCallback(() => {
    if (hasError || waitingForOperand) return;
    setDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev[0] === '-')) return '0';
      return prev.slice(0, -1);
    });
  }, [hasError, waitingForOperand]);

  /** Toggle positive / negative. */
  const toggleSign = useCallback(() => {
    if (hasError) return;
    setDisplay((prev) => {
      if (prev === '0') return prev;
      return prev[0] === '-' ? prev.slice(1) : `-${prev}`;
    });
  }, [hasError]);

  // -------- API Call --------

  /** Perform a calculation via the backend API. */
  const performCalculation = useCallback(
    async (opName, a, b) => {
      const validation = validateInputs(opName, a, b);
      if (!validation.valid) {
        setDisplay(validation.error);
        setHasError(true);
        return null;
      }

      setIsLoading(true);
      try {
        const data = await calculate(opName, a, b);
        const result = data.result;
        setIsLoading(false);
        return result;
      } catch (err) {
        setIsLoading(false);
        setDisplay(err.message || 'Error');
        setHasError(true);
        return null;
      }
    },
    [],
  );

  // -------- Operation Handlers --------

  /** Handle an operator button press (+, -, ×, ÷, xʸ). */
  const handleOperator = useCallback(
    async (op) => {
      if (hasError) clearAll();

      const opName = OPERATION_MAP[op];
      const currentValue = parseFloat(display);

      // If we already have a pending operation, chain: compute the pending one first
      if (previousValue !== null && operation && !waitingForOperand) {
        const result = await performCalculation(operation, previousValue, currentValue);
        if (result === null) return; // error occurred
        const formatted = formatResult(result);
        setDisplay(formatted);
        setPreviousValue(result);
        setExpression(`${formatted} ${op}`);
        flashResult();
      } else {
        setPreviousValue(currentValue);
        setExpression(`${display} ${op}`);
      }

      setOperation(opName);
      setWaitingForOperand(true);
    },
    [display, previousValue, operation, waitingForOperand, hasError, clearAll, performCalculation, flashResult],
  );

  /** Handle equals button press. */
  const handleEquals = useCallback(async () => {
    if (hasError) return;
    if (previousValue === null || !operation) return;

    const currentValue = parseFloat(display);
    const result = await performCalculation(operation, previousValue, currentValue);
    if (result === null) return;

    const formatted = formatResult(result);
    setExpression(`${expression} ${display} =`);
    setDisplay(formatted);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    flashResult();
  }, [display, previousValue, operation, expression, hasError, performCalculation, flashResult]);

  /** Handle square root (unary). */
  const handleSqrt = useCallback(async () => {
    if (hasError) clearAll();

    const currentValue = parseFloat(display);
    setExpression(`√(${display})`);

    const result = await performCalculation('sqrt', currentValue);
    if (result === null) return;

    const formatted = formatResult(result);
    setDisplay(formatted);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    flashResult();
  }, [display, hasError, clearAll, performCalculation, flashResult]);

  /** Handle percentage. */
  const handlePercentage = useCallback(async () => {
    if (hasError) return;

    const currentValue = parseFloat(display);

    if (previousValue !== null && operation) {
      // e.g. 200 + 10% → 200 + percentage(200, 10) → 200 + 20
      const result = await performCalculation('percentage', previousValue, currentValue);
      if (result === null) return;
      const formatted = formatResult(result);
      setDisplay(formatted);
      setExpression(`${expression} ${formatted}`);
      // Keep the pending operation so user can press = next
      flashResult();
    } else {
      // No pending operation: just divide by 100 locally
      const result = currentValue / 100;
      const formatted = formatResult(result);
      setDisplay(formatted);
      setExpression(`${display}%`);
      setWaitingForOperand(true);
      flashResult();
    }
  }, [display, previousValue, operation, expression, hasError, performCalculation, flashResult]);

  // -------- Unified Click Router --------

  const handleButtonClick = useCallback(
    (label) => {
      switch (label) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          inputDigit(label);
          break;
        case '.':
          inputDot();
          break;
        case 'C':
          clearAll();
          break;
        case '⌫':
          backspace();
          break;
        case '±':
          toggleSign();
          break;
        case '+': case '-': case '×': case '÷': case 'xʸ':
          handleOperator(label);
          break;
        case '=':
          handleEquals();
          break;
        case '√':
          handleSqrt();
          break;
        case '%':
          handlePercentage();
          break;
        default:
          break;
      }
    },
    [inputDigit, inputDot, clearAll, backspace, toggleSign, handleOperator, handleEquals, handleSqrt, handlePercentage],
  );

  // -------- Keyboard Support --------

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key;

      if (key >= '0' && key <= '9')           return handleButtonClick(key);
      if (key === '.')                         return handleButtonClick('.');
      if (key === '+')                         return handleButtonClick('+');
      if (key === '-')                         return handleButtonClick('-');
      if (key === '*')                         return handleButtonClick('×');
      if (key === '/')                         { e.preventDefault(); return handleButtonClick('÷'); }
      if (key === '^')                         return handleButtonClick('xʸ');
      if (key === '%')                         return handleButtonClick('%');
      if (key === 'Enter' || key === '=')      { e.preventDefault(); return handleButtonClick('='); }
      if (key === 'Backspace')                 return handleButtonClick('⌫');
      if (key === 'Escape' || key === 'Delete') return handleButtonClick('C');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleButtonClick]);

  // -------- Render --------

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <Display
        expression={expression}
        value={display}
        hasError={hasError}
        isLoading={isLoading}
        animate={animateResult}
      />

      <div className="button-grid">
        {BUTTON_LAYOUT.map(([label, variant, extraClass]) => (
          <Button
            key={label}
            label={label}
            variant={variant}
            className={extraClass}
            onClick={handleButtonClick}
          />
        ))}
      </div>
    </div>
  );
}
