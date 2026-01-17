---
description: 'Project structure and layer mapping for DDD architecture. Defines file organization, naming conventions, and cross-layer dependency rules. Apply to all files.'
applyTo: '**'
---

# Project Structure and Layer Mapping

## Overview

This project follows a strict Domain-Driven Design (DDD) architecture with clear layer boundaries. Understanding the project structure and layer mapping is critical for maintaining clean architecture.

## Directory Structure

```
src/app/
├── core/                          # Core domain layer
│   ├── auth/                      # Account/Authentication domain
│   │   ├── models/                # Domain: Pure TypeScript models
│   │   ├── stores/                # Application: Signal stores
│   │   └── services/              # Infrastructure: Firebase Auth wrappers
│   │
│   ├── context/                   # Context switching domain
│   │   ├── models/
│   │   ├── stores/
│   │   └── services/
│   │
│   ├── workspace/                 # Workspace domain
│   │   ├── models/
│   │   ├── stores/                # Module stores (tasks, documents, etc.)
│   │   └── services/              # Firestore wrappers
│   │
│   ├── organization/              # Organization domain
│   │   ├── models/
│   │   ├── stores/
│   │   └── services/
│   │
│   ├── team/                      # Team domain
│   │   ├── models/
│   │   ├── stores/
│   │   └── services/
│   │
│   ├── partner/                   # Partner domain
│   │   ├── models/
│   │   ├── stores/
│   │   └── services/
│   │
│   ├── event-bus/                 # Event-driven communication
│   │   ├── models/
│   │   ├── stores/
│   │   └── services/
│   │
│   └── global-shell/              # Global application state
│       ├── models/
│       ├── stores/                # Config, Layout, Router stores
│       └── services/
│
├── features/                      # Interface layer (UI)
│   ├── account/                   # Account feature UI
│   │   ├── components/
│   │   ├── pages/
│   │   └── guards/
│   │
│   ├── workspace/                 # Workspace feature UI
│   │   ├── components/
│   │   ├── pages/
│   │   └── guards/
│   │
│   ├── modules/                   # Module feature UI
│   │   ├── components/
│   │   ├── pages/
│   │   └── guards/
│   │
│   ├── dashboard/                 # Dashboard UI
│   │   ├── components/
│   │   └── pages/
│   │
│   └── shared/                    # Shared UI components
│       ├── components/
│       ├── directives/
│       └── pipes/
│
├── app.component.ts               # Root component
├── app.config.ts                  # Application configuration
└── app.routes.ts                  # Route definitions
```

## Layer Mapping

### Layer Definitions

| Layer | Purpose | Location Pattern | Allowed Dependencies |
|-------|---------|------------------|---------------------|
| **Domain** | Business models, rules, invariants | `src/app/core/**/models/` | None (pure TypeScript) |
| **Application** | State management, use cases | `src/app/core/**/stores/` | Domain, Infrastructure (inject) |
| **Infrastructure** | External services, persistence | `src/app/core/**/services/` | Domain (models only) |
| **Interface** | UI components, pages, guards | `src/app/features/**` | Application (stores), Shared |

### Dependency Direction

```
┌──────────────────────────────────────┐
│ Interface Layer (features/**)       │ ← User interactions
│ - Components, pages, guards          │
│ - Can depend on: Application         │
└──────────────────────────────────────┘
              ↓ inject stores
┌──────────────────────────────────────┐
│ Application Layer (core/**/stores)   │ ← State management
│ - Signal stores, use cases           │
│ - Can depend on: Domain, Infra       │
└──────────────────────────────────────┘
         ↓ use models    ↓ inject services
┌──────────────┐    ┌───────────────────┐
│ Domain Layer │    │ Infrastructure    │
│ (models)     │    │ (services)        │
│ Pure TS only │    │ Firebase wrappers │
└──────────────┘    └───────────────────┘
```

**Allowed Dependencies:**
- ✅ Interface → Application (inject stores)
- ✅ Application → Domain (use models)
- ✅ Application → Infrastructure (inject services)
- ✅ Infrastructure → Domain (use models)
- ❌ Domain → Application (forbidden)
- ❌ Domain → Infrastructure (forbidden)
- ❌ Domain → Interface (forbidden)
- ❌ Application → Interface (forbidden)
- ❌ Infrastructure → Application (forbidden, except event bus)
- ❌ Infrastructure → Interface (forbidden)

