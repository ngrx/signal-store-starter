---
description: 'Domain-Driven Design (DDD) architecture principles for core domain layer. Follow bounded contexts, ubiquitous language, and aggregate patterns. Apply to all core domain files.'
applyTo: 'src/app/core/**/*'
---

# Domain-Driven Design (DDD) Architecture

## Core Principles

This project follows Domain-Driven Design (DDD) principles with strict layer boundaries and pure reactive state management using NgRx Signals.

## Architecture Layers

```
┌──────────────────────────────────────────────┐
│ Domain Layer (Models, Rules)                 │
│ - Pure TypeScript, no framework dependencies │
│ - Business rules and invariants              │
│ Location: src/app/core/**/models             │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│ Application Layer (State Management)         │
│ - signalStore + rxMethod                     │
│ - Use cases and orchestration                │
│ Location: src/app/core/**/stores             │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│ Infrastructure Layer (External Services)     │
│ - Firebase wrappers, API clients             │
│ - Data persistence                           │
│ Location: src/app/core/**/services           │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│ Interface Layer (UI)                         │
│ - Components, pages, guards                  │
│ - Presentation logic only                    │
│ Location: src/app/features/**                │
└──────────────────────────────────────────────┘
```

## Bounded Contexts

### Primary Contexts

Each bounded context has clear boundaries and responsibilities:

**Account Context** (`src/app/core/auth/`, `src/app/core/organization/`, `src/app/core/team/`, `src/app/core/partner/`)
- Identity management
- Authentication and authorization
- Account types: User, Organization, Team, Partner, Bot
- Custom claims and roles

**Workspace Context** (`src/app/core/workspace/`, `src/app/core/context/`)
- Workspace management
- Workspace isolation
- Member management
- Permission scoping

**Module Context** (`src/app/core/workspace/stores/`)
- Feature modules: overview, documents, tasks, members, permissions, audit, settings, journal
- Bounded contexts within workspace
- Module-specific state

**Global Shell** (`src/app/core/global-shell/`)
- Application-wide state
- Config, layout, router
- Cross-workspace concerns

**Event Bus** (`src/app/core/event-bus/`)
- Cross-context communication
- Domain events
- Decoupling

## Ubiquitous Language

### Required Terminology

Use these terms consistently across code, documentation, and communication:

**Account Layer**
- `Account` - Any identity (User, Organization, Team, Partner, Bot)
- `User` - Individual account
- `Organization` - Collective account
- `Team` - Internal subunit of organization
- `Partner` - External subunit with limited access
- `Bot` - Automated service account

**Workspace Layer**
- `Workspace` - Logical container for resources
- `WorkspaceList` - Collection of workspaces for an account
- `Member` - Account with workspace access
- `Role` - Permission level (Owner, Admin, Member, Guest, Bot)

**Module Layer**
- `Module` - Feature within workspace (documents, tasks, members, etc.)
- `Feature` - Synonym for module in code
- `Entity` - State object within module (Task, Document, etc.)

**Event Layer**
- `DomainEvent` - Business-significant occurrence
- `SystemEvent` - Technical event
- `Command` - Intent to change state
- `Query` - Request for data

### Forbidden Terms

Do NOT use these ambiguous or generic terms:
- ❌ `data`, `info`, `handler`, `manager` (too generic)
- ❌ `action`, `reducer`, `effect` (traditional NgRx, forbidden)
- ❌ `subject`, `observable` (use signals instead)
- ❌ `component-level state` without clarification (use signal stores or local signals)

## Aggregate Patterns

### Aggregate Rules

**Workspace is the Primary Aggregate Root**
- Consistency boundary for transactions
- All entities scoped to workspace
- State isolation per workspace

**Module Aggregates**
- Each module has its own store
- Module-specific entities
- Module-level permissions

**Entity Boundaries**
- Entities belong to modules
- Entity state managed by module store
- Cross-entity references via IDs only

### Aggregate Implementation

```typescript
// Domain Model (Pure TypeScript)
// Location: src/app/core/workspace/models/workspace.model.ts
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  accountId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'guest' | 'bot';
  joinedAt: Date;
  status: 'active' | 'invited' | 'suspended' | 'archived';
}

// Application Layer (Signal Store)
// Location: src/app/core/workspace/stores/workspace.store.ts
export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withState<WorkspaceState>({
    workspace: null,
    members: [],
    loading: false,
    error: null
  }),
  withComputed(({ workspace, members }) => ({
    workspaceName: computed(() => workspace()?.name ?? ''),
    memberCount: computed(() => members().length),
    isOwner: computed(() => {
      const ws = workspace();
      const authUser = inject(AuthStore).user();
      return ws?.ownerId === authUser?.uid;
    })
  })),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    loadWorkspace: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((id) => workspaceService.getWorkspace(id)),
        tapResponse({
          next: (workspace) => patchState(store, { workspace, loading: false }),
          error: (error) => patchState(store, { error: error.message, loading: false })
        })
      )
    )
  }))
);

// Infrastructure Layer (Service)
// Location: src/app/core/workspace/services/workspace.service.ts
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private firestore = inject(Firestore);
  
  getWorkspace(id: string): Observable<Workspace> {
    const docRef = doc(this.firestore, `workspaces/${id}`);
    return docData(docRef) as Observable<Workspace>;
  }
}
```

