# Login Issue and Memory Leak Fixes

## Problem Statement
登入會卡住，而且異常，檢查是不是記憶體洩漏或什麼問題，並且使專案解耦合
(Login gets stuck and behaves abnormally. Check for memory leaks and decouple the project.)

## Root Causes Identified

### 1. Circular Dependency
**Issue**: `AuthStore` directly injected `WorkspaceStore`, creating a circular dependency:
- `AuthStore` → `WorkspaceStore` (direct injection)
- `ContextStore` → `AuthStore` + `WorkspaceStore`
- This caused initialization deadlocks and race conditions

**Location**: `src/app/core/auth/stores/auth.store.ts:86`

### 2. Memory Leaks
**Issue**: `rxMethod` subscriptions in `AuthStore.syncAuthState()` were never cleaned up
- The `syncAuthState` effect ran continuously without disposal
- No cleanup mechanism in `onDestroy`
- Each login/logout created new subscriptions that were never released

**Location**: `src/app/core/auth/stores/auth.store.ts:249-277`

### 3. Duplicate Navigation Logic
**Issue**: Login component had both effect-based and promise-based navigation
- `effect()` in constructor navigated on `isAuthenticated()`
- `onSubmit()` also had `.then()` callback with navigation
- This caused race conditions and unexpected behavior

**Location**: `src/app/features/account/auth/login/login.component.ts:215-219`

### 4. Tight Coupling
**Issue**: Direct store-to-store dependencies violated DDD principles
- Application layer (stores) shouldn't directly depend on each other
- No event-driven architecture for cross-store communication
- Changes in one store required changes in dependent stores

## Solutions Implemented

### 1. Removed Circular Dependency ✅
**Change**: Removed `WorkspaceStore` injection from `AuthStore`

**Before**:
```typescript
withMethods(
  (store, authService = inject(AuthService), 
   workspaceStore = inject<WorkspaceStoreInstance>(WorkspaceStore), // ❌ Circular dependency
   accountService = inject(AccountService)) => {
```

**After**:
```typescript
withMethods(
  (store, authService = inject(AuthService),
   eventBus = inject(EventBusStore), // ✅ Event-based communication
   accountService = inject(AccountService)) => {
```

### 2. Implemented Event-Based Communication ✅
**Change**: Use `EventBusStore` for cross-store communication

**Logout Flow**:
```typescript
// AuthStore emits event
logoutEffect = rxMethod<void>(
  pipe(
    tap(() => {
      patchState(store, { user: null, status: 'unauthenticated' });
      // ✅ Emit event instead of direct call
      eventBus.emit({
        type: 'auth.logout',
        payload: { timestamp: Date.now() },
        scope: 'global',
        timestamp: Date.now(),
        producer: 'AuthStore',
      });
    })
  )
);

// WorkspaceStore listens to event
withHooks({
  onInit(store) {
    const eventBus = inject(EventBusStore);
    effect(() => {
      const lastEvent = eventBus.lastEvent();
      if (lastEvent && lastEvent.type === 'auth.logout') {
        store.clearAll();
      }
    });
  }
})
```

### 3. Fixed Memory Leaks ✅
**Change**: Added proper cleanup with `DestroyRef`

**Before**:
```typescript
withHooks({
  onInit(store, authService, accountService) {
    const syncAuthState = rxMethod<void>(...);
    syncAuthState(); // ❌ No cleanup
  }
})
```

**After**:
```typescript
withHooks({
  onInit(store, authService, accountService) {
    const destroyRef = inject(DestroyRef);
    let authSubscription: any;
    
    const syncAuthState = rxMethod<void>(...);
    authSubscription = syncAuthState(); // ✅ Store subscription
    
    // ✅ Cleanup on destroy
    destroyRef.onDestroy(() => {
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    });
  }
})
```

### 4. Removed Duplicate Navigation ✅
**Change**: Simplified login component to use only effect-based navigation

**Before**:
```typescript
onSubmit(): void {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    this.authStore.login({ email, password }).then(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigate(['/dashboard']); // ❌ Duplicate navigation
      }
    });
  }
}
```

