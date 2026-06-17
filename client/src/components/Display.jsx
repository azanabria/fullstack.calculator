/* ============================================================
   DISPLAY COMPONENT — src/components/Display.jsx
   Shows the current expression and the result / input value.
   ============================================================ */

import React from 'react';

/**
 * Calculator display area.
 *
 * @param {Object}  props
 * @param {string}  props.expression  — The ongoing expression string (e.g. "12 + 3")
 * @param {string}  props.value       — The current display value
 * @param {boolean} props.hasError    — Whether to render in error state
 * @param {boolean} props.isLoading   — Whether a calculation is in-flight
 * @param {boolean} props.animate     — Whether to animate the result in
 */
export default function Display({ expression, value, hasError, isLoading, animate }) {
  const wrapperClass = [
    'display',
    hasError && 'display--error',
    isLoading && 'display--loading',
  ]
    .filter(Boolean)
    .join(' ');

  const valueClass = [
    'display__value',
    animate && !hasError && 'display__value--animate',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass} role="status" aria-live="polite" aria-label="Calculator display">
      <div className="display__expression">{expression || '\u00A0'}</div>
      <div className={valueClass}>{value || '0'}</div>
    </div>
  );
}
