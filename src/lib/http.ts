/**
 * HTTP utilities with retry logic
 * @ai-context Robust HTTP client with exponential backoff
 */

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          // Only add Content-Type for non-GET requests to avoid CORS preflight
          ...(options.method && options.method !== 'GET' && {
            'Content-Type': 'application/json',
          }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Fetch attempt ${attempt + 1} failed:`, error);

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 500;
      await sleep(delay + jitter);
    }
  }

  throw new Error(
    `Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Fetch text content with retry
 */
export async function fetchTextWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Fetch text attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        break;
      }

      const delay = 1000 * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw new Error(
    `Failed to fetch text after ${maxRetries} retries: ${lastError?.message}`
  );
}

