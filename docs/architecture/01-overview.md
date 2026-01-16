# Architecture Overview - NgRx Signals Pure Reactive System

## System Purpose

Multi-workspace team collaboration system built with Angular 20+, NgRx Signals, and Firebase. Supports multiple account types (Users, Organizations, Teams, Partners) collaborating across isolated workspaces with feature modules.

## Core Architecture Model

```
Account → WorkspaceList → Workspace → Module → Entity
誰      → 擁有哪些      → 在哪      → 做什麼  → 狀態
Who     → Owns What     → Where     → Do What → State
```

### Layer Hierarchy

```
┌─────────────────────────────────────────────────┐
│ Account (Identity Layer)                        │
│ - Who is acting                                 │
│ - User | Organization | Team | Partner | Bot    │
│ - Firebase Auth: Authentication & Claims        │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ WorkspaceList (Collection Layer)                │
│ - What workspaces does this account have        │
│ - OwnedWorkspaces | MemberWorkspaces            │
│ - Workspace discovery and switching             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Workspace (Context Layer)                       │
│ - Where is work happening                       │
│ - Logical container for resources               │
│ - Data isolation boundary                       │
│ - Permission scope                              │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Module (Feature Layer)                          │
│ - What features are available                   │
│ - overview | documents | tasks | members        │
│ - permissions | audit | settings | journal      │
│ - Bounded contexts within workspace             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Entity (State Layer)                            │
│ - Specific state objects                        │
│ - Task | Document | Member | Permission         │
│ - Workspace-scoped data                         │
└─────────────────────────────────────────────────┘
```

## Architectural Principles

### 1. Pure Reactive State Management

**NgRx Signals Only**
- All state managed with `@ngrx/signals`
- No traditional NgRx (actions, reducers, effects)
- Signal-based reactivity for zone-less Angular

**Core Patterns**
```typescript
// State definition
withState({ user: null, loading: false })

// Derived state
withComputed(({ user }) => ({
  isAuthenticated: computed(() => user() !== null)
}))

// State mutations
withMethods((store) => ({
  setUser: (user) => patchState(store, { user })
}))

// Async operations
withMethods((store, authService = inject(AuthService)) => ({
  login: rxMethod<Credentials>(
    pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap((creds) => authService.login(creds)),
      tapResponse({
        next: (user) => patchState(store, { user, loading: false }),
        error: () => patchState(store, { loading: false })
      })
    )
  )
}))
```

### 2. Domain-Driven Design (DDD)

**Ubiquitous Language**
- Consistent terminology: Account, Workspace, Module, Entity
- Business terms in code: Owner, Admin, Member, Guest
- Domain events: WorkspaceCreated, MemberJoined, TaskCompleted

**Bounded Contexts**
- Each layer has clear boundaries
- No cross-layer direct access
- Communication through well-defined interfaces

**Aggregates**
- Workspace is the primary aggregate root
- Consistency boundaries for transactions
- State isolation per workspace

### 3. Layer Separation

**Domain Layer** (Models, Rules)
- Pure TypeScript models
- Business rules and invariants
- No dependencies on infrastructure
- Location: `src/app/core/**/models`

**Application Layer** (State Management)
- Signal stores with business logic
- Use cases and orchestration
- `signalStore` + `rxMethod`
- Location: `src/app/core/**/stores`

**Infrastructure Layer** (External Services)
- Firebase service wrappers
- External API clients
- Data persistence
- Location: `src/app/core/**/services`

**Interface Layer** (UI)
- Components, pages, guards
- Presentation logic only
- Signal consumption via templates
- Location: `src/app/features/**`

### 4. Workspace Isolation

**Data Isolation**
- All queries filtered by `workspaceId`
- No cross-workspace data leakage
- Separate caches per workspace

**Permission Scope**
- Permissions evaluated at workspace level
- Role-based access control (RBAC)
- Inherited from workspace to modules to entities

**State Reset**
- Clear workspace-scoped state on switch
- Preserve global state (auth, config)
- Reload new workspace context

## State Architecture

### Store Hierarchy

```
GlobalShell (providedIn: 'root')
├─ Auth
├─ Config
├─ Layout
└─ Router

WorkspaceListStore (providedIn: 'root')
├─ workspaces[]
├─ currentWorkspaceId
└─ Computed: ownedWorkspaces, memberWorkspaces

WorkspaceStore (providedIn: 'root')
├─ workspace
├─ permissions
├─ preferences
├─ members[]
└─ modules[]

FeatureStore (per module, providedIn: 'root' or scoped)
├─ TasksStore
├─ DocumentsStore
├─ MembersStore
├─ PermissionsStore
├─ AuditStore
├─ SettingsStore
└─ JournalStore

EntityStore (normalized collections)
├─ entities { [id]: entity }
├─ ids[]
└─ selectedIds[]
```

### State Flow

```
User Action
  ↓
Component calls Store Method
  ↓
rxMethod processes async operation
  ↓
tapResponse handles success/error
  ↓
patchState updates signals
  ↓
computed() recalculates derived state
  ↓
Template updates via signals (@if, @for)
```

## Firebase Integration

### Service Mapping

| Domain | Firebase Service | Purpose |
|--------|------------------|---------|
| Account/Auth | `@angular/fire/auth` | Authentication, claims, tokens |
| Workspace | `@angular/fire/firestore` | Workspace documents, collections |
| Team/Partner | `@angular/fire/firestore` | SubUnit collections, queries |
| Documents | `@angular/fire/storage` | File storage, uploads |
| Tasks | `@angular/fire/firestore` | Task collections, real-time sync |
| Events | `@angular/fire/functions` | Event triggers, pub/sub |
| Config | `@angular/fire/remote-config` | Feature flags, A/B testing |
| Audit | `@angular/fire/firestore` | Append-only audit logs |
| Performance | `@angular/fire/performance` | Metrics, traces |

### Data Structure

```
/accounts/{accountId}
  - type: 'user' | 'organization' | 'team' | 'partner'
  - profile, settings

/workspaces/{workspaceId}
  - name, description, ownerId
  - /members/{memberId} - roles, permissions
  - /modules/{moduleId} - enabled modules
  - /tasks/{taskId} - tasks
  - /documents/{documentId} - document metadata
  - /audit/{auditId} - audit logs
  - /journal/{eventId} - event journal

/organizations/{orgId}
  - subCollection: teams, partners

/teams/{teamId}
  - parentOrgId, members

/partners/{partnerId}
  - parentOrgId, contractInfo
```

## Cross-Cutting Concerns

### Event Bus
- Decouples modules and stores
- Domain events vs system events
- Workspace-scoped event isolation

### Permissions
- Role-based access control (RBAC)
- Workspace-level roles: Owner, Admin, Member, Guest, Bot
- Permission inheritance: Workspace → Module → Entity
- Guards for route protection

### Observability
- Structured logging
- Performance metrics
- Audit trails (append-only)
- Error tracking

### Security
- Firebase Security Rules
- Custom claims for roles
- Input validation
- CSRF protection

## Next Steps

Continue with specific layer documentation:
- [Account & Identity Layer](./02-account-identity.md)
- [Workspace Layer](./03-workspace.md)
- [Module Layer](./04-modules.md)
- [Entity Layer](./05-entity.md)
- [Cross-Cutting Concerns](./06-cross-cutting.md)
- [NgRx Signals Architecture](./07-ngrx-signals.md)
- [Firebase Integration](./08-firebase-integration.md)
