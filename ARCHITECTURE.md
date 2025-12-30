# SOVS Registration App - Architecture & Flow Diagrams

Visual representations of the app architecture and data flow.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOVS REGISTRATION APP                        │
│                    (React Native + Expo)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   USER INTERFACE LAYER                       │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  RegisterScreen │ DiditVerify │ VerifyDetails │ CreateAccount│   │
│  │     (Welcome)   │ (Browser)   │ (Data Review) │  (Credentials)   │
│  │                 │             │               │    SuccessScreen │
│  └──────────────────────────────────────────────────────────────┘   │
│                                 │                                    │
│                                 ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    STATE MANAGEMENT                          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │         RegistrationContext (React Context)                 │   │
│  │  - Form Data      - Didit Session    - Current Step         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                 │                                    │
│                    ┌────────────┼────────────┐                       │
│                    ▼            ▼            ▼                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐           │
│  │  SERVICES    │  │  HOOKS       │  │  UTILITIES       │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤           │
│  │• Supabase    │  │• useAsync    │  │• Validation      │           │
│  │• Didit       │  │• useForm     │  │• Formatting      │           │
│  │• Registration│  │• useDeepLink │  │• Calculations    │           │
│  └──────────────┘  └──────────────┘  └──────────────────┘           │
│                                 │                                    │
│                                 ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL SERVICES                         │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Supabase Auth │ Supabase DB │ Supabase Edge Functions │ Didit  │
│  │  (User Mgmt)   │ (Persistence)│ (Business Logic)        │(Verify)│
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## User Registration Flow

```
┌──────────────────┐
│   User Launches  │
│    SOVS App      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Welcome & Terms Screen          │
│  - Display app information       │
│  - Explain 4-step process        │
│  - Request terms agreement       │
└────────┬─────────────────────────┘
         │ (Click: Accept & Register)
         ▼
┌──────────────────────────────────┐
│  Create Didit Session            │
│  - Call didit-create-session     │
│  - Store session_id              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Didit Verification Screen       │
│  - Open Didit in web browser     │
│  - User completes verification   │
│  - Callback with deep link       │
└────────┬─────────────────────────┘
         │ (Deep link callback)
         ▼
┌──────────────────────────────────┐
│  Verify Session                  │
│  - Call didit-verify             │
│  - Extract verified user data    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Verification Details Screen     │
│  - Display verified data         │
│  - User confirms accuracy        │
└────────┬─────────────────────────┘
         │ (Click: Continue)
         ▼
┌──────────────────────────────────┐
│  Create Account Screen           │
│  - Enter email                   │
│  - Enter phone                   │
│  - Enter password                │
│  - Confirm password              │
│  - Real-time validation          │
└────────┬─────────────────────────┘
         │ (Click: Complete Registration)
         ▼
┌──────────────────────────────────┐
│  Create Auth User                │
│  - supabase.auth.signUp()        │
│  - Get user_id from auth         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Call register-voter Function    │
│  - POST /register-voter          │
│  - Include all user data         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Edge Function: register-voter   │
│  ├─ Insert into users table      │
│  ├─ Insert into user_roles       │
│  └─ Insert into activity_logs    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Success Screen                  │
│  - Show confirmation             │
│  - Display next steps            │
│  - Show registration summary     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Send Verification Email         │
│  - Supabase Auth triggers email  │
│  - User verifies email           │
│  - Account activated             │
└──────────────────────────────────┘
```

## Data Flow Diagram

