# Application Bootstrap Architecture

## Overview

This application uses a structured bootstrap process with Angular's `APP_INITIALIZER` to ensure critical initialization happens before the app starts rendering. The implementation follows Domain-Driven Design principles and maintains reactive patterns with NgRx Signals and Angular Fire.

## Architecture Hierarchy

```
Account → Workspace → Module → Entity
  ↓         ↓          ↓         ↓
 Who    Where      What     State
```

## Bootstrap Flow

### 1. Application Start (`main.ts`)
```typescript
bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('✅ Application started'))
  .catch((err) => /* Display user-friendly error */);
```

### 2. Firebase Initialization (`app.config.ts`)
Providers are configured in this order:
1. **Firebase App** - `provideFirebaseApp(() => initializeApp(environment.firebase))`
2. **Firebase Services** - Auth, Firestore, Analytics, etc.
3. **APP_INITIALIZER** - `AppInitializerService.initialize()`

### 3. APP_INITIALIZER Execution

The `AppInitializerService` coordinates the initialization:

```typescript
async initialize(): Promise<void> {
  // 1. Wait for Firebase Auth initial state
  const user = await firstValueFrom(authState(this.auth));
  
  // 2. Sync to AuthStore (NgRx Signals)
  this.authStore.setUser(user);
  
  // 3. ContextStore reacts automatically via withHooks.onInit
}
```

**Key Points:**
- Uses `firstValueFrom()` to convert Observable to Promise
- Blocks app rendering until auth state is known
- Error handling ensures app starts even if auth check fails

### 4. Store Initialization

#### AuthStore
- Receives initial user state from APP_INITIALIZER
- `withHooks.onInit` sets up ongoing auth state sync
- Provides reactive computed signals: `isAuthenticated`, `isLoading`, `isUnauthenticated`

#### ContextStore
- `withHooks.onInit` is reactive to `AuthStore.user()` signal
- Automatically loads available contexts when user is authenticated
- Clears context when user logs out
- Maintains Account → Workspace hierarchy

### 5. Application Renders
- All critical state is ready
- Auth guards can safely check authentication status
- Routes can access store state immediately

## Reactive Patterns

### Signal-Based State Management
```typescript
// AuthStore provides signals
const isAuth = authStore.isAuthenticated();  // Signal<boolean>
const user = authStore.user();               // Signal<User | null>

// ContextStore reacts to AuthStore
effect(() => {
  const currentUser = authStore.user();
  if (currentUser) {
    // Load contexts
  }
});
```

### rxMethod for Side Effects
```typescript
const loginEffect = rxMethod<Credentials>(
  pipe(
    tap(() => patchState(store, { status: 'loading' })),
    switchMap(creds => authService.login(creds)),
    tap(user => patchState(store, { user, status: 'authenticated' })),
    catchError(error => { /* handle error */ })
  )
);
```

## Architecture Compliance

### Auth Stack Separation
✅ **Firebase Auth** - Identity verification only (who are you?)
✅ **AuthStore** - Session + Token management
✅ **ACL/Permissions** - Separate domain concern (what can you do?)

### NgRx Signals Boundaries
✅ No component direct Firebase calls
✅ No reducer side effects (pure state updates)
✅ Effects (rxMethod) for I/O operations only
✅ Computed signals for derived state

### Hierarchy Enforcement
✅ Account determined by Auth
✅ Workspace loaded based on Account
✅ Modules within Workspace context
✅ Entities within Module boundaries

## Error Handling

### Bootstrap Failures
If initialization fails:
1. Error logged to console
2. User-friendly error page displayed
3. Technical details available in expandable section
4. App set to unauthenticated state (doesn't crash)

### Runtime Errors
Stores handle errors gracefully:
```typescript
catchError((error) => {
  console.error('[StoreName] Error:', error);
  patchState(store, { error: error.message });
  return of(null); // Continue execution
})
```

## Testing Strategy

### Unit Tests
- Test `AppInitializerService.initialize()` with mocked Auth
- Test store initialization with various auth states
- Test error scenarios

### Integration Tests
- Verify bootstrap order (Firebase → Auth → Context)
- Test authenticated initialization flow
- Test unauthenticated initialization flow

### E2E Tests
- Login flow from bootstrap
- Context switching after login
- Logout and re-login flow

## Development Guidelines

### When Adding New Stores
1. Follow the same pattern: `withState`, `withComputed`, `withMethods`, `withHooks`
2. Use `withHooks.onInit` for initialization that depends on other stores
3. Make initialization reactive to dependencies (use signals/computed)
4. Handle both authenticated and unauthenticated states

### When Modifying Bootstrap
1. Ensure APP_INITIALIZER Promise resolves (don't block indefinitely)
2. Handle errors gracefully (don't throw)
3. Log initialization steps for debugging
4. Update this documentation

### Common Pitfalls to Avoid
❌ Direct Firebase calls from components
❌ Synchronous blocking in APP_INITIALIZER
❌ Circular dependencies between stores
❌ Mixing business logic with auth logic
❌ Skipping error handling in initialization

## Debugging

### Console Logs
Look for these initialization markers:
```
[AppInitializer] Starting application initialization...
[AppInitializer] Firebase Auth state received: Authenticated
[AppInitializer] Application initialization complete
[Bootstrap] Application started successfully
```

### Common Issues

**Issue:** App stuck on loading screen
- Check browser console for APP_INITIALIZER errors
- Verify Firebase config is correct
- Check network tab for failed requests

**Issue:** User appears logged out despite valid token
- Check AuthStore state in DevTools
- Verify APP_INITIALIZER completed successfully
- Check Firebase Auth persistence settings

**Issue:** Context not loading
- Ensure user is authenticated
- Check ContextStore.onInit is triggered
- Verify organization/team/partner services are working

## References

- [Angular APP_INITIALIZER](https://angular.dev/api/core/APP_INITIALIZER)
- [NgRx Signals](https://ngrx.io/guide/signals)
- [Angular Fire](https://github.com/angular/angularfire)
- [rxMethod](https://ngrx.io/guide/signals/rxjs-integration)
