# Zone-less Mode Migration Guide

## Overview

This application uses Angular 20's **zone-less change detection mode**, which provides significant performance improvements and a smaller bundle size by removing the Zone.js dependency.

## What is Zone-less Mode?

Zone-less mode is a stable feature in Angular 20+ that eliminates the need for Zone.js by using signal-based change detection instead. This means:

- ✅ **Smaller Bundle**: Zone.js (~40KB) is not included
- ✅ **Better Performance**: No Zone.js overhead for change detection
- ✅ **Explicit Reactivity**: All state changes are explicit through signals
- ✅ **Modern Architecture**: Fully reactive with @ngrx/signals
- ✅ **No NG0908 Error**: Proper configuration prevents runtime errors

## Configuration

### 1. Enable Zone-less Mode

In `src/app/app.config.ts`:

```typescript
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // MUST be the first provider
    provideZonelessChangeDetection(),
    // ... other providers
  ],
};
```

### 2. Ensure No Zone.js Import

- Zone.js is **NOT** in `package.json` dependencies ✅
- No `import 'zone.js'` in any source files ✅
- No polyfills importing Zone.js ✅

## Architecture Compatibility

### @ngrx/signals Integration

All stores use `@ngrx/signals` which is fully compatible with zone-less mode:

```typescript
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ status, user }) => ({
    isAuthenticated: computed(() => status() === 'authenticated' && user() !== null),
  })),
  withMethods((store) => ({
    setUser(user: any) {
      // Signal update triggers change detection automatically
      patchState(store, { user, status: user ? 'authenticated' : 'unauthenticated' });
    },
  }))
);
```

**Why this works:**
- `patchState()` updates signals
- Signal updates trigger change detection automatically
- No manual `markForCheck()` needed
- No Zone.js required

### @angular/fire Integration

Firebase operations are wrapped in observables that update signals:

```typescript
const loginEffect = rxMethod<Credentials>(
  pipe(
    switchMap((credentials) =>
      authService.login(credentials).pipe(
        tap((user) => {
          // Observable result updates signal via patchState
          patchState(store, { user, status: 'authenticated' });
        })
      )
    )
  )
);
```

**Reactive Flow:**
```
Firebase Observable → rxMethod → patchState → Signal Update → Change Detection
```

### APP_INITIALIZER Compatibility

The APP_INITIALIZER works perfectly in zone-less mode:

```typescript
{
  provide: APP_INITIALIZER,
  useFactory: (initService: AppInitializerService) => () => initService.initialize(),
  deps: [AppInitializerService],
  multi: true,
}
```

**Initialization Sequence:**
1. APP_INITIALIZER runs before app renders
2. `initialize()` returns a Promise
3. Waits for Firebase Auth state via `firstValueFrom()`
4. Updates AuthStore via `setUser()` (signal update)
5. Signal update triggers change detection
6. App renders with initialized state

## Domain Architecture Compliance

The application follows the **Account → Workspace → Module → Entity** hierarchy:

### Account (Identity Layer)
- **Firebase Auth**: Provides identity verification (who you are)
- **AuthStore**: Manages authentication state via signals
- Signal-based: All auth state changes update signals

### Workspace (Logical Boundary)
- **ContextStore**: Reacts to auth state changes
- Defines the workspace context for authenticated users
- Uses `withHooks.onInit()` to react to AuthStore changes

### Module (Functional Units)
- Feature stores for different modules (tasks, documents, etc.)
- Each module has its own signal store
- All use reactive patterns (rxMethod, patchState, computed)

### Entity (State Models)
- All state is managed through @ngrx/signals
- Entities are represented as signals
- State changes are explicit and traceable

## Change Detection Triggers

In zone-less mode, change detection is triggered by:

1. **Signal Updates**: Any `patchState()` call
2. **User Interactions**: Click, input, keyboard events (handled by Angular)
3. **Manual Triggers**: `markForCheck()` when needed (rare)

**NOT triggered by:**
- ❌ Async operations (setTimeout, setInterval)
- ❌ Promise resolutions
- ❌ Observable emissions (unless they update signals)
- ❌ HTTP requests (unless they update signals)

## Best Practices

### ✅ DO

1. **Use Signals for All State**
   ```typescript
   const store = signalStore(
     withState({ count: 0 }),
     withMethods((store) => ({
       increment() {
         patchState(store, { count: store.count() + 1 });
       },
     }))
   );
   ```

