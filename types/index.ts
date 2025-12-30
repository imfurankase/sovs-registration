// User-related types
export interface User {
  user_id: string;
  phone_number: string;
  email: string;
  name: string;
  surname: string;
  date_of_birth: string;
  password_hash?: string;
  two_factor_secret?: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: number;
  assigned_at: string;
}

// Didit-related types
export interface DiditSessionData {
  session_id: string;
  status: string;
  user_info?: {
    national_id: string;
    name: string;
    surname: string;
    phone_number: string;
    father_name: string;
    mother_name: string;
    dob: string;
    address: string;
    place_of_birth: string;
  };
  created_at: string;
}

export interface DiditVerificationResponse {
  session_id: string;
  verified: boolean;
  user_data?: {
    national_id: string;
    name: string;
    surname: string;
    phone_number: string;
    father_name: string;
    mother_name: string;
    dob: string;
    address: string;
    place_of_birth: string;
  };
  error?: string;
}

// Registration form types
export interface RegistrationFormData {
  // Didit verified data
  national_id: string;
  name: string;
  surname: string;
  dob: string;
  
  // User input data
  phone_number: string;
  email: string;
  password: string;
  password_confirm: string;
  
  // Approvals
  terms_accepted: boolean;
  data_approved: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegistrationResponse {
  user_id: string;
  auth_user_id: string;
  status: string;
  message: string;
}

// Roles enum
export enum UserRole {
  VOTER = 1,
  CANDIDATE = 2,
  ADMIN = 3,
  SUPER_ADMIN = 4,
}
