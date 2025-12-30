import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistration } from '@/contexts/RegistrationContext';

export const SuccessScreen: React.FC = () => {
  const router = useRouter();
  const { reset, formData } = useRegistration();

  const handleFinish = () => {
    reset();
    router.push('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Registration Successful!</Text>

        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Your Registration is Pending Approval</Text>
          <Text style={styles.messageText}>
            Welcome, {formData.name}! Your voter registration has been submitted successfully.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <InfoItem
            number={1}
            title="Email Verification"
            description="Check your email to verify your account"
          />
          <InfoItem
            number={2}
            title="Administrator Review"
            description="Our team will review your registration within 24-48 hours"
          />
          <InfoItem
            number={3}
            title="Approval Notification"
            description="You will receive an email when your status is approved"
          />
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Registration Details</Text>
          <DetailLine label="Name" value={`${formData.name} ${formData.surname}`} />
          <DetailLine label="Email" value={formData.email} />
          <DetailLine label="Phone" value={formData.phone_number} />
          <DetailLine label="Status" value="Pending Approval" />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Please check your email for further instructions and to complete email verification.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

interface InfoItemProps {
  number: number;
  title: string;
  description: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ number, title, description }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoNumber}>
      <Text style={styles.infoNumberText}>{number}</Text>
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoDescription}>{description}</Text>
    </View>
  </View>
);

interface DetailLineProps {
  label: string;
  value: string;
}

const DetailLine: React.FC<DetailLineProps> = ({ label, value }) => (
  <View style={styles.detailLine}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
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
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  messageBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    color: '#388e3c',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 18,
  },
});