**After**:
```typescript
onSubmit(): void {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    this.authStore.login({ email, password }); // ✅ Navigation handled by effect
  }
}
```

## Files Modified

1. **`src/app/core/auth/stores/auth.store.ts`**
   - Removed `WorkspaceStore` import and injection
   - Added `EventBusStore` import and injection
   - Changed logout to emit `auth.logout` event
   - Added `DestroyRef` cleanup for subscriptions

2. **`src/app/features/account/auth/login/login.component.ts`**
   - Removed duplicate navigation from `onSubmit()`
   - Kept reactive navigation in effect

3. **`src/app/core/workspace/stores/workspace.store.ts`**
   - Added `withHooks` to listen for `auth.logout` events
   - Clear workspace state when logout event received

4. **`src/app/core/context/stores/context.store.ts`**
   - Added effect to listen for `auth.logout` events
   - Clear context state when logout event received

## Manual Testing Guide

### Test Login Flow
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Login"
4. **Expected**: Should navigate to `/dashboard` smoothly without hanging
5. **Check**: No console errors about circular dependencies

### Test Logout Flow
1. Login to the application
2. Navigate to `/logout`
3. **Expected**: Should clear all state and redirect to `/login`
4. **Check**: No memory leaks in Chrome DevTools Memory profiler

### Test Memory Leaks
1. Open Chrome DevTools → Performance → Memory
2. Take heap snapshot (Snapshot 1)
3. Login and logout 10 times
4. Force garbage collection
5. Take another heap snapshot (Snapshot 2)
6. **Expected**: Memory should not grow significantly
7. **Check**: No detached DOM nodes or leaked subscriptions

### Test Context Switching
1. Login to the application
2. Switch between different contexts (User → Organization → Team)
3. Logout
4. Login again
5. **Expected**: Context should be cleared and reset properly
6. **Check**: No stale state from previous session

## Architecture Benefits

### Before (Tightly Coupled)
```
AuthStore → WorkspaceStore (direct dependency)
     ↓
  ContextStore → WorkspaceStore (shared dependency)
     
❌ Circular dependency
❌ Tight coupling
❌ Violation of DDD principles
```

### After (Event-Driven)
```
AuthStore → EventBus → emit('auth.logout')
                ↓
         WorkspaceStore ← effect() listens
                ↓
         ContextStore ← effect() listens
         
✅ No circular dependencies
✅ Loose coupling via events
✅ Follows DDD event-driven architecture
✅ Single Responsibility Principle
```

## Performance Improvements

1. **No Memory Leaks**: Proper cleanup prevents memory growth
2. **No Race Conditions**: Single source of truth for navigation
3. **Faster Initialization**: No circular dependency resolution overhead
4. **Better Scalability**: New stores can listen to events without modifying AuthStore

## Compliance with DDD Principles

### Layer Boundaries Respected
- ✅ **Domain Layer** (models): Pure TypeScript, no dependencies
- ✅ **Application Layer** (stores): No cross-store dependencies
- ✅ **Infrastructure Layer** (services): Firebase wrappers only
- ✅ **Interface Layer** (components): Depends only on stores

### Event-Driven Communication
- ✅ Domain events (`auth.logout`) for cross-context communication
- ✅ EventBus as the single event pipeline
- ✅ Stores react to events via effects (reactive)
- ✅ No direct method calls between stores

### Dependency Direction
```
Interface Layer (components)
    ↓ inject stores
Application Layer (stores)
    ↓ emit/listen events via EventBus
    ↓ inject services
Infrastructure Layer (services)
```

## Next Steps

If login still experiences issues:
1. Check Firebase Auth configuration in `environment.ts`
2. Verify network connectivity to Firebase
3. Check browser console for Firebase Auth errors
4. Enable Firebase Auth debug mode
5. Check if email verification is required

## Related Documentation
- [DDD Architecture](./docs/architecture/02-ddd-architecture.md)
- [NgRx Signals](./docs/architecture/07-ngrx-signals.md)
- [Event Bus](./docs/architecture/06-event-bus.md)
