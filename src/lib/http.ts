/**
 * HTTP utilities with retry logic
 * @ai-context Robust HTTP fetching with exponential backoff
 */

/**
 * Fetch options with retry configuration
 */
export interface FetchWithRetryOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number; // Initial delay in ms
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch with automatic retries and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        timeout,
      });
      
      // If response is 5xx, retry
      if (response.status >= 500 && attempt < retries) {
        console.warn(`HTTP ${response.status}, retrying... (${attempt + 1}/${retries})`);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < retries) {
        console.warn(
          `Fetch failed (${lastError.message}), retrying... (${attempt + 1}/${retries})`
        );
        await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
      }
    }
  }
  
  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Fetch JSON with retry logic
 */
export async function fetchJSONWithRetry<T>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * POST JSON with retry logic
 */
export async function postJSONWithRetry<T>(
  url: string,
  data: unknown,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
