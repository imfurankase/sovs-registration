# SOVS Registration App - Setup Guide

Complete setup instructions for the SOVS Registration application.

## Overview

The SOVS Registration App is a React Native application built with Expo that allows users to:
1. Register as voters in the election system
2. Complete identity verification through Didit
3. Create secure accounts with password requirements
4. Be assigned the voter role in the system

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
  ```bash
  node --version  # Should be v18+
  ```

- **npm** or **yarn** installed
  ```bash
  npm --version
  yarn --version
  ```

- **Expo CLI** installed globally
  ```bash
  npm install -g expo-cli
  ```

- **Supabase Account** with:
  - Project created and running
  - Database configured with schema
  - Service role key obtained

- **Didit API Credentials**
  - API key and secret from Didit

## Step 1: Environment Configuration

1. **Navigate to the app directory**:
   ```bash
   cd /root/supabase-project/sovs-registration
   ```

2. **Create .env file from template**:
   ```bash
   cp .env.example .env
   ```

3. **Update .env with your credentials**:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://api.sovsapp.tech
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_FUNCTIONS_URL=https://api.sovsapp.tech/functions/v1
   EXPO_PUBLIC_DIDIT_BASE_URL=https://api.sovsapp.tech/functions/v1
   ```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

This will install all required packages:
- React Native and Expo
- Supabase JS client
- Navigation and routing
- Axios for HTTP requests

## Step 3: Verify Database Schema

Ensure the following tables exist in your Supabase database:

```sql
-- Verify users table
SELECT * FROM public.users LIMIT 1;

-- Verify roles table
SELECT * FROM public.roles LIMIT 1;

-- Verify user_roles table
SELECT * FROM public.user_roles LIMIT 1;

-- Verify activity_logs table
SELECT * FROM public.activity_logs LIMIT 1;
```

If tables don't exist, the schema.sql file should be run first.

## Step 4: Deploy Edge Functions

The app requires the `register-voter` Edge Function to be deployed:

### Option A: Using Supabase CLI

```bash
# Navigate to Supabase project directory
cd /root/supabase-project

# Deploy the function
supabase functions deploy register-voter

# Verify deployment
supabase functions list
```

### Option B: Manual Deployment

1. Go to Supabase Dashboard > Functions
2. Create a new function named `register-voter`
3. Copy contents from `volumes/functions/register-voter/index.ts`
4. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Step 5: Configure Deep Linking

The app uses deep linking for Didit callback. Ensure your Didit configuration includes:

**Redirect URI**: `sovs://verification-complete`

This is configured in `app.json`:
```json
{
  "plugins": [
    [
      "expo-router",
      {
        "origin": "https://api.sovsapp.tech"
      }
    ]
  ]
}
```

## Step 6: Start Development Server

```bash
npm start
# or
yarn start
```

You should see:
```
expo start
expo (SDK 50) - Press Enter to open debugging menu
Expo URL: exp://...
```

## Step 7: Run on Device/Emulator

### iOS (macOS only):
```bash
npm run ios
```

This will:
1. Build the iOS app
2. Start Xcode simulator
3. Load the app

### Android:
```bash
npm run android
```

This will:
1. Build the Android app
2. Start Android emulator
3. Load the app

### Web:
```bash
npm run web
```

Opens the app in your default web browser.

### Using Expo Go:
1. Install Expo Go app on your device (iOS or Android)
2. Scan the QR code from the terminal
3. App will load on your device

## Step 8: Test the Registration Flow

1. **Launch the app**
2. **Read and accept terms**
3. **Click "Start Registration"**
4. **Complete Didit identity verification**
5. **Review verified information**
6. **Enter account details**:
   - Email
   - Phone number
   - Strong password
   - Confirm password
7. **Submit and receive confirmation**

## Database Operations Reference

### Insert Test User (for development)

