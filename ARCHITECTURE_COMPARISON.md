# Architecture Comparison: Before vs After

## Before: Tightly Coupled Architecture (❌ Problems)

```
┌─────────────────────────────────────────────────┐
│         AuthStore (Application Layer)           │
│                                                  │
│  - injects: WorkspaceStore ────────┐            │
│  - logout() calls:                 │            │
│    workspaceStore.clearAll() ──────┼───────┐    │
└────────────────────────────────────┼───────┼────┘
                                     │       │
                                     │       │ Circular
                ┌────────────────────┘       │ Dependency
                │                            │
                ↓                            │
┌──────────────────────────────────┐        │
│  WorkspaceStore (App Layer)      │←───────┘
│                                   │
│  - Direct dependency on AuthStore │
└──────────────────────────────────┘
                ↑
                │ Also depends on
                │
┌──────────────────────────────────┐
│  ContextStore (App Layer)        │
│                                   │
│  - injects: AuthStore             │
│  - injects: WorkspaceStore        │
└──────────────────────────────────┘
```

### Problems:
1. ❌ **Circular Dependency**: AuthStore → WorkspaceStore → (via Context) → AuthStore
2. ❌ **Tight Coupling**: Changes in one store require changes in others
3. ❌ **Memory Leaks**: No cleanup of rxMethod subscriptions
4. ❌ **DDD Violation**: Application layer stores directly depend on each other
5. ❌ **Race Conditions**: Multiple navigation paths in login

## After: Event-Driven Architecture (✅ Solutions)

```
┌─────────────────────────────────────────────────┐
│         AuthStore (Application Layer)           │
│                                                  │
│  - injects: EventBusStore                       │
│  - logout() emits:                              │
│    eventBus.emit({                              │
│      type: 'auth.logout',                       │
│      payload: { timestamp }                     │
│    })                                           │
└─────────────────────────────────────────────────┘
                     │
                     │ emit event
                     ↓
┌─────────────────────────────────────────────────┐
│         EventBusStore (Infrastructure)          │
│                                                  │
│  - Signal-based event pipeline                  │
│  - lastEvent(): Signal<Event>                   │
│  - emit(event): void                            │
└─────────────────────────────────────────────────┘
       ↑                    ↑                 ↑
       │ listen             │ listen          │ listen
       │ (effect)           │ (effect)        │ (effect)
       │                    │                 │
┌──────────────┐  ┌────────────────┐  ┌─────────────────┐
│ Workspace    │  │  Context       │  │  Any Future     │
│ Store        │  │  Store         │  │  Store          │
│              │  │                │  │                 │
│ effect() {   │  │ effect() {     │  │ effect() {      │
│   if(event   │  │   if(event     │  │   // React to   │
│   == logout) │  │   == logout)   │  │   // events     │
│   clearAll() │  │   clearCtx()   │  │ }               │
│ }            │  │ }              │  │                 │
└──────────────┘  └────────────────┘  └─────────────────┘
```

### Solutions:
1. ✅ **No Circular Dependencies**: Stores don't depend on each other
2. ✅ **Loose Coupling**: Communication via events (EventBus)
3. ✅ **Memory Safe**: DestroyRef cleanup for subscriptions
4. ✅ **DDD Compliant**: Event-driven architecture, proper layer boundaries
5. ✅ **Reactive**: Single effect-based navigation, no race conditions

## Event Flow Example: User Logout

### Old Flow (Tightly Coupled):
```
1. User clicks Logout
2. Component calls: authStore.logout()
3. AuthStore:
   - Signs out from Firebase
   - Updates own state
   - DIRECTLY calls: workspaceStore.clearAll() ❌
4. WorkspaceStore:
   - Clears workspace state
```

**Problem**: AuthStore must know about WorkspaceStore implementation