## File Naming Conventions

### TypeScript Files

| Type | Pattern | Example | Location |
|------|---------|---------|----------|
| **Models** | `{name}.model.ts` | `workspace.model.ts` | `core/**/models/` |
| **Interfaces** | `{name}.interface.ts` | `user.interface.ts` | `core/**/models/` |
| **Stores** | `{name}.store.ts` | `workspace.store.ts` | `core/**/stores/` |
| **Services** | `{name}.service.ts` | `workspace.service.ts` | `core/**/services/` |
| **Components** | `{name}.component.ts` | `header.component.ts` | `features/**/components/` |
| **Pages** | `{name}.page.ts` | `dashboard.page.ts` | `features/**/pages/` |
| **Guards** | `{name}.guard.ts` | `auth.guard.ts` | `features/**/guards/` |
| **Directives** | `{name}.directive.ts` | `highlight.directive.ts` | `features/shared/directives/` |
| **Pipes** | `{name}.pipe.ts` | `date-format.pipe.ts` | `features/shared/pipes/` |

### Template and Style Files

| Type | Pattern | Example |
|------|---------|---------|
| **Templates** | `{name}.component.html` | `header.component.html` |
| **Styles** | `{name}.component.scss` | `header.component.scss` |

### Case Conventions

- **Files/Folders**: kebab-case (`workspace-list.component.ts`)
- **Classes/Interfaces**: PascalCase (`WorkspaceListComponent`)
- **Variables/Functions**: camelCase (`currentWorkspace`, `loadWorkspace()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_WORKSPACE_MEMBERS`)

## Domain Organization

### Core Domains

Each core domain follows the same internal structure:

```
{domain}/
├── models/           # Domain layer
│   ├── {entity}.model.ts
│   └── {value-object}.model.ts
├── stores/           # Application layer
│   ├── {aggregate}.store.ts
│   └── {module}.store.ts
└── services/         # Infrastructure layer
    ├── {resource}.service.ts
    └── {integration}.service.ts
```

### Domain List

| Domain | Path | Responsibility |
|--------|------|----------------|
| **auth** | `core/auth/` | Authentication, user identity |
| **context** | `core/context/` | Context switching (Personal/Org/Team/Partner) |
| **workspace** | `core/workspace/` | Workspace management, modules |
| **organization** | `core/organization/` | Organization accounts |
| **team** | `core/team/` | Team subunits |
| **partner** | `core/partner/` | Partner subunits |
| **event-bus** | `core/event-bus/` | Cross-domain events |
| **global-shell** | `core/global-shell/` | Global app state (config, layout, router) |

## Workspace Module Stores

The workspace domain contains stores for all workspace features:

```
core/workspace/stores/
├── workspace.store.ts        # Main workspace context
├── overview.store.ts          # Dashboard/overview module
├── document.store.ts          # Documents module
├── task.store.ts              # Tasks module
├── members.store.ts           # Members module
├── permission.store.ts        # Permissions module
├── audit.store.ts             # Audit logs module
├── settings.store.ts          # Settings module
└── journal.store.ts           # Event journal module
```

Each module store is workspace-scoped and filters all data by `workspaceId`.

## Import Path Aliases

Use TypeScript path aliases for clean imports:

```typescript
// ✅ GOOD: Path alias
import { Workspace } from '@core/workspace/models/workspace.model';
import { WorkspaceStore } from '@core/workspace/stores/workspace.store';
import { WorkspaceService } from '@core/workspace/services/workspace.service';

// ❌ BAD: Relative paths
import { Workspace } from '../../../core/workspace/models/workspace.model';
```

### Configured Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@shared/*": ["src/app/features/shared/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

## Cross-Layer Communication

### Stores Accessing Services

