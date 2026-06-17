/* ============================================================
   API CLIENT TESTS — src/__tests__/api.test.js
   Unit tests for the API service with mocked fetch.
   ============================================================ */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculate } from '../services/api';

describe('API Client — calculate()', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends a correct POST request for a binary operation', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        result: 15,
        operation: 'add',
        expression: '10 + 5 = 15',
      }),
    });

    const data = await calculate('add', 10, 5);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toBe('/api/v1/calculate');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ operation: 'add', a: 10, b: 5 });
    expect(data.result).toBe(15);
  });

  it('sends a correct POST request for sqrt (unary)', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        result: 4,
        operation: 'sqrt',
        expression: '√16 = 4',
      }),
    });

    const data = await calculate('sqrt', 16);

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ operation: 'sqrt', a: 16 });
    expect(data.result).toBe(4);
  });

  it('throws a normalised error when the server returns an error response', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: 'Division by zero is not allowed',
      }),
    });

    await expect(calculate('divide', 10, 0)).rejects.toThrow(
      'Division by zero is not allowed',
    );
  });

  it('throws a network error when fetch fails', async () => {
    globalThis.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(calculate('add', 1, 2)).rejects.toThrow(
      'Network error — could not reach the server.',
    );
  });

  it('throws when the response is not valid JSON', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });

    await expect(calculate('add', 1, 2)).rejects.toThrow(
      'Invalid response from server.',
    );
  });

  it('throws when the response is missing the result field', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(calculate('add', 1, 2)).rejects.toThrow(
      'Invalid response from server.',
    );
  });

  it('falls back to default server error message', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
      }),
    });

    await expect(calculate('add', 1, 2)).rejects.toThrow('Server error (500)');
  });
});
