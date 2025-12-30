# SOVS Registration App - Quick Start Guide

Get the SOVS Registration app up and running in 5 minutes!

## 🚀 Quick Start (5 Minutes)

### 1. Navigate to App Directory
```bash
cd /root/supabase-project/sovs-registration
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with your Supabase details (they're already filled in):
```
EXPO_PUBLIC_SUPABASE_URL=https://api.sovsapp.tech
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_FUNCTIONS_URL=https://api.sovsapp.tech/functions/v1
EXPO_PUBLIC_DIDIT_BASE_URL=https://api.sovsapp.tech/functions/v1
```

### 4. Deploy Edge Function
```bash
cd ..
supabase functions deploy register-voter
cd sovs-registration
```

### 5. Start Development Server
```bash
npm start
```

### 6. Run on Device/Emulator
```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📋 What Gets Created

When a user completes registration:

### ✅ In Supabase Auth
- New user account created
- Email verification required
- User ID linked to database

### ✅ In users Table
```sql
INSERT INTO users (
  user_id,          -- From Auth
  email,            -- User input
  phone_number,     -- User input
  name,             -- From Didit
  surname,          -- From Didit
  date_of_birth,    -- From Didit
  status            -- Set to 'pending'
)
```

### ✅ In user_roles Table
```sql
INSERT INTO user_roles (
  user_id,    -- Same as users.user_id
  role_id     -- 1 (Voter)
)
```

### ✅ In activity_logs Table
- Records successful registration
- Stores user action details
- Includes IP address for audit

## 🔄 Registration Flow

```
User Agrees to Terms
        ↓
Click "Start Registration"
        ↓
Complete Didit Identity Verification
        ↓
Review Verified Personal Data
        ↓
Enter Email, Phone, Password
        ↓
Submit Registration
        ↓
Create Supabase Auth User
        ↓
Call register-voter Edge Function
        ↓
Insert User into Database
Assign Voter Role (role_id = 1)
Create Activity Log
        ↓
Show Success Screen
```

## 📱 Screen Navigation

```
Welcome / Register Screen
    ↓
Didit Verification Screen
    ↓
Verification Details Screen
    ↓
Create Account Screen
    ↓
Success Screen
    ↓
Back to Welcome
```

## 🧪 Test the App

### Scenario 1: Complete Registration
1. Launch app
2. Accept terms
3. Click "Start Registration"
4. Complete Didit verification
5. Confirm information
6. Enter: email, phone, password
7. Submit
8. See success screen

### Scenario 2: Test Validation
- Try invalid email ❌
- Try weak password ❌
- Try mismatched passwords ❌
- Try duplicate email ❌

## 📊 Verify in Database

Check registration succeeded:

```sql
-- View newly registered users
SELECT * FROM public.users 
WHERE status = 'pending' 
ORDER BY created_at DESC LIMIT 1;

-- Check role assignment
SELECT * FROM public.user_roles 
WHERE role_id = 1 
ORDER BY assigned_at DESC LIMIT 1;

-- View registration activity
SELECT * FROM public.activity_logs 
WHERE action LIKE '%registration%' 
ORDER BY created_at DESC LIMIT 1;
```

## 🔐 Password Requirements

Valid password example: `MyPassword123`

Requirements:
- ✅ At least 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number

## 📧 What User Receives

After successful registration:

1. **Confirmation Email** - Verify email address
2. **Status Update** - Registration is pending
3. **Next Steps** - Instructions in success screen

## 🛠️ Troubleshooting

### Didit verification not working
- Check Didit API credentials in functions
- Verify deep linking is configured
- Check network connectivity

### Registration fails
- Check Supabase connection
- Verify Edge Function is deployed
- Check environment variables

### Password validation fails
- Must have uppercase and lowercase
- Must have at least one number
- Must be at least 8 characters

## 📚 Full Documentation

- **README.md** - Features and overview
- **SETUP.md** - Detailed setup guide
- **INTEGRATION.md** - Integration details
- **PROJECT_SUMMARY.md** - What's included

## 🚢 Deployment

### Build for iOS
```bash
npm run build:ios
```

### Build for Android
```bash
npm run build:android
```

### Build for Web
```bash
npm run build:web
```

## 📝 Important Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Navigation setup |
| `app/screens/` | All screen components |
| `services/` | API and Supabase integration |
| `contexts/RegistrationContext.tsx` | State management |
| `volumes/functions/register-voter/` | Edge Function |

## 🔑 Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_FUNCTIONS_URL
EXPO_PUBLIC_DIDIT_BASE_URL
```

## ✨ Key Features

✅ Identity verification with Didit
✅ Multi-step registration flow
✅ Real-time form validation
✅ Password strength indicator
✅ Automatic voter role assignment
✅ Activity logging for audit
✅ Cross-platform (iOS/Android/Web)
✅ Full TypeScript support

## 📞 Common Commands

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Build for production
npm run build:ios
npm run build:android
npm run build:web

# Check for errors
npm run lint

# Clear cache
npm cache clean --force
```

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure .env file
3. ✅ Deploy Edge Function: `supabase functions deploy register-voter`
4. ✅ Start server: `npm start`
5. ✅ Run on device: `npm run ios` or `npm run android`
6. ✅ Test complete registration flow
7. ✅ Check database for new user
8. ✅ Deploy to production

## 🎨 Customization

### Change App Colors
Edit styles in screen components (SearchScreen, DiditVerifyScreen, etc.)

### Change App Name
Update in `app.json`:
```json
{
  "expo": {
    "name": "Your App Name"
  }
}
```

### Add Custom Components
Create in `components/` directory and import in screens

## 💡 Tips

- Use Expo Go app on your phone for faster testing
- Check console logs in Expo dev menu
- Monitor function logs: `supabase functions logs register-voter --tail`
- Test on real device for deep linking validation

## 🚨 Important Notes

- ⚠️ Never commit `.env` file with real credentials
- ⚠️ Keep Supabase service key secure
- ⚠️ Use HTTPS in production
- ⚠️ Enable email verification in Supabase Auth
- ⚠️ Configure RLS policies for security

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Edge Function deployed
- [ ] App starts without errors
- [ ] Can complete registration flow
- [ ] User appears in database
- [ ] Voter role assigned correctly
- [ ] Activity log created
- [ ] Email verification sent

## 📞 Support

Need help? Check:
1. Error messages in console
2. Supabase function logs
3. Database query results
4. Network requests in DevTools
5. Documentation files (README, SETUP, INTEGRATION)

---

**You're all set!** 🎉

The SOVS Registration app is ready to use. Start with `npm start` and test the complete registration flow.
