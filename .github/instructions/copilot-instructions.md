# Copilot Constitutional Rules

## Source of Truth

Copilot MUST treat the following files as authoritative:

- docs/TREE.md
- docs/ARP.md
- docs/PROJECT_TREE.generated.md

If any output cannot be mapped to these files, it MUST NOT be generated.

---

## Mandatory Structural Model

All structures MUST conform to:

Account
 → IdentityContext
 → Workspace
 → Module
 → Entity
 → Command | Query | Policy | Event | Adapter | State

Account / IdentityContext MUST exist explicitly.
Account MUST NEVER be merged with Workspace.

---

## Context Safety Rules

- IdentityContext controls:
  Auth, Claims, Roles, Permission, Guard, Session
- Workspace controls:
  Resources, Modules, Feature State

Cross-layer access is forbidden.

---

## NgRx Enforcement Rules

- Components MUST NOT perform I/O.
- Reducers MUST be pure.
- Effects are the ONLY I/O entrypoint.
- No cross-module state access.
- No circular feature dependency.

---

## Generation Rules

Before generating any file or folder:

1. Locate its node in PROJECT_TREE.generated.md.
2. If no node exists → STOP.
3. Never invent new abstractions.
4. Never merge responsibilities.