```sql
INSERT INTO public.users (
  user_id,
  phone_number,
  email,
  name,
  surname,
  date_of_birth,
  status
) VALUES (
  gen_random_uuid(),
  '+12345678901',
  'test@example.com',
  'John',
  'Doe',
  '1990-01-15',
  'pending'
) RETURNING *;
```

### Query Pending Registrations

```sql
SELECT u.*, ur.role_id
FROM public.users u
LEFT JOIN public.user_roles ur ON u.user_id = ur.user_id
WHERE u.status = 'pending'
ORDER BY u.created_at DESC;
```

### View Recent Activities

```sql
SELECT *
FROM public.activity_logs
WHERE action LIKE '%registration%'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

**Solution**:
```bash
npm install @supabase/supabase-js
```

### "Didit verification not opening"

**Check**:
1. Deep linking configuration in `app.json`
2. Didit API credentials are correct
3. Network connectivity
4. Didit callback URL is registered

### "Registration fails with 'user already exists'"

**Solution**:
1. Use a different email address
2. Check if phone number is already registered
3. Clear app data and try again

### "Password validation always fails"

**Requirements**:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

Example valid password: `MyPassword123`

### Build issues on iOS

```bash
# Clean and rebuild
cd ios
rm -rf Pods Podfile.lock
cd ..
npm run ios
```

### Build issues on Android

```bash
# Clean gradle build
cd android
./gradlew clean
cd ..
npm run android
```

## Production Deployment

### Build for iOS:
```bash
npm run build:ios
# Creates a local build that can be distributed
```

### Build for Android:
```bash
npm run build:android
# Creates an APK or AAB for Google Play
```

### Build for Web:
```bash
npm run build:web
# Creates static files in `dist/` directory
```

See [EAS Build documentation](https://docs.expo.dev/build/introduction/) for production builds.

## Security Checklist

- [ ] Environment variables are set in `.env`
- [ ] Sensitive keys are not committed to git
- [ ] HTTPS is used for all API calls
- [ ] Password validation is enforced
- [ ] Email verification is required
- [ ] Activity logging is enabled
- [ ] Database RLS policies are in place (optional but recommended)
- [ ] Service role key is protected and not exposed to client

## Performance Optimization

For optimal app performance:

1. **Use Production Expo SDK**: `expo@50.0.0` or latest stable
2. **Optimize Bundle Size**: Remove unused dependencies
3. **Enable Code Splitting**: Expo router does this automatically
4. **Lazy Load Components**: Use React.lazy() for large components
5. **Cache API Responses**: Implement caching in services
6. **Minimize Re-renders**: Use useMemo and useCallback

## Monitoring & Logging

The app includes:
- Console logging for development
- Activity log persistence in database
- Error tracking and reporting
- Network request logging in services

To view logs:
```bash
# In Expo dev menu
# Press 'D' on keyboard (iOS simulator)
# Press 'M' on keyboard (Android emulator)
# Select "View logs in browser"
```

## Next Steps

After successful setup:

1. **Customize Branding**:
   - Update app icon in `assets/`
   - Update app colors in component styles
   - Update app name in `app.json`

2. **Add Additional Screens**:
   - Create new screen in `app/screens/`
   - Add route in `app/_layout.tsx`
   - Update navigation if needed

3. **Integrate Analytics**:
   - Add Sentry for error tracking
   - Add Firebase Analytics for events
   - Monitor user registration flow

4. **Set Up Notifications**:
   - Configure push notifications
   - Send approval notifications
   - Send rejection notifications with reason

## Support & Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Didit Documentation](https://didit.me/docs)
- [Expo Router Guide](https://expo.github.io/router)

## Common Commands Reference

```bash
# Start development
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android

# Run on web
npm run web

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Install dependencies
npm install

# Clear cache
npm cache clean --force

# View logs
expo logs --clear
```

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error logs in the console
3. Check Expo and Supabase documentation
4. Contact the development team with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS, etc.)
   - Relevant logs