2. **Use rxMethod for Async Operations**
   ```typescript
   const loadDataEffect = rxMethod<void>(
     pipe(
       switchMap(() => dataService.load()),
       tap((data) => patchState(store, { data }))
     )
   );
   ```

3. **Use computed for Derived State**
   ```typescript
   withComputed(({ items }) => ({
     itemCount: computed(() => items().length),
   }))
   ```

### ❌ DON'T

1. **Don't Use Zone.js Patterns**
   ```typescript
   // ❌ BAD: Zone.js pattern
   setTimeout(() => {
     this.value = newValue; // Won't trigger change detection
   }, 1000);

   // ✅ GOOD: Signal pattern
   setTimeout(() => {
     patchState(store, { value: newValue }); // Triggers change detection
   }, 1000);
   ```

2. **Don't Mutate State Directly**
   ```typescript
   // ❌ BAD
   store.user.name = 'New Name';

   // ✅ GOOD
   patchState(store, {
     user: { ...store.user(), name: 'New Name' },
   });
   ```

3. **Don't Forget to Update Signals in Subscriptions**
   ```typescript
   // ❌ BAD
   observable$.subscribe((data) => {
     this.data = data; // Won't trigger change detection
   });

   // ✅ GOOD
   rxMethod(
     pipe(
       switchMap(() => observable$),
       tap((data) => patchState(store, { data }))
     )
   );
   ```

## Testing Zone-less Mode

### Build Verification
```bash
npm run build
# Should complete successfully without NG0908 error
```

### Bundle Size Check
The total initial bundle should be approximately:
- **Raw size**: ~830 KB
- **Transferred**: ~229 KB
- Zone.js (~40 KB) is NOT included

### Runtime Verification
```typescript
// In browser console
console.log(Zone); // Should be undefined
```

## Troubleshooting

### NG0908 Error
**Error Message**: "In this configuration Angular requires Zone.js"

**Solution**: Ensure `provideZonelessChangeDetection()` is the **first provider** in `app.config.ts`

### UI Not Updating
**Problem**: UI doesn't update after async operations

**Solution**: Ensure all async operations update signals via `patchState()`:
```typescript
rxMethod(
  pipe(
    switchMap(() => asyncOperation$),
    tap((result) => patchState(store, { result })) // ← Signal update
  )
);
```

### Third-Party Library Issues
**Problem**: Third-party library doesn't work in zone-less mode

**Solutions**:
1. Wrap library calls in `rxMethod` and update signals
2. Use `inject(ChangeDetectorRef).markForCheck()` when needed
3. Check if library has zone-less support

## Performance Benefits

### Bundle Size Reduction
- **Before**: Bundle includes Zone.js (~40 KB)
- **After**: No Zone.js (~40 KB savings)
- **Result**: Smaller download, faster initial load

### Runtime Performance
- **Before**: Zone.js checks for changes after every async operation
- **After**: Change detection only when signals update
- **Result**: Fewer change detection cycles, better performance

### Developer Experience
- **Explicit State Flow**: All state changes are traceable
- **Better Debugging**: No hidden Zone.js magic
- **Type Safety**: Signals provide strong typing

## Migration Checklist

- [x] Add `provideZonelessChangeDetection()` to providers
- [x] Remove Zone.js from dependencies
- [x] Verify all state uses @ngrx/signals
- [x] Ensure all async operations update signals
- [x] Test build completes successfully
- [x] Verify no NG0908 errors
- [x] Test all features work correctly
- [x] Document zone-less architecture

## References

- [Angular Official Documentation - Zoneless](https://angular.dev/guide/zoneless)
- [@ngrx/signals Documentation](https://ngrx.io/guide/signals)
- [Angular Fire Documentation](https://github.com/angular/angularfire)

## Summary

This application successfully uses Angular 20's zone-less mode with:
- ✅ `provideZonelessChangeDetection()` configured
- ✅ @ngrx/signals for state management
- ✅ @angular/fire integration via reactive patterns
- ✅ APP_INITIALIZER for initialization
- ✅ Complete domain architecture (Account → Workspace → Module → Entity)
- ✅ No NG0908 errors
- ✅ Production-ready configuration

All reactive patterns are zone-less compatible, and the application maintains the proper domain boundaries and architecture compliance.
