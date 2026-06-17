/* ============================================================
   CALCULATOR COMPONENT TESTS — src/__tests__/Calculator.test.jsx
   Integration tests for the Calculator component.
   ============================================================ */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calculator from '../components/Calculator';

// Mock the API module
vi.mock('../services/api', () => ({
  calculate: vi.fn(),
}));

import { calculate } from '../services/api';

describe('Calculator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the calculator with all buttons', () => {
    render(<Calculator />);

    // Number buttons
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }

    // Operator buttons
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '-' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '÷' })).toBeInTheDocument();

    // Function buttons
    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument();
  });

  it('displays initial value of 0', () => {
    const { container } = render(<Calculator />);
    const displayValue = container.querySelector('.display__value');
    expect(displayValue).toHaveTextContent('0');
  });

  it('inputs digits and displays them', () => {
    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('clears the display on C press', () => {
    const { container } = render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: 'C' }));

    const displayValue = container.querySelector('.display__value');
    expect(displayValue).toHaveTextContent('0');
  });

  it('handles decimal point input', () => {
    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '.' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('prevents multiple decimal points', () => {
    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '.' }));
    fireEvent.click(screen.getByRole('button', { name: '.' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));

    expect(screen.getByText('3.1')).toBeInTheDocument();
  });

  it('performs addition via API', async () => {
    calculate.mockResolvedValueOnce({
      success: true,
      result: 8,
      operation: 'add',
      expression: '3 + 5 = 8',
    });

    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '=' }));

    await waitFor(() => {
      expect(calculate).toHaveBeenCalledWith('add', 3, 5);
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('displays error when API call fails', async () => {
    calculate.mockRejectedValueOnce(new Error('Division by zero is not allowed'));

    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '÷' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '=' }));

    await waitFor(() => {
      expect(screen.getByText('Cannot divide by zero.')).toBeInTheDocument();
    });
  });

  it('handles backspace', () => {
    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '⌫' }));

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('handles sign toggle', () => {
    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '±' }));

    expect(screen.getByText('-5')).toBeInTheDocument();
  });
  it('handles percentage button', () => {
    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '%' }));

    const displayValue = container.querySelector('.display__value');
    expect(displayValue).toHaveTextContent('0.5');
  });

  it('handles unknown button gracefully', () => {
    render(<Calculator />);
    const btn = screen.getByRole('button', { name: '5' });
    fireEvent.click(btn);
  });

  it('supports keyboard inputs', () => {
    const { container } = render(<Calculator />);
    
    const events = [
      { key: '1' },
      { key: '+' },
      { key: '2' },
      { key: 'Enter' },
      { key: 'Backspace' },
      { key: 'Escape' },
      { key: '/' },
      { key: '*' },
      { key: '-' },
      { key: '^' },
      { key: '%' },
      { key: '.' },
      { key: 'Delete' },
      { key: 'a' } // ignore unmapped
    ];

    act(() => {
      events.forEach(e => {
        fireEvent.keyDown(window, e);
      });
    });

    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
  });
});
