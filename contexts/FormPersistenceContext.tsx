/**
 * Form Persistence Context
 * Handles saving and recovering form state across screens
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Types from '@/types';
import { addErrorLog } from '@/services/logging';

const STORAGE_KEY = '@sovs_registration_form';
const RECOVERY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

interface FormPersistenceContextType {
  formData: Partial<Types.RegistrationFormData>;
  saveFormData: (data: Partial<Types.RegistrationFormData>) => Promise<void>;
  loadFormData: () => Promise<Partial<Types.RegistrationFormData> | null>;
  clearFormData: () => Promise<void>;
  lastSaved?: number;
}

const FormPersistenceContext = createContext<FormPersistenceContextType | undefined>(undefined);

export function FormPersistenceProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Partial<Types.RegistrationFormData>>({});
  const [lastSaved, setLastSaved] = useState<number | undefined>();

  /**
   * Save form data to AsyncStorage
   */
  const saveFormData = async (data: Partial<Types.RegistrationFormData>) => {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setFormData(data);
      setLastSaved(Date.now());
    } catch (error) {
      addErrorLog('Failed to save form data', error);
    }
  };

  /**
   * Load form data from AsyncStorage
   */
  const loadFormData = async (): Promise<Partial<Types.RegistrationFormData> | null> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const payload = JSON.parse(stored);
      const savedTime = payload.timestamp;

      // Check if data is still valid (recovery timeout)
      if (Date.now() - savedTime > RECOVERY_TIMEOUT) {
        await clearFormData();
        return null;
      }

      setFormData(payload.data);
      setLastSaved(savedTime);
      return payload.data;
    } catch (error) {
      addErrorLog('Failed to load form data', error);
      return null;
    }
  };

  /**
   * Clear form data from storage
   */
  const clearFormData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setFormData({});
      setLastSaved(undefined);
    } catch (error) {
      addErrorLog('Failed to clear form data', error);
    }
  };

  // Load form data on mount
  useEffect(() => {
    loadFormData();
  }, []);

  return (
    <FormPersistenceContext.Provider
      value={{
        formData,
        saveFormData,
        loadFormData,
        clearFormData,
        lastSaved,
      }}
    >
      {children}
    </FormPersistenceContext.Provider>
  );
}

/**
 * Hook to use form persistence
 */
export function useFormPersistence() {
  const context = useContext(FormPersistenceContext);
  if (!context) {
    throw new Error('useFormPersistence must be used within FormPersistenceProvider');
  }
  return context;
}
