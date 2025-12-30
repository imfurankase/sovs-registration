import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/contexts/RegistrationContext';
import { diditService } from '@/services';

export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { updateFormData, setDiditSession, setCurrentStep } = useRegistration();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleStartRegistration = async () => {
    if (!termsAccepted) {
      Alert.alert('Required', 'Please accept the terms and conditions to continue');
      return;
    }

    setLoading(true);
    try {
      // Create a Didit session
      const session = await diditService.createSession();
      setDiditSession(session);
      updateFormData({ terms_accepted: true });
      setCurrentStep('didit');
      
      // Navigate to Didit verification screen
      router.push('/didit-verify');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SOVS Registration</Text>
        <Text style={styles.subtitle}>Voter Registration System</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Welcome to the Voting System</Text>
          <Text style={styles.description}>
            This application will help you register as a voter. During the registration process, you will:
          </Text>

          <View style={styles.steps}>
            <StepItem
              number={1}
              title="Verify Your Identity"
              description="Complete identity verification through Didit"
            />
            <StepItem
              number={2}
              title="Review Your Details"
              description="Confirm the information retrieved from identity verification"
            />
            <StepItem
              number={3}
              title="Create Your Account"
              description="Set up your password and contact information"
            />
            <StepItem
              number={4}
              title="Complete Registration"
              description="Your registration will be submitted for approval"
            />
          </View>
        </View>

        <View style={styles.termsSection}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View
              style={[styles.checkboxInner, termsAccepted && styles.checkboxChecked]}
            >
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the terms and conditions and consent to the processing of my personal data for voter registration
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, !termsAccepted && styles.buttonDisabled]}
          onPress={handleStartRegistration}
          disabled={!termsAccepted || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Starting...' : 'Start Registration'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Information</Text>
          <Text style={styles.infoText}>
            Your personal data will be processed securely and only used for voter registration purposes.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

interface StepItemProps {
  number: number;
  title: string;
  description: string;
}

const StepItem: React.FC<StepItemProps> = ({ number, title, description }) => (
  <View style={styles.step}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  steps: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  termsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E8F5FF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0051BA',
    lineHeight: 18,
  },
});