```
                    ┌────────────────────┐
                    │   Didit Verified   │
                    │   User Data        │
                    └─────────┬──────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│           User Input Form                                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐               │
│  │  Email   │  │  Phone    │  │ Password │               │
│  └──────────┘  └───────────┘  └──────────┘               │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│        Registration Service Validation                     │
│  • Email format check                                      │
│  • Phone format check                                      │
│  • Password strength check                                │
│  • Duplicate email check                                  │
│  • Duplicate phone check                                  │
└────────────┬───────────────────────────────────────────────┘
             │ ✅ Valid Data
             ▼
┌────────────────────────────────────────────────────────────┐
│              Supabase Auth                                 │
│  supabase.auth.signUp({                                   │
│    email: string                                          │
│    password: string                                       │
│    options: {                                             │
│      data: {name, surname, phone, national_id}           │
│    }                                                      │
│  }) → returns user_id                                     │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│        Call Edge Function: register-voter                 │
│  POST /register-voter                                     │
│  {                                                        │
│    user_id: auth.user.id                                 │
│    email, phone_number, name, surname                    │
│    date_of_birth, national_id                            │
│    status: "pending", role_id: 1                         │
│  }                                                        │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│        Edge Function Execution                            │
│  register-voter/index.ts                                 │
│                                                          │
│  1. Validate input fields                               │
│  2. Insert into users table                             │
│  3. Insert into user_roles (role_id = 1)                │
│  4. Insert into activity_logs                           │
│  5. Return success response                             │
└──────────┬─────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────┐
│              Database Changes                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐│
│  │   users      │  │  user_roles  │  │ activity_logs   ││
│  │ table        │  │  table       │  │ table           ││
│  │ +1 record    │  │  +1 record   │  │ +1 record       ││
│  │ status:      │  │  role_id: 1  │  │ action_type:    ││
│  │ 'pending'    │  │  (voter)     │  │ 'success'       ││
│  └──────────────┘  └──────────────┘  └──────────────────┘│
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App Root (_layout.tsx)
│
├─ RegistrationProvider (Context)
│
└─ Stack Navigator
   │
   ├─ index.tsx
   │  └─ RegisterScreen
   │     ├─ useRegistration()
   │     ├─ diditService.createSession()
   │     └─ Navigation: → didit-verify
   │
   ├─ didit-verify.tsx
   │  └─ DiditVerifyScreen
   │     ├─ useRegistration()
   │     ├─ useDeepLink()
   │     ├─ diditService.verifySession()
   │     └─ Navigation: → verification-details
   │
   ├─ verification-details.tsx
   │  └─ VerificationDetailsScreen
   │     ├─ useRegistration()
   │     ├─ capitalizeFirstLetter()
   │     └─ Navigation: → create-account
   │
   ├─ create-account.tsx
   │  └─ CreateAccountScreen
   │     ├─ useRegistration()
   │     ├─ registrationService.completeRegistration()
   │     ├─ getPasswordStrength()
   │     ├─ isValidEmail()
   │     ├─ formatPhoneNumber()
   │     └─ Navigation: → success
   │
   └─ success.tsx
      └─ SuccessScreen
         ├─ useRegistration()
         └─ reset() on finish
```

## Service Dependencies

```
Components
├─ RegisterScreen
│  └─ diditService
│     └─ axios (HTTP)
│
├─ DiditVerifyScreen
│  ├─ diditService
│  │  └─ axios (HTTP)
│  └─ useDeepLink
│
├─ VerificationDetailsScreen
│  └─ helpers (capitalizeFirstLetter)
│
├─ CreateAccountScreen
│  ├─ registrationService
│  │  ├─ supabase client
│  │  │  └─ axios (HTTP)
│  │  └─ axios (HTTP)
│  └─ helpers (validation, formatting)
│
└─ SuccessScreen
   └─ useRegistration
```

## State Management Flow

```
User Action
     │
     ▼
Component Handler
     │
     ▼
Service Call (didit/registration)
     │
     ▼
External API/Database
     │
     ▼
Service Returns Data
     │
     ▼
Update RegistrationContext
     │
     ├─ formData (user input)
     ├─ diditSession (verification session)
     └─ currentStep (flow step)
     │
     ▼
Component Re-renders
     │
     ▼
Display Updated UI
```

## Database Schema Relationship

```
┌─────────────────────────────────────────────────────────┐
│                  USERS TABLE                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ user_id (UUID) ◄──────┐                          │   │
│  │ email (TEXT)          │                          │   │
│  │ phone_number (TEXT)   │                          │   │
│  │ name (TEXT)           │                          │   │
│  │ surname (TEXT)        │                          │   │
│  │ date_of_birth (DATE)  │                          │   │
│  │ status = 'pending'    │                          │   │
│  │ created_at (TIMESTAMP)│                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ▲                                                      │
│  │ Foreign Key                                         │
│  │                                                      │
│  │      ┌──────────────────────────────────────────┐   │
│  │      │      USER_ROLES TABLE                   │   │
│  └──────┤─ user_id (UUID, FK)                     │   │
│         │  role_id = 1 (voter)                    │   │
│         │  assigned_at (TIMESTAMP)                │   │
│         └──────────────────────────────────────────┘   │
│                                                         │
│              ▲                                          │
│              │ FK References                           │
│              │                                          │
│         ┌────────────────────────────────────────────┐  │
│         │       ROLES TABLE                         │  │
│         │  role_id = 1 = 'voter'                   │  │
│         │  role_id = 2 = 'candidate'               │  │
│         │  role_id = 3 = 'admin'                   │  │
│         │  role_id = 4 = 'super_admin'             │  │
│         └────────────────────────────────────────────┘  │
│                                                         │
│  ▲                                                      │
│  │ Foreign Key                                         │
│  │                                                      │
│  │      ┌──────────────────────────────────────────┐   │
│  │      │   ACTIVITY_LOGS TABLE                   │   │
│  └──────┤─ user_id (UUID, FK)                     │   │
│         │  user_name (TEXT)                       │   │
│         │  action = 'Voter registration completed'│   │
│         │  action_type = 'success'                │   │
│         │  timestamp (TIMESTAMP)                  │   │
│         │  ip_address (TEXT)                      │   │
│         └──────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Action
     │
     ▼
Input Validation
     │
     ├─ Valid ──────────► Process Request
     │                         │
     │                         ▼
     │                   Service Call
     │                         │
     │                    ┌────┴────┐
     │                    ▼         ▼
     │               Success      Error
     │                 │            │
     │                 ▼            ▼
     │              Update UI   Show Error
     │               Display      Message
     │             Confirmation  (Alert)
     │
     └─ Invalid ──────────► Show Validation Error
                                │
                                ▼
                           Highlight Field
                           Show Error Message
                           Request Re-input
```

