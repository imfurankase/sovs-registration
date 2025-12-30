import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase, withRetry, withTimeout, REQUEST_TIMEOUT } from './supabase';
import * as Types from '@/types';
import { addErrorLog, addInfoLog, addDebugLog } from './logging';

const API_BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_URL || 'https://api.sovsapp.tech/functions/v1';

interface RegistrationCheckResult {
  exists: boolean;
  error?: string;
}

class RegistrationService {
  private api: AxiosInstance;
  private checkCache = new Map<string, { result: boolean; timestamp: number }>();
  private cacheTTL = 60000; // 1 minute

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
        addErrorLog('Registration API error', error, {
          url: error.config?.url,
          status: error.response?.status,
        });
        throw error;
      }
    );
  }

  /**
   * Complete user registration - creates user in database and auth
   */
  async completeRegistration(data: Types.RegistrationFormData): Promise<Types.RegistrationResponse> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      addDebugLog('Starting user registration', {
        email: data.email,
        phone_number: data.phone_number,
        name: data.name,
      });

      // Create user in Supabase Auth with retry logic
      const authData = await withRetry(
        () => withTimeout(
          supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                name: data.name,
                surname: data.surname,
                phone_number: data.phone_number,
                national_id: data.national_id,
              },
            },
          }).then(result => {
            if (result.error) throw result.error;
            return result.data;
          }),
          REQUEST_TIMEOUT
        ),
        2,
        1000
      );

      if (!authData.user?.id) {
        throw new Error('Failed to create authentication user');
      }

      addDebugLog('Auth user created', { user_id: authData.user.id });

      // Call edge function to create user record and assign role with retry
      const response = await withRetry(
        () => withTimeout(
          this.api.post<Types.RegistrationResponse>('/register-voter', {
            user_id: authData.user.id,
            email: data.email,
            phone_number: data.phone_number,
            name: data.name,
            surname: data.surname,
            date_of_birth: data.dob,
            national_id: data.national_id,
            status: 'pending',
            role_id: 1, // Voter role
          }).then(result => result.data),
          REQUEST_TIMEOUT
        ),
        3,
        1000,
        (error) => !(error instanceof AxiosError && error.response?.status === 401)
      );

      addInfoLog('User registration completed', {
        user_id: response.user_id || authData.user.id,
        status: response.status,
      });

      return {
        user_id: response.user_id || authData.user.id,
        auth_user_id: authData.user.id,
        status: response.status || 'pending',
        message: response.message || 'Registration successful',
      };
    } catch (error: any) {
      addErrorLog('Registration failed', error, { data });
      
      // Provide user-friendly error messages
      const message = this.getErrorMessage(error);
      throw new Error(message);
    }
  }

  /**
   * Check if email is already registered with caching and retry
   */
  async checkEmailExists(email: string): Promise<RegistrationCheckResult> {
    const cacheKey = `email-${email}`;
    
    // Check cache
    const cached = this.checkCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { exists: cached.result };
    }

    try {
      const { data, error } = await withRetry(
        () => withTimeout(
          supabase
            .from('users')
            .select('user_id', { count: 'exact' })
            .eq('email', email)
            .then(result => result),
          REQUEST_TIMEOUT
        ),
        2,
        500
      );

      const exists = !error && data && data.length > 0;
      this.checkCache.set(cacheKey, { result: exists, timestamp: Date.now() });
      
      return { exists };
    } catch (error: any) {
      addErrorLog('Error checking email existence', error, { email });
      return { exists: false, error: 'Could not verify email availability' };
    }
  }

  /**
   * Check if phone number is already registered with caching and retry
   */
  async checkPhoneExists(phoneNumber: string): Promise<RegistrationCheckResult> {
    const cacheKey = `phone-${phoneNumber}`;
    
    // Check cache
    const cached = this.checkCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { exists: cached.result };
    }

    try {
      const { data, error } = await withRetry(
        () => withTimeout(
          supabase
            .from('users')
            .select('user_id', { count: 'exact' })
            .eq('phone_number', phoneNumber)
            .then(result => result),
          REQUEST_TIMEOUT
        ),
        2,
        500
      );

      const exists = !error && data && data.length > 0;
      this.checkCache.set(cacheKey, { result: exists, timestamp: Date.now() });
      
      return { exists };
    } catch (error: any) {
      addErrorLog('Error checking phone existence', error, { phoneNumber });
      return { exists: false, error: 'Could not verify phone availability' };
    }
  }

  /**
   * Validate all registration data
   */
  private validateRegistrationData(data: Types.RegistrationFormData): { valid: boolean; error?: string } {
    if (!data.email?.trim()) {
      return { valid: false, error: 'Email is required' };
    }
    if (!this.validateEmail(data.email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    if (!data.phone_number?.trim()) {
      return { valid: false, error: 'Phone number is required' };
    }
    if (!this.validatePhoneNumber(data.phone_number)) {
      return { valid: false, error: 'Invalid phone number format' };
    }
    if (!data.password?.trim()) {
      return { valid: false, error: 'Password is required' };
    }
    
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }
    
    if (data.password !== data.password_confirm) {
      return { valid: false, error: 'Passwords do not match' };
    }
    if (!data.name?.trim() || !data.surname?.trim()) {
      return { valid: false, error: 'Name and surname are required' };
    }
    
    return { valid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    return { valid: true };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Simple validation - adjust based on your country's phone format
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.checkCache.clear();
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (typeof error.message === 'string') {
      // Auth-related errors
      if (error.message.includes('User already registered')) {
        return 'This email is already registered. Please use another email or login.';
      }
      if (error.message.includes('password')) {
        return 'Password does not meet the security requirements.';
      }
      if (error.message.includes('email')) {
        return 'Invalid email address. Please try again.';
      }
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return 'Request took too long. Please check your connection and try again.';
      }
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
  }
}

export const registrationService = new RegistrationService();
