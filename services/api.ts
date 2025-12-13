import { DEFAULT_API_BASE_URL, ENDPOINT_LABELS } from '../constants';
import { StatResult } from '../types';

// Helper to generate random numbers for demo mode
const getRandomCount = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call backend aggregate endpoint:
 *   GET {baseUrl}/api/hotich/thongke
 * Header:
 *   Authorization: Bearer <token>
 *
 * Response:
 *   { unauthorized: boolean, totals: { [label]: number } }
 */
export const fetchAllStats = async (
  token: string,
  baseUrl: string = DEFAULT_API_BASE_URL,
  useMock: boolean
): Promise<StatResult[]> => {
  const labels = Array.from(ENDPOINT_LABELS);

  // DEMO MODE: Return fake data
  if (useMock) {
    await sleep(600 + Math.random() * 800);
    return labels.map((label) => ({
      label,
      count: getRandomCount(100, 5000),
      loading: false,
      error: false,
    }));
  }

  // No token and not mock -> return errors (FE should show settings)
  if (!token?.trim()) {
    return labels.map((label) => ({
      label,
      count: 0,
      loading: false,
      error: true,
      unauthorized: true,
    }));
  }

  try {
    const cleanBaseUrl = (baseUrl || '').replace(/\/$/, '');
    const url = `${cleanBaseUrl}/api/hotich/thongke`;

    const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authValue,
      },
    });

    // Backend itself says missing/invalid token
    if (response.status === 401) {
      return labels.map((label) => ({
        label,
        count: 0,
        loading: false,
        error: true,
        unauthorized: true,
      }));
    }

    // Other non-OK statuses
    if (!response.ok) {
      return labels.map((label) => ({
        label,
        count: 0,
        loading: false,
        error: true,
      }));
    }

    const data: any = await response.json();

    const totals: Record<string, number> = data?.totals || {};
    const unauthorized: boolean = !!data?.unauthorized;

    // Map totals -> StatResult[]
    return labels.map((label) => ({
      label,
      count: Number(totals[label] ?? 0),
      loading: false,
      error: false,
      unauthorized: unauthorized || false,
    }));
  } catch (error) {
    // Network errors (fetch failed, DNS, blocked, etc.)
    const isNetworkError = error instanceof TypeError;

    return labels.map((label) => ({
      label,
      count: 0,
      loading: false,
      error: true,
      networkError: isNetworkError,
    }));
  }
};

/**
 * Optional: keep compatibility if somewhere still calls fetchSingleStat()
 * It simply calls fetchAllStats() once and returns the requested label.
 */
export const fetchSingleStat = async (
  label: string,
  token: string,
  baseUrl: string = DEFAULT_API_BASE_URL,
  useMock: boolean
): Promise<StatResult> => {
  const results = await fetchAllStats(token, baseUrl, useMock);
  return (
    results.find((r) => r.label === label) || {
      label,
      count: 0,
      loading: false,
      error: true,
    }
  );
};