## Domain Events

### Event Naming

Events must reflect business meaning, not technical operations:

**Good Event Names**
- ✅ `WorkspaceCreated`
- ✅ `MemberJoined`
- ✅ `TaskCompleted`
- ✅ `DocumentShared`
- ✅ `PermissionGranted`

**Bad Event Names**
- ❌ `WorkspaceSaved` (technical, not business)
- ❌ `DataUpdated` (too generic)
- ❌ `StateChanged` (technical)

### Event Implementation

```typescript
// Domain Event Model
export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  workspaceId: string;
  accountId: string;
  timestamp: Date;
  payload: T;
}

// Specific Event
export interface WorkspaceCreatedEvent extends DomainEvent<{
  workspaceId: string;
  name: string;
  ownerId: string;
}> {
  type: 'workspace.created';
}

// Event Bus Usage
const eventBus = inject(EventBusStore);
eventBus.publish({
  type: 'workspace.created',
  workspaceId: newWorkspace.id,
  accountId: currentUser.uid,
  timestamp: new Date(),
  payload: {
    workspaceId: newWorkspace.id,
    name: newWorkspace.name,
    ownerId: currentUser.uid
  }
});
```

## Layer Boundaries

### Dependency Rules

**Direction of Dependencies** (Always inward)
```
Interface Layer
  ↓ (can depend on)
Application Layer
  ↓ (can depend on)
Domain Layer
  ↑ (cannot depend on outer layers)
```

**Forbidden Dependencies**
- ❌ Domain layer cannot import from Application, Infrastructure, or Interface
- ❌ Application layer cannot import from Infrastructure or Interface
- ❌ Infrastructure layer can only depend on Domain and Application
- ❌ Interface layer should minimize direct Infrastructure imports

**Allowed Dependencies**
- ✅ Interface → Application (inject stores)
- ✅ Application → Domain (use models)
- ✅ Application → Infrastructure (inject services)
- ✅ Infrastructure → Domain (use models)

### Cross-Context Communication

**Use Event Bus for Cross-Context**
```typescript
// Instead of direct store access across contexts
// ❌ BAD: Direct cross-context dependency
const workspaceStore = inject(WorkspaceStore);
const currentWorkspaceId = workspaceStore.workspace().id;

// ✅ GOOD: Via event bus
const eventBus = inject(EventBusStore);
eventBus.subscribe('workspace.switched', (event) => {
  // React to workspace change
});
```

## State Isolation

### Workspace Isolation

All workspace-scoped state must:
1. Filter by `workspaceId`
2. Reset on workspace switch
3. Never leak data across workspaces

```typescript
// Workspace-scoped query
withMethods((store, taskService = inject(TaskService)) => ({
  loadTasks: rxMethod<string>(
    pipe(
      switchMap((workspaceId) => 
        // Always filter by workspaceId
        taskService.getTasks(workspaceId)
      ),
      tapResponse({
        next: (tasks) => patchState(store, { tasks }),
        error: (error) => patchState(store, { error: error.message })
      })
    )
  )
}))

// Reset on workspace switch
withHooks({
  onInit(store) {
    const contextStore = inject(ContextStore);
    // Watch for workspace changes
    effect(() => {
      const currentWorkspaceId = contextStore.currentWorkspaceId();
      if (currentWorkspaceId) {
        // Reset and reload for new workspace
        patchState(store, initialState);
        store.loadTasks(currentWorkspaceId);
      }
    });
  }
})
```

## Testing DDD Architecture

### Domain Layer Tests
```typescript
// Test pure business logic
describe('Workspace', () => {
  it('should create valid workspace with required fields', () => {
    const workspace: Workspace = {
      id: '1',
      name: 'Test Workspace',
      ownerId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    expect(workspace.name).toBe('Test Workspace');
  });
});
```

### Application Layer Tests
```typescript
// Test store behavior
describe('WorkspaceStore', () => {
  it('should load workspace and update state', async () => {
    const store = new WorkspaceStore();
    const mockService = { 
      getWorkspace: () => of(mockWorkspace) 
    };
    
    store.loadWorkspace('1');
    await firstValueFrom(store.workspace$);
    
    expect(store.workspace()).toEqual(mockWorkspace);
  });
});
```

## Related Documentation
- [NgRx Signals Architecture](../../docs/architecture/07-ngrx-signals.md)
- [Firebase Integration](./firebase-integration.instructions.md)
- [Project Layer Mapping](../project-layer-mapping.yml)
