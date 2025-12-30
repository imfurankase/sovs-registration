import { createClient } from '@supabase/supabase-js';
import { addErrorLog, addDebugLog } from './logging';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://api.sovsapp.tech';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Request configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // milliseconds

// Cache for API requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const requestCache = new Map<string, CacheEntry<any>>();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const getSupabaseClient = () => supabase;

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string): void {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
}

/**
 * Get cached data if valid
 */
export function getCachedData<T>(key: string): T | null {
  const entry = requestCache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data;
  }
  requestCache.delete(key);
  return null;
}

/**
 * Set cache with TTL
 */
export function setCacheData<T>(key: string, data: T, ttlMs: number = 300000): void {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

/**
 * Execute with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = REQUEST_TIMEOUT
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('Request timeout')),
        ms
      );
    }),
  ]).finally(() => clearTimeout(timeoutId));
}

/**
 * Retry logic for failed requests
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY,
  shouldRetry?: (error: any) => boolean
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if we should retry based on error type
      const isRetryable = shouldRetry?.(error) ?? isRetryableError(error);
      
      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const backoffDelay = delayMs * Math.pow(2, attempt - 1);
      addDebugLog(`Retry attempt ${attempt}/${maxAttempts}`, {
        delayMs: backoffDelay,
        error: error?.message,
      });
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Don't retry auth errors
  if (error.status === 401 || error.status === 403) {
    return false;
  }

  // Don't retry validation errors
  if (error.status === 400) {
    return false;
  }

  // Retry network errors and server errors
  return true;
}
