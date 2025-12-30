import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/contexts/RegistrationContext';
import { capitalizeFirstLetter } from '@/utils/helpers';

export const VerificationDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep } = useRegistration();
  const [dataApproved, setDataApproved] = useState(false);

  const handleApprove = () => {
    if (!dataApproved) {
      Alert.alert('Required', 'Please confirm that the information is correct');
      return;
    }
    
    updateFormData({ data_approved: true });
    setCurrentStep('details');
    router.push('/create-account');
  };

  const handleEdit = () => {
    Alert.alert(
      'Edit Information',
      'You need to go through identity verification again to edit your information',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Over',
          onPress: () => router.push('/'),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Information</Text>
        <Text style={styles.subtitle}>
          Please review the details below that were retrieved from your identity verification
        </Text>

        <View style={styles.detailsCard}>
          <DetailRow
            label="Full Name"
            value={`${capitalizeFirstLetter(formData.name || '')} ${capitalizeFirstLetter(
              formData.surname || ''
            )}`}
          />
          <Divider />
          <DetailRow label="Date of Birth" value={formData.dob || 'N/A'} />
          <Divider />
          <DetailRow label="National ID" value={formData.national_id || 'N/A'} />
        </View>

        <View style={styles.checkboxSection}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setDataApproved(!dataApproved)}
          >
            <View
              style={[styles.checkboxInner, dataApproved && styles.checkboxChecked]}
            >
              {dataApproved && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I confirm that the information above is correct and accurate
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, !dataApproved && styles.buttonDisabled]}
          onPress={handleApprove}
          disabled={!dataApproved}
        >
          <Text style={styles.buttonText}>Continue to Account Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Text style={styles.editButtonText}>Information Incorrect? Start Over</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            This information will be used to create your voter registration account
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  checkboxSection: {
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
  checkboxText: {
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
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E8F5FF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 13,
    color: '#0051BA',
    lineHeight: 18,
  },
});
