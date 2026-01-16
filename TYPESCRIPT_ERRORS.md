# TypeScript Errors Analysis & Fix Plan

## Error Categories Identified

### 1. Implicit 'any' Type Errors (TS7006, TS7031)

These occur when TypeScript cannot infer types and strict mode requires explicit typing.

**Files Affected:**
- `src/app/core/workspace/stores/overview.store.ts`
- `src/app/core/workspace/stores/members.store.ts`
- `src/app/core/global-shell/stores/config.store.ts`
- `src/app/core/global-shell/stores/layout.store.ts`
- `src/app/core/workspace-list/stores/workspace-list.store.ts`

**Specific Issues:**
1. rxMethod callbacks without explicit types
2. tap/catchError error callbacks without Error type
3. patchState callbacks without state type
4. Function parameters in methods without types

### 2. Nested Computed Signals (Performance Issue)

**Files Affected:**
- `src/app/core/workspace/stores/overview.store.ts` (lines 28-99)
- `src/app/core/workspace/stores/members.store.ts` (lines 42-104)

**Issue:**
Creating new computed() inside computed() is inefficient and violates NgRx Signals patterns.
Should directly access store signals instead.

### 3. State Type Safety

**Files Affected:**
- All state.ts files need review for proper initial values

**Issues:**
- Ensure no `undefined` values where not explicitly typed as optional
- Proper use of `as const` for literal types
- Null safety in initial state values

### 4. Export Organization

**File:** `src/app/core/index.ts`

**Status:** ✅ No duplicate exports found
**Status:** ✅ All models properly exported

## Fix Priority

1. **HIGH**: Fix implicit 'any' types (breaks strict compilation)
2. **HIGH**: Fix nested computed signals (architectural violation)
3. **MEDIUM**: Ensure state type safety
4. **LOW**: Code style consistency

## Implementation Plan

### Phase 1: Fix Implicit 'any' Types
- Add explicit types to all rxMethod generic parameters
- Add Error type to all catchError callbacks
- Add proper state types to patchState callbacks
- Add types to all function parameters

### Phase 2: Fix Nested Computed Signals
- Refactor overview.store.ts computed signals
- Refactor members.store.ts computed signals
- Use direct signal access instead of nested computed()

### Phase 3: State Type Safety
- Review all initial states
- Add `as const` where needed for literals
- Ensure no implicit undefined

### Phase 4: Verification
- Run `npx tsc --noEmit`
- Document all fixes
- Update COMPLIANCE.md

## Expected Outcome

- Zero TypeScript compilation errors
- 100% type safety in strict mode
- Proper NgRx Signals patterns
- Clean, maintainable code