## API Call Sequence

```
┌─────────────────────────────────────────────────────────────┐
│              DIDIT VERIFICATION SEQUENCE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  App                 didit-create-session     Didit API    │
│  │                        │                      │          │
│  ├─ POST ───────────────► │                      │          │
│  │   /didit-create-session│                      │          │
│  │                        │                      │          │
│  │                        ├─ POST ─────────────► │          │
│  │                        │   /v2/...           │          │
│  │                        │                      │          │
│  │                        │ ◄───────── Response ─┤          │
│  │                        │  session_id          │          │
│  │                        │                      │          │
│  │ ◄─────────────────────┤                      │          │
│  │   Response: session    │                      │          │
│  │                        │                      │          │
│  │ Open Browser ─────────────────────────────► │          │
│  │   → Didit Verification Portal               │          │
│  │                                              │          │
│  │ ◄─────── Deep Link Callback ────────────────┤          │
│  │   sovs://verification-complete?session_id   │          │
│  │                                              │          │
│  ├─ POST ───────────────────────────────────► │          │
│  │   /didit-verify?session_id                  │          │
│  │                                              │          │
│  │                        ├─ Check Session ──► │          │
│  │                        │                      │          │
│  │ ◄─────────────────────┤                      │          │
│  │   verified=true       │                      │          │
│  │   user_data={...}     │                      │          │
│  │                                              │          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              USER REGISTRATION SEQUENCE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  App          Supabase Auth    Edge Function    Database   │
│  │                  │                  │            │       │
│  ├─ signUp ────────► │                 │            │       │
│  │  (email,password) │                 │            │       │
│  │                   │                 │            │       │
│  │ ◄──── user_id ────┤                 │            │       │
│  │                   │                 │            │       │
│  ├─ POST register-voter ──────────────► │            │       │
│  │  (user_id, email, phone, ...)       │            │       │
│  │                                     │            │       │
│  │                                     ├─ INSERT ──► │       │
│  │                                     │   users    │       │
│  │                                     │            │       │
│  │                                     ├─ INSERT ──► │       │
│  │                                     │   user_roles│       │
│  │                                     │            │       │
│  │                                     ├─ INSERT ──► │       │
│  │                                     │   activity_logs    │
│  │                                     │            │       │
│  │ ◄─────────── success ───────────────┤            │       │
│  │                                                   │       │
└─────────────────────────────────────────────────────────────┘
```

## Screen Transition Diagram

```
                    ┌─────────────────┐
                    │  Welcome Screen │
                    │  (index.tsx)    │
                    └────────┬────────┘
                             │
                     ✅ Accept Terms
                             │
                             ▼
                    ┌─────────────────┐
                    │  Didit Verify   │
                    │  (didit-verify) │
                    └────────┬────────┘
                             │
                    ✅ Complete Verification
                             │
                             ▼
                    ┌──────────────────────┐
                    │ Verification Details │
                    │ (verify-details)     │
                    └────────┬─────────────┘
                             │
                     ✅ Confirm Accuracy
                             │
                             ▼
                    ┌──────────────────────┐
                    │  Create Account      │
                    │  (create-account)    │
                    └────────┬─────────────┘
                             │
                    ✅ Submit Registration
                             │
                             ▼
                    ┌──────────────────────┐
                    │  Success Screen      │
                    │  (success.tsx)       │
                    └────────┬─────────────┘
                             │
                     ✅ Return to Home
                             │
                             ▼
                    ┌──────────────────────┐
                    │  Welcome Screen      │
                    │  (Back to Start)     │
                    └──────────────────────┘
```

## Testing Flow

```
Test Scenario 1: Complete Registration
├─ Click "Start Registration"
├─ Accept Terms
├─ Complete Didit Verification (manual)
├─ Review Verified Data
├─ Enter Valid Email
├─ Enter Valid Phone
├─ Enter Strong Password
├─ Confirm Password
├─ Submit
└─ ✅ Success - User in Database

Test Scenario 2: Validation Errors
├─ Try invalid email
├─ ✅ See validation error
├─ Try weak password
├─ ✅ See strength indicator
├─ Try mismatched passwords
├─ ✅ See confirmation error
└─ Submit disabled

Test Scenario 3: Duplicate Detection
├─ Try email that exists
├─ ✅ See "already exists" error
├─ Try phone that exists
├─ ✅ See "already exists" error
└─ Cannot submit
```

---

These diagrams provide visual representations of the app architecture, data flow, and user interactions.