### New Flow (Event-Driven):
```
1. User clicks Logout
2. Component calls: authStore.logout()
3. AuthStore:
   - Signs out from Firebase
   - Updates own state
   - Emits event: eventBus.emit({ type: 'auth.logout' }) ✅
4. EventBusStore:
   - Updates lastEvent() signal
5. WorkspaceStore (reacts via effect):
   - Detects lastEvent() === 'auth.logout'
   - Calls: clearAll()
6. ContextStore (reacts via effect):
   - Detects lastEvent() === 'auth.logout'
   - Calls: clearContext()
7. Any other stores listening:
   - React independently
```

**Benefit**: AuthStore doesn't know about WorkspaceStore or ContextStore

## Memory Management Comparison

### Before (Memory Leak):
```typescript
withHooks({
  onInit(store, authService) {
    const syncAuthState = rxMethod<void>(
      pipe(switchMap(() => authService.authState$))
    );
    
    syncAuthState(); // ❌ Never cleaned up!
  }
})
```

**Problem**: Subscription continues forever, accumulates on each init

### After (Clean Disposal):
```typescript
withHooks({
  onInit(store, authService) {
    const destroyRef = inject(DestroyRef);
    let authSubscription: any;
    
    const syncAuthState = rxMethod<void>(
      pipe(switchMap(() => authService.authState$))
    );
    
    authSubscription = syncAuthState();
    
    // ✅ Cleanup on destroy
    destroyRef.onDestroy(() => {
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    });
  }
})
```

**Benefit**: Subscription is properly cleaned up when store is destroyed

## Dependency Graph Comparison

### Before:
```
         ┌──────────────┐
         │  AuthStore   │
         └──────┬───────┘
                │
                │ inject WorkspaceStore
                ↓
         ┌──────────────┐
    ┌────│WorkspaceStore│────┐
    │    └──────────────┘    │
    │                        │
    │ inject                 │ inject
    ↓                        ↓
┌───────────┐          ┌────────────┐
│AuthStore  │          │ContextStore│
│(circular!)│          │            │
└───────────┘          └────────────┘
```

### After:
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│AuthStore │  │Workspace │  │Context   │
│          │  │Store     │  │Store     │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     │ emit        │ listen      │ listen
     │             │             │
     └─────────────┼─────────────┘
                   ↓
           ┌──────────────┐
           │ EventBusStore│
           └──────────────┘
```

## Layer Compliance

### Before:
```
Interface Layer (components)
    ↓
Application Layer (stores)
    ↓ ❌ Cross-dependencies
Application Layer (other stores)  ← VIOLATION
    ↓
Infrastructure Layer (services)
```

### After:
```
Interface Layer (components)
    ↓ inject stores
Application Layer (stores)
    ↓ emit/listen via EventBus
    ↓ inject services
Infrastructure Layer (services)
    ↓ use models
Domain Layer (models)
```

## Performance Impact

### Before Issues:
- 🐌 Slow initialization (circular dependency resolution)
- 💾 Memory leaks (uncleaned subscriptions)
- ⚡ Race conditions (duplicate navigation)
- 🔄 Cascading updates (tight coupling)

### After Improvements:
- ⚡ Fast initialization (no circular dependencies)
- 💪 Memory efficient (proper cleanup)
- 🎯 Predictable behavior (single navigation path)
- 🔌 Decoupled updates (event-driven)

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Coupling** | Tight (direct dependencies) | Loose (event-driven) |
| **Circular Deps** | Yes (AuthStore ↔ WorkspaceStore) | No |
| **Memory Leaks** | Yes (no cleanup) | No (DestroyRef) |
| **DDD Compliant** | No (layer violations) | Yes (proper boundaries) |
| **Scalability** | Low (cascading changes) | High (independent stores) |
| **Testability** | Hard (coupled stores) | Easy (mock EventBus) |
| **Maintainability** | Low (ripple effects) | High (isolated changes) |

## Key Takeaways

1. **Event-Driven Architecture** eliminates circular dependencies
2. **EventBus** provides a clean communication channel between stores
3. **DestroyRef** ensures proper resource cleanup
4. **DDD Layer Boundaries** are respected with proper event flow
5. **Reactive Patterns** (effects) replace imperative calls
