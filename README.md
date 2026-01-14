# Signal Store Starter - Zone-less Angular Application

A modern Angular 20 application using zone-less change detection, @ngrx/signals for state management, and Firebase integration.

## 🚀 Key Features

- ✅ **Zone-less Mode**: No Zone.js dependency (~40KB smaller bundle)
- ✅ **Angular 20**: Latest stable version with modern APIs
- ✅ **@ngrx/signals**: Signal-based state management
- ✅ **Firebase Integration**: @angular/fire with reactive patterns
- ✅ **Domain-Driven Design**: Account → Workspace → Module → Entity architecture
- ✅ **Production Ready**: Stable APIs, comprehensive documentation

## 📦 Tech Stack

- **Framework**: Angular 20.0.0
- **State Management**: @ngrx/signals 20.0.0
- **Backend**: @angular/fire 20.0.0 (Firebase)
- **Build Tool**: Angular CLI with esbuild
- **Language**: TypeScript 5.8.0

## 🏗️ Architecture

This application follows a strict domain-driven design with clear boundaries:

```
Account (Identity)
  ↓ Firebase Auth
AuthStore (Authentication State)
  ↓ Signals
Workspace (Logical Boundary)
  ↓ Context
Module (Features)
  ↓ Signal Stores
Entity (State Objects)
```

### Zone-less Architecture

The application uses Angular's stable zone-less change detection mode:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ← No Zone.js needed
    // ... other providers
  ],
};
```

**Benefits:**
- Smaller bundle size (no Zone.js ~40KB)
- Better performance (explicit change detection)
- Clearer state management (signal-based)
- Production-ready (stable API)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- Firebase project (for backend integration)

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Or using pnpm
pnpm install
```

### Development Server

```bash
# Start dev server
npm run start

# Or
npm run serve
```

Navigate to `http://localhost:4200/`

### Build

```bash
# Production build
npm run build

# Output will be in dist/demo/
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## 📚 Documentation

- **[Zone-less Migration Guide](docs/ZONELESS_MIGRATION.md)**: Complete guide to zone-less mode
- **[Implementation Verification](docs/ZONELESS_VERIFICATION.md)**: Verification of zone-less setup

## 🎯 Project Structure

```
src/
├── app/
│   ├── app.component.ts           # Root component
│   ├── app.config.ts              # Zone-less configuration
│   ├── app.routes.ts              # Route definitions
│   ├── core/                      # Core domain services
│   │   ├── auth/                  # Authentication (Account)
│   │   │   ├── stores/            # AuthStore (signals)
│   │   │   ├── services/          # Auth services
│   │   │   └── guards/            # Route guards
│   │   ├── context/               # Context (Workspace)
│   │   │   └── stores/            # ContextStore
│   │   ├── services/              # App initialization
│   │   └── ...                    # Other domains
│   ├── features/                  # Feature modules
│   │   ├── dashboard/             # Dashboard feature
│   │   └── ...                    # Other features
│   └── shared/                    # Shared components
├── environments/                  # Environment configs
├── main.ts                        # Zone-less bootstrap
└── ...
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Copy your Firebase config to `src/environments/environment.ts`
3. Enable required Firebase services (Auth, Firestore, etc.)

### Environment Variables

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    // ... other Firebase config
  },
  appCheckSiteKey: 'your-recaptcha-site-key',
  dataConnect: {
    connector: 'your-connector',
    location: 'your-location',
    service: 'your-service',
  },
};
```

## 🎨 State Management

All state is managed using @ngrx/signals with zone-less compatibility:

```typescript
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ status, user }) => ({
    isAuthenticated: computed(() => status() === 'authenticated'),
  })),
  withMethods((store) => ({
    setUser(user: any) {
      patchState(store, { user }); // ← Signal update triggers change detection
    },
  }))
);
```

**Reactive Flow:**
```
User Action → Method Call → rxMethod → patchState → Signal Update → UI Update
```

## 🔐 Authentication Flow

```
1. User enters credentials
2. Component calls AuthStore.login()
3. rxMethod handles async Firebase auth
4. Success → patchState updates user signal
5. Signal update triggers change detection
6. UI automatically updates
```

## 🧪 Testing

```bash
# Unit tests (when configured)
npm run test

# E2E tests (when configured)
npm run e2e
```

## 📊 Performance

### Bundle Sizes (Production Build)

```
Initial Chunks:
  - main.js: 183.54 kB (49.15 kB gzipped)
  - Total: 830.39 kB (229.28 kB gzipped)

Zone.js: NOT INCLUDED ✅
Savings: ~40 KB
```

### Change Detection

- **Zone.js (traditional)**: Checks after every async operation
- **Zone-less (this app)**: Only when signals update
- **Result**: Fewer change detection cycles, better performance

## 🔍 Troubleshooting

### NG0908 Error

If you see "In this configuration Angular requires Zone.js":

1. Ensure `provideZonelessChangeDetection()` is the **first provider** in `app.config.ts`
2. Verify no Zone.js imports in your code
3. Check that all async operations update signals

### UI Not Updating

Ensure all async operations update signals:

```typescript
// ❌ Wrong
setTimeout(() => {
  this.value = newValue; // Won't trigger change detection
}, 1000);

// ✅ Correct
setTimeout(() => {
  patchState(store, { value: newValue }); // Triggers change detection
}, 1000);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Follow the coding standards (lint, format)
5. Ensure builds pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Angular Team for zone-less APIs
- NgRx Team for signal stores
- Firebase Team for @angular/fire

## 📞 Support

For issues and questions:
- Check [ZONELESS_MIGRATION.md](docs/ZONELESS_MIGRATION.md)
- Check [ZONELESS_VERIFICATION.md](docs/ZONELESS_VERIFICATION.md)
- Open an issue on GitHub

---

**Built with ❤️ using Angular 20 and zone-less mode**
