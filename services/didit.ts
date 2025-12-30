import axios, { AxiosInstance, AxiosError } from 'axios';
import * as Types from '@/types';
import { withRetry, withTimeout, REQUEST_TIMEOUT } from './supabase';
import { addErrorLog, addDebugLog } from './logging';

const API_BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_URL || 'https://api.sovsapp.tech/functions/v1';

class DiditService {
  private api: AxiosInstance;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error logging
    this.api.interceptors.response.use(
      response => response,
      error => {
        addErrorLog('Didit API error', error, {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.error,
        });
        throw error;
      }
    );
  }

  /**
   * Create a Didit verification session with retry logic
   */
  async createSession(): Promise<Types.DiditSessionData> {
    try {
      return await withRetry(
        () => withTimeout(
          this.api.post<Types.DiditSessionData>('/didit-create-session')
            .then(response => response.data),
          REQUEST_TIMEOUT
        ),
        3,
        1000,
        (error) => !(error instanceof AxiosError && error.response?.status === 401)
      );
    } catch (error: any) {
      addErrorLog('Failed to create Didit session', error);
      throw new Error(
        error.response?.data?.error || 
        'Failed to create Didit session. Please check your connection and try again.'
      );
    }
  }

  /**
   * Get the status and details of a Didit session with caching
   */
  async getSessionDetails(sessionId: string): Promise<Types.DiditSessionData> {
    const cacheKey = `didit-session-${sessionId}`;
    
    // Check cache
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      addDebugLog('Returning cached session details', { sessionId });
      return cached.data;
    }

    try {
      const data = await withRetry(
        () => withTimeout(
          this.api.post<Types.DiditSessionData>('/didit-get-session', {
            session_id: sessionId,
          }).then(response => response.data),
          REQUEST_TIMEOUT
        ),
        3,
        1000
      );

      // Cache the result
      this.requestCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error: any) {
      addErrorLog('Failed to get Didit session details', error, { sessionId });
      throw new Error(
        error.response?.data?.error || 
        'Failed to retrieve session details. Please try again.'
      );
    }
  }

  /**
   * Verify the Didit session and extract user data with retry logic
   */
  async verifySession(sessionId: string): Promise<Types.DiditVerificationResponse> {
    try {
      const data = await withRetry(
        () => withTimeout(
          this.api.post<Types.DiditVerificationResponse>('/didit-verify', {
            session_id: sessionId,
          }).then(response => response.data),
          REQUEST_TIMEOUT
        ),
        3,
        1000
      );

      // Clear cache when verifying
      const cacheKey = `didit-session-${sessionId}`;
      this.requestCache.delete(cacheKey);

      return data;
    } catch (error: any) {
      addErrorLog('Failed to verify Didit session', error, { sessionId });
      throw new Error(
        error.response?.data?.error || 
        'Failed to verify identity. Please try again.'
      );
    }
  }

  /**
   * Get Didit callback data (typically called from deep link)
   */
  async handleCallback(callbackData: any): Promise<Types.DiditSessionData> {
    try {
      return await withRetry(
        () => withTimeout(
          this.api.post<Types.DiditSessionData>('/didit-callback', callbackData)
            .then(response => response.data),
          REQUEST_TIMEOUT
        ),
        2,
        500
      );
    } catch (error: any) {
      addErrorLog('Failed to handle Didit callback', error);
      throw new Error(
        error.response?.data?.error || 
        'Failed to process callback. Please try again.'
      );
    }
  }

  /**
   * Clear cached session data
   */
  clearCache(sessionId?: string): void {
    if (sessionId) {
      this.requestCache.delete(`didit-session-${sessionId}`);
    } else {
      this.requestCache.clear();
    }
  }
}

export const diditService = new DiditService();
