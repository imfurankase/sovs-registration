import { createContext, useContext, useState, useCallback } from 'react';
import * as Types from '@/types';

interface RegistrationContextType {
  formData: Partial<Types.RegistrationFormData>;
  setFormData: (data: Partial<Types.RegistrationFormData>) => void;
  updateFormData: (updates: Partial<Types.RegistrationFormData>) => void;
  diditSession: Types.DiditSessionData | null;
  setDiditSession: (session: Types.DiditSessionData | null) => void;
  currentStep: 'register' | 'didit' | 'verification' | 'details' | 'complete';
  setCurrentStep: (step: RegistrationContextType['currentStep']) => void;
  reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Partial<Types.RegistrationFormData>>({
    terms_accepted: false,
    data_approved: false,
  });
  const [diditSession, setDiditSession] = useState<Types.DiditSessionData | null>(null);
  const [currentStep, setCurrentStep] = useState<RegistrationContextType['currentStep']>('register');

  const updateFormData = useCallback((updates: Partial<Types.RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setFormData({ terms_accepted: false, data_approved: false });
    setDiditSession(null);
    setCurrentStep('register');
  }, []);

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        setFormData,
        updateFormData,
        diditSession,
        setDiditSession,
        currentStep,
        setCurrentStep,
        reset,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = (): RegistrationContextType => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
};