```typescript
// ✅ GOOD: Application layer (store) injects Infrastructure layer (service)
export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    loadWorkspace: rxMethod<string>(
      pipe(
        switchMap((id) => workspaceService.getWorkspace(id)),
        tapResponse({
          next: (workspace) => patchState(store, { workspace }),
          error: (error) => patchState(store, { error: error.message })
        })
      )
    )
  }))
);
```

### Components Accessing Stores

```typescript
// ✅ GOOD: Interface layer (component) injects Application layer (store)
import { WorkspaceStore } from '@core/workspace/stores/workspace.store';

@Component({
  selector: 'app-workspace-detail',
  template: `
    @if (workspaceStore.workspace(); as workspace) {
      <h1>{{ workspace.name }}</h1>
    }
  `
})
export class WorkspaceDetailComponent {
  workspaceStore = inject(WorkspaceStore);
}
```

### Cross-Store Communication (Event Bus)

```typescript
// ✅ GOOD: Use event bus for cross-domain communication
import { EventBusStore } from '@core/event-bus/stores/event-bus.store';

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withMethods((store, eventBus = inject(EventBusStore)) => ({
    deleteWorkspace(id: string) {
      // ... delete logic
      // Publish event for other stores to react
      eventBus.publish({
        type: 'workspace.deleted',
        workspaceId: id,
        timestamp: new Date()
      });
    }
  }))
);
```

## Forbidden Patterns

### Direct Firebase Access in Stores

```typescript
// ❌ BAD: Direct Firebase in store
import { Firestore, doc, docData } from '@angular/fire/firestore';

export const WorkspaceStore = signalStore(
  withMethods(() => {
    const firestore = inject(Firestore); // ❌ NO
    return {
      loadWorkspace: rxMethod<string>(
        pipe(
          switchMap((id) => {
            const docRef = doc(firestore, `workspaces/${id}`);
            return docData(docRef); // ❌ NO
          })
        )
      )
    };
  })
);

// ✅ GOOD: Use service wrapper
export const WorkspaceStore = signalStore(
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    loadWorkspace: rxMethod<string>(
      pipe(
        switchMap((id) => workspaceService.getWorkspace(id))
      )
    )
  }))
);
```

### Business Logic in Components

```typescript
// ❌ BAD: Business logic in component
@Component({...})
export class TaskListComponent {
  completeTask(task: Task) {
    task.status = 'completed'; // ❌ NO
    task.completedAt = new Date(); // ❌ NO
    this.firestore.update(`tasks/${task.id}`, task); // ❌ NO
  }
}

// ✅ GOOD: Delegate to store
@Component({...})
export class TaskListComponent {
  tasksStore = inject(TasksStore);
  
  completeTask(taskId: string) {
    this.tasksStore.completeTask(taskId);
  }
}
```

### Cross-Layer Violations

```typescript
// ❌ BAD: Domain importing Application
// File: core/workspace/models/workspace.model.ts
import { WorkspaceStore } from '../stores/workspace.store'; // ❌ NO

// ❌ BAD: Service importing Store
// File: core/workspace/services/workspace.service.ts
import { WorkspaceStore } from '../stores/workspace.store'; // ❌ NO

// ❌ BAD: Component importing Service directly
// File: features/workspace/components/workspace-detail.component.ts
import { WorkspaceService } from '@core/workspace/services/workspace.service'; // ❌ NO
// Use store instead
```

## File Organization Checklist

Before creating a new file, ask:

- [ ] What layer does this belong to? (Domain/Application/Infrastructure/Interface)
- [ ] What domain does this belong to? (auth/workspace/organization/etc.)
- [ ] What type of file is this? (model/store/service/component)
- [ ] Is the naming convention correct? (kebab-case, proper suffix)
- [ ] Are the dependencies allowed? (check layer dependency rules)
- [ ] Is there a path alias I should use? (@core, @features, @shared)

## Related Documentation

- [DDD Architecture](./ddd-architecture.instructions.md) - Layer principles and patterns
- [NgRx Signals](./ngrx-signals.instructions.md) - Store structure and patterns
- [Firebase Integration](./firebase-integration.instructions.md) - Service patterns
- [Angular Instructions](./angular.instructions.md) - Component and UI patterns
- [Project Layer Mapping](../project-layer-mapping.yml) - YAML configuration
