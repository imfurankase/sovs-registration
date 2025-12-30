# Integration Guide - Using Improvements in Screens

This guide shows how to integrate the new improvements into your existing registration screens.

## Example 1: CreateAccountScreen with Form Persistence and Validation

```typescript
import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, Alert } from 'react-native';
import { useFormPersistence } from '@/contexts/FormPersistenceContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { validatePasswordStrength, validateEmail } from '@/utils/validation';
import { registrationService } from '@/services/registration';
import { addErrorLog } from '@/services/logging';

export default function CreateAccountScreen() {
  const { saveFormData } = useFormPersistence();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Auto-save form data
  const handleEmailChange = (text: string) => {
    setEmail(text);
    saveFormData({ email: text });
  };

  // Validate password with visual feedback
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const strength = validatePasswordStrength(text);
    setPasswordErrors(strength.errors);
    saveFormData({ password: text });
  };

  // Create account with error handling
  const handleCreateAccount = async () => {
    try {
      // Validate inputs
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        Alert.alert('Validation Error', emailValidation.error);
        return;
      }

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        Alert.alert('Weak Password', passwordValidation.errors[0]);
        return;
      }

      setIsLoading(true);

      // Call service with built-in retry logic
      const result = await registrationService.completeRegistration({
        email,
        password,
        phone_number: '1234567890',
        name: 'John',
        surname: 'Doe',
        dob: '1990-01-01',
        national_id: '123456',
      });

      // Success
      Alert.alert('Success', 'Account created successfully!');
      await saveFormData({}); // Clear form data after success
    } catch (error: any) {
      addErrorLog('Account creation failed', error);
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <LoadingOverlay 
        visible={isLoading} 
        message="Creating your account..."
      />
      
      <TextInput
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Email"
      />

      <TextInput
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="Password"
        secureTextEntry
      />

      {passwordErrors.length > 0 && (
        <View style={{ backgroundColor: '#fee2e2', padding: 12 }}>
          {passwordErrors.map((error, i) => (
            <Text key={i} style={{ color: '#991b1b' }}>
              • {error}
            </Text>
          ))}
        </View>
      )}

      <Pressable onPress={handleCreateAccount} disabled={isLoading}>
        <Text>Create Account</Text>
      </Pressable>
    </View>
  );
}
```

## Example 2: DiditVerifyScreen with Error Recovery

```typescript
import { useState } from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { diditService } from '@/services/didit';
import { addErrorLog, addInfoLog } from '@/services/logging';

export default function DiditVerifyScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleVerifyIdentity = async () => {
    try {
      setError(null);
      setIsLoading(true);

      addInfoLog('Starting Didit verification');

      // This will automatically retry 3 times with exponential backoff
      const session = await diditService.createSession();

      addInfoLog('Didit session created', { sessionId: session.session_id });
      // Navigate to next screen...
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed. Please try again.';
      
      addErrorLog('Didit verification failed', error, {
        retryCount,
        lastError: errorMessage,
      });

      setError(errorMessage);

      // Allow manual retry
      if (retryCount < 3) {
        Alert.alert(
          'Verification Failed',
          errorMessage,
          [
            {
              text: 'Retry',
              onPress: () => {
                setRetryCount(retryCount + 1);
                handleVerifyIdentity();
              },
            },
            { text: 'Cancel', onPress: () => {} },
          ]
        );
      } else {
        Alert.alert(
          'Multiple Failures',
          'Please check your connection and try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <LoadingOverlay 
        visible={isLoading} 
        message={`Verifying identity... (Attempt ${retryCount + 1})`}
      />

      {error && (
        <View style={{ backgroundColor: '#fee2e2', padding: 16, borderRadius: 8 }}>
          <Text style={{ color: '#991b1b', marginBottom: 12 }}>
            {error}
          </Text>
          <Pressable
            onPress={handleVerifyIdentity}
            style={{ 
              backgroundColor: '#667eea', 
              padding: 12, 
              borderRadius: 8 
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={handleVerifyIdentity} disabled={isLoading}>
        <Text>Start Verification</Text>
      </Pressable>
    </View>
  );
}
```

## Example 3: EmailAvailabilityCheck with Caching

```typescript
import { useState, useCallback } from 'react';
import { TextInput, Text, View } from 'react-native';
import { registrationService } from '@/services/registration';
import { addDebugLog } from '@/services/logging';

export default function EmailCheck() {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const checkEmail = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck.includes('@')) return;

    try {
      setIsChecking(true);
      addDebugLog('Checking email availability', { email: emailToCheck });

      const result = await registrationService.checkEmailExists(emailToCheck);

      setAvailable(!result.exists);
      
      if (result.exists) {
        addDebugLog('Email already registered', { email: emailToCheck });
      } else {
        addDebugLog('Email available', { email: emailToCheck });
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Debounce the check
    const timer = setTimeout(() => checkEmail(text), 500);
    return () => clearTimeout(timer);
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Enter email"
      />

      {isChecking && <Text>Checking availability...</Text>}

      {available === true && (
        <Text style={{ color: '#10b981' }}>✓ Email is available</Text>
      )}

      {available === false && (
        <Text style={{ color: '#ef4444' }}>✗ Email is already registered</Text>
      )}
    </View>
  );
}
```

## Example 4: App Layout with ErrorBoundary and Persistence

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FormPersistenceProvider } from '@/contexts/FormPersistenceContext';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <FormPersistenceProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </FormPersistenceProvider>
    </ErrorBoundary>
  );
}
```

## Example 5: Comprehensive Form with All Features

```typescript
import { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Pressable, 
  Text, 
  ScrollView,
  Alert 
} from 'react-native';
import { useFormPersistence } from '@/contexts/FormPersistenceContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { validateRegistration, FieldError } from '@/utils/validation';
import { registrationService } from '@/services/registration';
import { addErrorLog } from '@/services/logging';

