# SOVS Registration App

A complete voter registration React Native application with identity verification through Didit and secure account creation using Supabase.

## Features

- **Identity Verification**: Integration with Didit for secure identity verification
- **Multi-step Registration**: Guided registration flow with validation at each step
- **Account Security**: Password strength requirements and validation
- **Data Persistence**: Secure storage in Supabase with role-based access
- **Activity Logging**: Complete audit trail of registration activities
- **Responsive Design**: Cross-platform support (iOS, Android, Web)

## Registration Flow

1. **Welcome Screen** - User accepts terms and conditions
2. **Didit Verification** - Identity verification through Didit service
3. **Verification Details** - Review and confirm verified information
4. **Account Creation** - Set password, email, and phone number
5. **Success Screen** - Confirmation and next steps

## Project Structure

```
sovs-registration/
├── app/
│   ├── screens/           # Screen components
│   ├── _layout.tsx        # Navigation stack setup
│   ├── index.tsx          # Register screen
│   ├── didit-verify.tsx   # Didit verification screen
│   ├── verification-details.tsx
│   ├── create-account.tsx
│   └── success.tsx
├── components/            # Reusable UI components
├── contexts/             # React Context (RegistrationContext)
├── services/             # API and service layer
│   ├── supabase.ts      # Supabase client
│   ├── didit.ts         # Didit verification service
│   ├── registration.ts  # Registration service
│   └── index.ts
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── hooks/               # Custom React hooks
├── assets/              # Images and icons
├── package.json
├── app.json
├── tsconfig.json
└── .env.example

```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Expo CLI
- npm or yarn
- Supabase project account
- Didit API credentials

### Installation

1. **Install dependencies**:
   ```bash
   cd sovs-registration
   npm install
   # or
   yarn install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase credentials and function URLs

3. **Start the development server**:
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on device or emulator**:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## API Services

### Supabase Service (`services/supabase.ts`)

Initializes and exports the Supabase client for database operations.

```typescript
import { supabase } from '@/services';

// Example: Query users table
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'pending');
```

### Didit Service (`services/didit.ts`)

Handles identity verification:

- **createSession()** - Start a new verification session
- **getSessionDetails(sessionId)** - Get session status
- **verifySession(sessionId)** - Verify completed session and extract user data
- **handleCallback(callbackData)** - Process Didit callback

```typescript
import { diditService } from '@/services';

// Create verification session
const session = await diditService.createSession();

// Verify after user completes verification
const result = await diditService.verifySession(sessionId);
```

### Registration Service (`services/registration.ts`)

Handles user registration and validation:

- **completeRegistration(data)** - Complete the registration process
- **checkEmailExists(email)** - Verify email uniqueness
- **checkPhoneExists(phone)** - Verify phone uniqueness
- **validatePassword(password)** - Check password strength
- **validateEmail(email)** - Validate email format
- **validatePhoneNumber(phone)** - Validate phone format

```typescript
import { registrationService } from '@/services';

// Validate and complete registration
try {
  const result = await registrationService.completeRegistration(formData);
  console.log('Registered user:', result.user_id);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

## Database Schema

The app interacts with the following tables:

### users
```sql
CREATE TABLE public.users (
    user_id uuid PRIMARY KEY,
    phone_number text NOT NULL,
    email text,
    name text NOT NULL,
    surname text NOT NULL,
    date_of_birth date NOT NULL,
    password_hash text,
    two_factor_secret text,
    status user_status_enum DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);
```

### user_roles
```sql
CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL,
    assigned_at timestamp with time zone DEFAULT now()
);
```

### roles
```sql
CREATE TABLE public.roles (
    role_id integer PRIMARY KEY,
    role_name text NOT NULL
);
-- role_id 1 = voter
```

### activity_logs
```sql
CREATE TABLE public.activity_logs (
    log_id uuid PRIMARY KEY,
    user_id uuid,
    user_name text NOT NULL,
    action text NOT NULL,
    details text,
    role text NOT NULL,
    action_type text NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);
```

## Supabase Edge Functions

### register-voter
Located in: `volumes/functions/register-voter/`

Creates a new user in the database and assigns the voter role.

**Request**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "phone_number": "+1234567890",
  "name": "John",
  "surname": "Doe",
  "date_of_birth": "1990-01-15",
  "national_id": "ID123456",
  "status": "pending",
  "role_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "user_id": "uuid",
  "auth_user_id": "uuid",
  "status": "pending",
  "message": "Voter registration successful"
}
```

## Security Features

- **Password Strength Validation**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Password confirmation matching

- **Email Validation**: RFC 5322 compliant email format checking

- **Phone Validation**: Standard international phone format validation

- **Database Constraints**: 
  - User IDs must match between auth and database
  - Roles are validated against role table
  - Status is constrained to valid enum values

- **Activity Logging**: All registration activities are logged for audit

## Deep Linking

The app supports deep linking for Didit callback:

**Scheme**: `sovs://`

**Example callback URL**:
```
sovs://verification-complete?session_id=abc123
```

Configure in `app.json`:
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

## Testing

### Test Registration Flow

1. Start the app and click "Start Registration"
2. Accept terms and conditions
3. Complete Didit identity verification
4. Review verified information
5. Create account with credentials
6. Confirm success screen

### Test Validation

- Try registering with invalid email
- Try passwords that don't meet requirements
- Try duplicate email/phone numbers
- Try non-matching password confirmation

## Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

### Web
```bash
npm run build:web
```

## Environment Variables

Required environment variables (see `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=https://api.sovsapp.tech
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_FUNCTIONS_URL=https://api.sovsapp.tech/functions/v1
EXPO_PUBLIC_DIDIT_BASE_URL=https://api.sovsapp.tech/functions/v1
```

## Troubleshooting

### Didit verification not opening
- Check deep linking configuration
- Verify Didit credentials are set
- Check network connectivity

### Registration fails with "user already exists"
- Check if email/phone is already registered
- User must use unique credentials

### Password validation failing
- Ensure password meets all requirements
- Check strength feedback for specific requirements
- Passwords are case-sensitive

## Contributing

When adding new features:

1. Add types to `types/index.ts`
2. Add services to `services/`
3. Create components in `components/`
4. Add screens to `app/screens/`
5. Update context if needed

## License

Proprietary - SOVS Election System

## Support

For issues or questions, contact the development team.
