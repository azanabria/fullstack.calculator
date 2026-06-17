import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Display from '../components/Display';

describe('Display Component', () => {
  it('renders default 0 when value is empty', () => {
    const { container } = render(<Display value="" expression="" />);
    const displayValue = container.querySelector('.display__value');
    expect(displayValue).toHaveTextContent('0');
  });

  it('renders default nbsp when expression is empty', () => {
    const { container } = render(<Display value="5" expression="" />);
    const displayExpression = container.querySelector('.display__expression');
    expect(displayExpression.textContent).toBe('\u00A0');
  });
});
