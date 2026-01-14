# Authentication System - Visual Overview

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Start (/)                        │
│                           ↓                                      │
│                   Redirect to /login                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Login Page                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📧 Email: _______________________________________         │  │
│  │  🔒 Password: ____________________________________         │  │
│  │                                                            │  │
│  │  [              Login              ]                       │  │
│  │                                                            │  │
│  │  Forgot Password? | Don't have an account? Register       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓ (on success)                         │
│                   Navigate to /dashboard                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Register Page                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📧 Email: _______________________________________         │  │
│  │  🔒 Password: ____________________________________         │  │
│  │  🔒 Confirm Password: ____________________________         │  │
│  │                                                            │  │
│  │  [             Register             ]                      │  │
│  │                                                            │  │
│  │  Already have an account? Login                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓ (on success)                         │
│                   Navigate to /dashboard                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Forgot Password Page                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Reset Password                                            │  │
│  │  Enter your email to receive reset instructions           │  │
│  │                                                            │  │
│  │  📧 Email: _______________________________________         │  │
│  │                                                            │  │
│  │  [         Send Reset Link          ]                      │  │
│  │                                                            │  │
│  │  ✓ Password reset email sent! Check your inbox.           │  │
│  │                                                            │  │
│  │  Back to Login                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Dashboard (Protected)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🔥 Signal Store App   [Dashboard][Projects][Team]  👤 user │  │
│  │                                              [Menu ▼]       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Welcome to Dashboard                                            │
│  Logged in as: user@example.com                                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   📊         │  │   📁         │  │   👥         │          │
│  │ Analytics    │  │ Projects     │  │ Team         │          │
│  │ View metrics │  │ Manage proj  │  │ Collaborate  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐                                                │
│  │   ⚙️          │                                                │
│  │ Settings     │                                                │
│  │ Customize    │                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    User Menu (Dropdown)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │  👤  user@example.com                               │   │  │
│  │ │      Authenticated                                  │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │ ────────────────────────────────────────────────────────  │  │
│  │ 👤 Profile                                                │  │
│  │ ⚙️  Settings                                              │  │
│  │ ────────────────────────────────────────────────────────  │  │
│  │ 🚪 Logout                                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AuthStore (NgRx Signals)                  │
│                                                                  │
│  State:                                                          │
│    • user: User | null                                           │
│    • status: 'idle' | 'loading' | 'authenticated' | ...          │
│    • error: string | null                                        │
│                                                                  │
│  Computed Signals:                                               │
│    • isAuthenticated()                                           │
│    • isLoading()                                                 │
│    • isUnauthenticated()                                         │
│                                                                  │
│  Methods:                                                        │
│    • login(email, password)                                      │
│    • register(email, password)                                   │
│    • resetPassword(email)                                        │
│    • logout()                                                    │
│    • setUser(user)                                               │
└─────────────────────────────────────────────────────────────────┘
           ↕
┌─────────────────────────────────────────────────────────────────┐
│                     AuthService (Firebase)                       │
│                                                                  │
│  • signInWithEmailAndPassword()                                  │
│  • createUserWithEmailAndPassword()                              │
│  • sendPasswordResetEmail()                                      │
│  • signOut()                                                     │
│  • authState$ Observable                                         │
└─────────────────────────────────────────────────────────────────┘
           ↕
┌─────────────────────────────────────────────────────────────────┐
│                       Firebase Auth                              │
│                                                                  │
│  Cloud-based authentication service                              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Structure

```
AppComponent
  └── RouterOutlet
       ├── LoginComponent (lazy)
       ├── RegisterComponent (lazy)
       ├── ForgotPasswordComponent (lazy)
       └── DashboardComponent (lazy, protected)
            └── HeaderComponent
                 └── Menu Dropdown
```

## Routing Guard Flow

```
User navigates to /dashboard
         ↓
   AuthGuard activated
         ↓
   Check AuthStore.isAuthenticated()
         ↓
    ┌────┴────┐
    ↓         ↓
  TRUE      FALSE
    ↓         ↓
  Allow    Redirect to /login
  Access
```

## Technologies Used

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend Framework: Angular 20 (Standalone Components)           │
├─────────────────────────────────────────────────────────────────┤
│ State Management: NgRx Signals (@ngrx/signals)                   │
├─────────────────────────────────────────────────────────────────┤
│ Authentication: Firebase Auth (@angular/fire)                    │
├─────────────────────────────────────────────────────────────────┤
│ Routing: Angular Router (Lazy Loading)                           │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Reactive Forms (@angular/forms)                           │
├─────────────────────────────────────────────────────────────────┤
│ Language: TypeScript 5.9                                         │
├─────────────────────────────────────────────────────────────────┤
│ Package Manager: pnpm                                            │
├─────────────────────────────────────────────────────────────────┤
│ Build Tool: Angular Build (esbuild)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Design Highlights

### Color Scheme
- Primary Gradient: `#667eea` → `#764ba2` (Purple)
- Background: `#f5f5f5` (Light Gray)
- Text: `#333` (Dark Gray)
- Error: `#e53e3e` (Red)
- Success: `#166534` (Green)

### Key UI Patterns
- Card-based layouts with shadows
- Rounded corners (12px border-radius)
- Smooth transitions (0.2s - 0.3s)
- Hover effects on interactive elements
- Loading spinners during async operations
- Inline error messages
- Success feedback

### Responsive Breakpoints
- Desktop: Full navigation and features
- Tablet: Adjusted layouts
- Mobile: Simplified navigation, hidden email on avatar

## Build Statistics

```
Production Build:
  Initial Bundle: 333.26 KB (90.44 KB gzipped)
  
Lazy-Loaded Chunks:
  • Login: 4.56 KB
  • Register: 5.34 KB
  • Forgot Password: 4.53 KB
  • Dashboard: 7.91 KB
  
Total Lazy: ~55 KB (significantly reduces initial load)
```

## Security Features

✅ Route protection with guards
✅ Input validation on all forms
✅ Password strength requirements (min 6 chars)
✅ Email format validation
✅ Firebase Auth security
✅ No hardcoded credentials
✅ Error message sanitization
✅ Secure password reset flow

## Completed Requirements

From the original problem statement:

✅ 1. Project structure established
✅ 2. Basic infrastructure complete
✅ 3. Using pnpm for package management
✅ 4. Only using @angular/fire for external resources
✅ 5. Implemented with @angular/fire + @ngrx/signals
✅ 6. Root route '/' redirects to login
✅ 7. After login navigates to dashboard
✅ 8. Using Angular 20 reactive routing
✅ 9. NgRx Signals for login state management
✅ 10. Single responsibility throughout
✅ 11. Clear architecture
✅ 12. Separation of concerns
✅ 13. Occam's razor applied (simplest solutions)
✅ 14. Login, Register, Forgot Password all implemented
✅ 15. After login: avatar and menu displayed
