import React from 'react';
import { Stack } from 'expo-router';
import { RegistrationProvider } from '@/contexts/RegistrationContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <RegistrationProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: 'Back',
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'SOVS Registration',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="didit-verify"
          options={{
            title: 'Identity Verification',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="verification-details"
          options={{
            title: 'Verify Information',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="create-account"
          options={{
            title: 'Create Account',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="success"
          options={{
            title: 'Registration Complete',
            headerBackVisible: false,
          }}
        />
      </Stack>
    </RegistrationProvider>
  );
}
