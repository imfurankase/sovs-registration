# SOVS Registration Integration Guide

Complete integration guide for connecting the SOVS Registration app with your Supabase backend and existing Didit functions.

## Overview

The SOVS Registration app integrates with:
- **Supabase Database** - For user data persistence
- **Supabase Authentication** - For account creation
- **Supabase Edge Functions** - For registration processing
- **Didit Services** - For identity verification
- **Supabase Activity Logging** - For audit trails

## Architecture

```
┌─────────────────────┐
│ SOVS Registration   │
│   React Native      │
└──────────┬──────────┘
           │
     ┌─────┴──────┬────────────┬──────────────┐
     │            │            │              │
     ▼            ▼            ▼              ▼
┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐
│Supabase│  │Supabase│  │  Didit   │  │  Didit   │
│  Auth  │  │Database│  │Functions │  │   API    │
└────────┘  └────────┘  └──────────┘  └──────────┘
```

## Data Flow

### Registration Flow

```
1. User Initiation
   └─> Accept Terms & Conditions

2. Didit Verification
   ├─> Create Session (register-voter app ← didit-create-session function)
   ├─> Redirect to Didit (Web Browser)
   └─> Handle Callback (Deep Link)

3. Verification Details
   └─> Verify Session (register-voter app ← didit-verify function)
   └─> Display Verified Data

4. Account Creation
   ├─> Validate Input (register-voter app)
   ├─> Create Auth User (Supabase Auth)
   └─> Call Edge Function

5. Database Registration
   ├─> Create User Record (register-voter function → users table)
   ├─> Assign Voter Role (register-voter function → user_roles table)
   └─> Log Activity (register-voter function → activity_logs table)

6. Success Confirmation
   └─> Display Confirmation Screen
```

## Database Integration

### Users Table Integration

The app creates new records in the `users` table:

```typescript
// In register-voter Edge Function
await supabase
  .from("users")
  .insert({
    user_id: authUser.id,        // From Supabase Auth
    email: formData.email,
    phone_number: formData.phone_number,
    name: formData.name,
    surname: formData.surname,
    date_of_birth: formData.dob,
    status: 'pending',             // Always starts as pending
    created_at: now()
  })
```

### User Roles Integration

Automatically assigns voter role (role_id = 1):

```typescript
// In register-voter Edge Function
await supabase
  .from("user_roles")
  .insert({
    user_id: authUser.id,
    role_id: 1,                   // Voter role
    assigned_at: now()
  })
```

### Activity Logs Integration

Creates audit trail entry:

```typescript
// In register-voter Edge Function
await supabase
  .from("activity_logs")
  .insert({
    user_id: authUser.id,
    user_name: `${name} ${surname}`,
    action: 'Voter registration completed',
    details: `New voter registered with ID: ${national_id}`,
    role: 'voter',
    action_type: 'success',
    ip_address: req.headers.get('x-forwarded-for'),
    timestamp: now()
  })
```

## Supabase Configuration

### 1. Set Environment Variables

In your Supabase project settings, configure:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DIDIT_API_KEY=your-didit-api-key
```

### 2. Enable Email Verification

In Supabase Auth > Email Settings:
- Enable email confirmations
- Set confirmation email template
- Set redirect URL: `sovs://verification-complete`

### 3. Configure RLS Policies (Optional but Recommended)

For public anonymous access (registration):
```sql
-- Allow anyone to view roles
CREATE POLICY "Allow public to view roles"
  ON public.roles FOR SELECT
  USING (true);

-- Allow authenticated users to view their own records
CREATE POLICY "Allow users to view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. Storage Configuration

If you need to store identity documents:
```sql
-- Enable public storage for documents
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-docs', 'identity-docs', false);
```

## Didit Integration

The app integrates with existing Didit functions:

### didit-create-session
**Location**: `volumes/functions/didit-create-session/`

Called to initiate verification:
```typescript
const session = await diditService.createSession();
// Returns: { session_id, status, created_at }
```

### didit-verify
**Location**: `volumes/functions/didit-verify/`

Called to verify completed verification:
```typescript
const result = await diditService.verifySession(sessionId);
// Returns: { verified, user_data, error }
```

### didit-callback (if applicable)
**Location**: `volumes/functions/didit-callback/`

Handles Didit webhook callbacks (optional)

## API Endpoint Configuration

The app uses these endpoints:

```typescript
// Base URL
const API_URL = 'https://api.sovsapp.tech/functions/v1';

// Functions called
POST /didit-create-session
POST /didit-verify
POST /didit-callback (optional)
POST /register-voter      // New function
```

## Supabase Edge Function Deployment

### Deploy register-voter Function

```bash
# Option 1: Using Supabase CLI
cd /root/supabase-project
supabase functions deploy register-voter --project-id YOUR_PROJECT_ID

# Option 2: Using Supabase Dashboard
# 1. Go to Functions > New Function > register-voter
# 2. Copy code from: volumes/functions/register-voter/index.ts
# 3. Configure environment variables
# 4. Deploy
```

### Verify Deployment

```bash
# List deployed functions
supabase functions list --project-id YOUR_PROJECT_ID

