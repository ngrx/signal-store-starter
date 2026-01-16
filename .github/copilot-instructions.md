# Copilot Instructions (Refactored)

---

## HARD RULES (DO NOT VIOLATE)

1. **Angular Signals ONLY**  
   - Use `@ngrx/signals` for all domain and UI state.  
   - **Never** use traditional NgRx (actions / reducers / effects).  
   - Each domain (User / Org / Team / Partner / Menu) must have a dedicated store.

2. **State Initialization**  
   - All stores must initialize state; `undefined` is forbidden.  
   - Component-level UI state may use `signal()` only if not shared.  
   - Do not modify domain state directly in components or effects.

3. **Sequential Planning / MCP**  
   - Every non-trivial task must follow:  
     1. Sequential reasoning (step-by-step analysis)  
     2. Decompose requirements into atomic, actionable tasks (Software-planning-mcp)  
     3. Implementation allowed only after planning is fully documented  
   - If planning steps are missing, **STOP** and output a TODO skeleton only.

4. **Forbidden Constructs**  
   - No `ofType`, `switchMap`, `concatMap`, `mergeMap`, or any RxJS operators for state management.  
   - No NgRx Schematics, Data, or Entity abstractions.  
   - No direct I/O or persistence in domain layer.  
   - UI must not contain business logic or access event store directly.

5. **Event-Driven Discipline**  
   - All state changes must occur through events or commands.  
   - Clear distinction between domain events vs technical/system events.  
   - Avoid circular dependencies between events and commands.

---

## REQUIRED OUTPUT FORMAT

When generating code:

1. **Assumptions**  
   - List all assumptions about domain, inputs, and context.

2. **Plan**  
   - Step-by-step tasks (atomic, sequential, actionable)

3. **Implementation**  
   - Only after assumptions and plan are complete.

> **Do not skip steps 1–2. If incomplete, output skeleton / TODO only.**

---

## SIGNALS BEST PRACTICES

1. **State Updates**  
   - Use `patchState` for domain state.  
   - Use `computed()` for derived state.  
   - Use `effect()` for side effects (no direct state changes or business logic).  
   - Async flows via `async/await + service`.

2. **Store Boundaries**  
   - Single store per domain.  
   - Separate UI state from domain state.  
   - Facade pattern recommended for cross-component interaction.

3. **Naming & Semantic Guidelines**  
   - Event names must reflect business meaning.  
   - Aggregate names should describe domain concept, no generic `data/info/handler`.  
   - DTOs must be minimal, serializable, and descriptive.

---

## CONTEXT / MEMORY HANDLING

1. If context is incomplete, do **not** guess:  
   - Output a skeleton or TODO.  
   - Ask clarifying questions if necessary.

2. Use a single source of truth for conversation context.  

3. Do not produce implementation without sufficient planning and assumptions.

---

## TESTING / VALIDATION

1. Verify aggregate invariants with unit tests.  
2. Event replay to validate projections and read models.  
3. Test boundaries and edge cases.  
4. Mock external dependencies to isolate tests.

---

## OUTPUT CHECKPOINTS

1. Every PR must:  
   - Build with PNPM: `pnpm build` passes with zero TypeScript errors.  
   - Have no unused imports or variables.  
   - Have all TODOs resolved or justified.

2. Cross-layer changes must list:  
   - Movement plan  
   - Rollback plan  
   - Reason for dependency changes

3. Sensitive data must **never** be hard-coded; always use environment variables or secrets management.

---

## SUMMARY (One Line)

> Only Angular Signals + NgRx Signals.  
> Plan before you code.  
> Never violate forbidden constructs.  
> Always produce a skeleton if context is insufficient.
