/* ============================================================
   API CLIENT — src/services/api.js
   Handles all communication with the calculator backend.
   ============================================================ */

/**
 * Base URL for the calculator API.
 * In development, Vite's proxy forwards /api → localhost:8080.
 * In production (Docker), nginx handles the proxy.
 * The env var override is available for non-standard deployments.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Send a calculation request to the backend.
 *
 * @param {string} operation  — one of: add, subtract, multiply, divide, power, sqrt, percentage
 * @param {number} a          — first operand
 * @param {number} [b]        — second operand (optional for sqrt)
 * @returns {Promise<{ result: number }>}
 * @throws {{ message: string }} normalised error object
 */
export async function calculate(operation, a, b) {
  const body = { operation, a };
  if (b !== undefined && b !== null) {
    body.b = b;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/v1/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new Error('Network error — could not reach the server.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Prefer the server's error message if present
    const serverMsg =
      data?.error || data?.message || `Server error (${response.status})`;
    throw new Error(serverMsg);
  }

  if (data === null || data.result === undefined) {
    throw new Error('Invalid response from server.');
  }

  return data;
}
