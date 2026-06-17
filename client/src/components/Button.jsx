/* ============================================================
   BUTTON COMPONENT — src/components/Button.jsx
   Reusable calculator button with variant styling & ripple.
   ============================================================ */

import React, { useCallback } from 'react';

/**
 * A single calculator button.
 *
 * @param {Object}   props
 * @param {string}   props.label     — Text to display on the button
 * @param {Function} props.onClick   — Click handler
 * @param {string}   [props.variant] — 'number' | 'operator' | 'equals' | 'function'
 * @param {string}   [props.className] — Extra CSS classes (e.g. 'btn--zero')
 * @param {string}   [props.ariaLabel] — Override aria-label
 */
export default function Button({ label, onClick, variant = 'number', className = '', ariaLabel }) {
  /**
   * Track the mouse/pointer position so the CSS ripple highlight
   * appears at the correct origin.
   */
  const handlePointerMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--ripple-x', `${x}%`);
    e.currentTarget.style.setProperty('--ripple-y', `${y}%`);
  }, []);

  const classes = [
    'btn',
    `btn--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={() => onClick(label)}
      onPointerMove={handlePointerMove}
      aria-label={ariaLabel || label}
      type="button"
    >
      {label}
    </button>
  );
}