interface FormData {
  email?: string;
  phone?: string;
  password?: string;
  passwordConfirm?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationalId?: string;
}

export default function ComprehensiveRegistration() {
  const { formData: savedData, saveFormData, loadFormData } = useFormPersistence();
  const [formData, setFormData] = useState<FormData>({});
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved form data on mount
  useEffect(() => {
    const load = async () => {
      const data = await loadFormData();
      if (data) {
        setFormData(data as FormData);
      }
    };
    load();
  }, []);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    saveFormData(newFormData);

    // Validate and show errors in real-time
    const validation = validateRegistration(newFormData);
    setFieldErrors(validation.errors);
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find(e => e.field === field)?.message;
  };

  const handleSubmit = async () => {
    try {
      // Validate all fields
      const validation = validateRegistration(formData);
      if (!validation.valid) {
        setFieldErrors(validation.errors);
        Alert.alert('Validation Error', validation.errors[0]?.message);
        return;
      }

      setIsLoading(true);

      // Submit with built-in retry logic
      const result = await registrationService.completeRegistration({
        email: formData.email!,
        phone_number: formData.phone!,
        password: formData.password!,
        password_confirm: formData.passwordConfirm!,
        name: formData.firstName!,
        surname: formData.lastName!,
        dob: formData.dateOfBirth!,
        national_id: formData.nationalId!,
      });

      Alert.alert('Success', 'Account created! Redirecting...');
      await saveFormData({}); // Clear after success
      // Navigate to next screen
    } catch (error: any) {
      addErrorLog('Registration failed', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const FormField = ({
    label,
    field,
    placeholder,
    secureTextEntry,
  }: {
    label: string;
    field: keyof FormData;
    placeholder: string;
    secureTextEntry?: boolean;
  }) => {
    const error = getFieldError(field);

    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>{label}</Text>
        <TextInput
          value={formData[field] || ''}
          onChangeText={(text) => handleFieldChange(field, text)}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          style={{
            borderWidth: 1,
            borderColor: error ? '#ef4444' : '#ddd',
            borderRadius: 8,
            padding: 12,
          }}
        />
        {error && (
          <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
            {error}
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <LoadingOverlay 
        visible={isLoading} 
        message="Creating your account..."
      />

      <FormField
        label="Email"
        field="email"
        placeholder="you@example.com"
      />
      <FormField
        label="Phone"
        field="phone"
        placeholder="+1 (555) 000-0000"
      />
      <FormField
        label="First Name"
        field="firstName"
        placeholder="John"
      />
      <FormField
        label="Last Name"
        field="lastName"
        placeholder="Doe"
      />
      <FormField
        label="Date of Birth"
        field="dateOfBirth"
        placeholder="YYYY-MM-DD"
      />
      <FormField
        label="National ID"
        field="nationalId"
        placeholder="123456789"
      />
      <FormField
        label="Password"
        field="password"
        placeholder="Password"
        secureTextEntry
      />
      <FormField
        label="Confirm Password"
        field="passwordConfirm"
        placeholder="Confirm Password"
        secureTextEntry
      />

      <Pressable
        onPress={handleSubmit}
        disabled={isLoading}
        style={{
          backgroundColor: '#667eea',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
```

## Best Practices

### 1. Always Use Error Boundary
Wrap your app with `<ErrorBoundary>` to catch unexpected errors.

### 2. Leverage Form Persistence
Always call `saveFormData()` after user input to prevent data loss.

### 3. Validate Before Submit
Use validation utilities before making API calls.

### 4. Use Loading Overlay
Always show loading state during async operations.

### 5. Log Important Events
Use logging service to track user flow and errors:
```typescript
import { addInfoLog, addErrorLog } from '@/services/logging';

addInfoLog('User started registration');
addErrorLog('Email check failed', error);
```

### 6. Handle Timeouts Gracefully
The services automatically handle timeouts, but provide user feedback:
```typescript
try {
  await someAsyncOperation();
} catch (error) {
  if (error.message.includes('timeout')) {
    Alert.alert('Slow Connection', 'Please try again');
  }
}
```

## Testing Your Improvements

### Test Form Persistence
1. Fill out a form partially
2. Close the app completely
3. Reopen the app
4. Form data should be restored (within 15 minutes)

### Test Error Recovery
1. Turn off internet
2. Try to submit a form
3. Should show error with retry option
4. Turn internet back on and retry
5. Should succeed

### Test Validation
1. Enter invalid email
2. Should show error immediately
3. Correct the email
4. Error should disappear

### Test Logging
```typescript
import { logger } from '@/services/logging';

// In your app
const logs = logger.getLogs();
console.log(JSON.stringify(logs, null, 2));
```

## Troubleshooting

### Issue: Form data not persisting
- Check `RECOVERY_TIMEOUT` - data may have expired
- Verify AsyncStorage permissions are granted
- Check browser console for storage errors

### Issue: Endless retry loop
- Check network connectivity
- Verify API endpoint is correct
- Check request payload format

### Issue: App crashes
- Ensure `ErrorBoundary` wraps your entire app
- Check console for error messages
- Verify component import paths

## Performance Tips

1. **Debounce form saves**: Don't save on every keystroke
2. **Clear cache**: Call `clearCache()` after large operations
3. **Limit logs**: Logs are capped at 100 entries
4. **Memoize validators**: Use `useMemo` for expensive validations

---

For more information, see [IMPROVEMENTS.md](./IMPROVEMENTS.md)
