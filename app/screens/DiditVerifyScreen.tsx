import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/contexts/RegistrationContext';
import { diditService } from '@/services';
import { useDeepLink, extractSessionIdFromUrl } from '@/hooks';

WebBrowser.maybeCompleteAuthSession();

export const DiditVerifyScreen: React.FC = () => {
  const router = useRouter();
  const { diditSession, updateFormData, setCurrentStep } = useRegistration();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDeepLink((url) => {
    handleDeepLink(url);
  });

  const handleDeepLink = async (url: string) => {
    const sessionId = extractSessionIdFromUrl(url);
    if (sessionId && diditSession?.session_id) {
      await verifySession(sessionId);
    }
  };

  const openDiditVerification = async () => {
    if (!diditSession?.session_id) {
      setError('Failed to initialize verification session');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Open the Didit verification URL in web browser
      const diditUrl = `https://api.sovsapp.tech/functions/v1/didit-verify?session_id=${diditSession.session_id}&redirect_uri=sovs://verification-complete`;

      const result = await WebBrowser.openBrowserAsync(diditUrl);

      if (result.type === 'dismiss') {
        setError('Verification cancelled');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open verification');
    } finally {
      setLoading(false);
    }
  };

  const verifySession = async (sessionId: string) => {
    try {
      setLoading(true);
      const verification = await diditService.verifySession(sessionId);

      if (verification.verified && verification.user_data) {
        // Store verified user data in context
        updateFormData({
          national_id: verification.user_data.national_id,
          name: verification.user_data.name,
          surname: verification.user_data.surname,
          dob: verification.user_data.dob,
        });

        setCurrentStep('verification');
        router.push('/verification-details');
      } else {
        setError(verification.error || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify session');
      Alert.alert('Verification Error', err.message || 'Failed to verify your identity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diditSession?.session_id) {
      openDiditVerification();
    } else {
      setError('No verification session found');
    }
  }, [diditSession?.session_id]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {loading && !error && (
          <>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Opening Didit Verification...</Text>
            <Text style={styles.loadingSubtext}>
              Please complete the identity verification process
            </Text>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Verification Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorActions}>
              <Text
                style={styles.retryButton}
                onPress={() => {
                  setError(null);
                  openDiditVerification();
                }}
              >
                Try Again
              </Text>
              <Text
                style={styles.cancelButton}
                onPress={() => router.push('/')}
              >
                Cancel
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingVertical: 12,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    color: '#333',
    paddingVertical: 12,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
});