# Check function logs
supabase functions logs register-voter --project-id YOUR_PROJECT_ID
```

## Testing the Integration

### 1. Test Didit Integration

```typescript
// In your terminal
curl -X POST https://api.sovsapp.tech/functions/v1/didit-create-session \
  -H "Content-Type: application/json"

// Should return:
// { "session_id": "...", "status": "pending", "created_at": "..." }
```

### 2. Test Registration Function

```bash
curl -X POST https://api.sovsapp.tech/functions/v1/register-voter \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-uuid",
    "email": "test@example.com",
    "phone_number": "+1234567890",
    "name": "Test",
    "surname": "User",
    "date_of_birth": "1990-01-01",
    "national_id": "ID123456",
    "status": "pending",
    "role_id": 1
  }'

// Should return:
// { "success": true, "user_id": "...", "message": "..." }
```

### 3. Test Complete Flow

1. Run the app: `npm start`
2. Accept terms
3. Click register
4. Complete Didit verification
5. Review information
6. Create account
7. Check database:
   ```sql
   SELECT * FROM public.users ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM public.user_roles WHERE user_id = '<new-user-id>';
   SELECT * FROM public.activity_logs WHERE user_id = '<new-user-id>';
   ```

## Error Handling

The app handles various error scenarios:

### Didit Errors
- Session creation failures
- Verification completion failures
- Network timeouts

### Validation Errors
- Invalid email format
- Weak passwords
- Duplicate email/phone
- Missing required fields

### Database Errors
- Constraint violations
- Connection failures
- Permission issues

### Auth Errors
- User already exists
- Invalid credentials
- Email verification failures

## Monitoring & Logging

### View Registration Activities

```sql
-- Recent registrations
SELECT * 
FROM public.activity_logs 
WHERE action = 'Voter registration completed'
ORDER BY created_at DESC
LIMIT 10;

-- Failed registrations
SELECT * 
FROM public.activity_logs 
WHERE action_type = 'error'
ORDER BY created_at DESC
LIMIT 10;
```

### Monitor Function Calls

```bash
# View function execution logs
supabase functions logs register-voter --tail

# Monitor in real-time
supabase functions logs register-voter --tail -f
```

## Performance Considerations

### Database Optimization

```sql
-- Create indexes for faster queries
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone_number);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
```

### Function Optimization

- Keep functions stateless
- Use connection pooling
- Cache Didit responses when possible
- Implement rate limiting if needed

## Security Considerations

### 1. Environment Variables

Keep sensitive data in environment variables:
- SUPABASE_SERVICE_ROLE_KEY
- DIDIT_API_KEY
- Didit endpoints

### 2. RLS Policies

Implement Row Level Security for:
- user_roles (users can't modify their own roles)
- activity_logs (immutable audit trail)

### 3. API Authentication

All Edge Functions should:
- Validate request headers
- Implement rate limiting
- Log all operations

### 4. Password Storage

Supabase Auth handles password hashing automatically.

### 5. Email Verification

Require email verification:
- Confirmation email is sent
- User must click link
- Status remains 'pending' until verified

## Maintenance & Updates

### Regular Tasks

1. **Monitor Function Logs**: Check for errors and exceptions
2. **Review Activity Logs**: Audit registration activities
3. **Check Database Health**: Monitor table sizes and performance
4. **Update Dependencies**: Keep packages current

### Backup & Recovery

```bash
# Backup database
pg_dump -U postgres --schema-only postgres > schema-backup.sql

# Backup users data
psql -U postgres -c "COPY users TO STDOUT WITH CSV" > users-backup.csv
```

### Version Management

- Track function versions in git
- Use semantic versioning
- Document breaking changes

## Troubleshooting Integration Issues

### Issue: Registration fails with "Function not found"
**Solution**: Deploy register-voter function to Supabase

### Issue: User not appearing in database
**Solution**: 
1. Check function logs
2. Verify database constraints
3. Check network connectivity

### Issue: Didit verification not working
**Solution**:
1. Verify Didit API credentials
2. Check deep linking configuration
3. Review Didit function logs

### Issue: Database constraints violated
**Solution**:
1. Check uniqueness constraints on email/phone
2. Verify user_id matches between auth and database
3. Check role_id exists in roles table

## Next Steps

1. **Deploy the app**: Follow deployment guide
2. **Configure monitoring**: Set up error tracking
3. **Test thoroughly**: Run through complete flow
4. **Train users**: Document registration process
5. **Go live**: Enable production environment

## Support & Resources

- Supabase Documentation: https://supabase.com/docs
- Didit API Docs: https://didit.me/docs
- Expo Documentation: https://docs.expo.dev
- React Native Docs: https://reactnative.dev

## Contact

For integration support, contact the development team with:
- Error logs and messages
- Steps to reproduce issues
- Environment details
- Relevant screenshots
