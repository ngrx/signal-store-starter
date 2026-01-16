# Architecture Documentation

This directory contains the complete architectural specification for the Multi-Workspace Team Collaboration System using NgRx Signals and Firebase.

## Navigation

### Core Architecture
1. **[Overview](./01-overview.md)** - System architecture overview and core principles
2. **[Account & Identity Layer](./02-account-identity.md)** - Identity management, authentication, and authorization
3. **[Workspace Layer](./03-workspace.md)** - Workspace management and isolation
4. **[Module Layer](./04-modules.md)** - Feature modules and bounded contexts
5. **[Entity Layer](./05-entity.md)** - Domain entities and state objects
6. **[Cross-Cutting Concerns](./06-cross-cutting.md)** - Events, permissions, observability

### Implementation Patterns
7. **[NgRx Signals Architecture](./07-ngrx-signals.md)** - Pure reactive state management patterns
8. **[Firebase Integration](./08-firebase-integration.md)** - Firebase integration patterns and best practices

## Architecture Principles

### Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear boundaries between domains (Account, Workspace, Module, Entity)
- **Ubiquitous Language**: Consistent terminology across code and documentation
- **Aggregates**: Consistency boundaries for transactions
- **Domain Events**: Capture business-significant occurrences

### Pure Reactive Architecture
- **NgRx Signals**: All state managed with `@ngrx/signals`
- **No Zone.js**: Zone-less change detection for better performance
- **Immutable State**: All state updates via `patchState`
- **Derived State**: Use `computed()` for all derived values

### Layer Separation
```
Account (Identity) → Firebase Auth
  ↓
AuthStore (State) → Signals
  ↓
Workspace (Context) → Firestore
  ↓
Module (Features) → Signal Stores
  ↓
Entity (State) → Normalized State
```

## Quick Reference

### State Management Layers
| Layer | Store | Scope | Lifecycle |
|-------|-------|-------|-----------|
| Global | `GlobalShell` | Application-wide | Singleton (root) |
| Account | `WorkspaceListStore` | User workspaces | Singleton (root) |
| Workspace | `WorkspaceStore` | Current workspace | Singleton (root) |
| Feature | `FeatureStore` | Module-specific | Root or scoped |
| Entity | `EntityStore` | Entity collections | Root or scoped |

### Firebase Services Mapping
| Domain Layer | Firebase Service | Purpose |
|--------------|-----------------|---------|
| Account/Identity | `@angular/fire/auth` | Authentication, claims, sessions |
| Workspace/Team/Partner | `@angular/fire/firestore` | Collections, queries, security rules |
| Documents | `@angular/fire/storage` | File storage, metadata |
| Events | `@angular/fire/functions` | Event triggers, pub/sub |
| Config | `@angular/fire/remote-config` | Feature flags, runtime config |
| Metrics | `@angular/fire/performance` | Performance tracking |

### Forbidden Patterns
- ❌ Traditional NgRx (actions, reducers, effects)
- ❌ RxJS operators in state management (`switchMap`, `mergeMap`, `concatMap`)
- ❌ Direct state mutation (always use `patchState`)
- ❌ Business logic in components
- ❌ Cross-layer direct access (respect boundaries)
- ❌ `undefined` state initialization

## For Copilot Users

When working in this codebase:
1. **Start with the overview** ([01-overview.md](./01-overview.md)) to understand the system
2. **Reference the specific layer** you're working on (Account, Workspace, Module, Entity)
3. **Follow NgRx Signals patterns** ([07-ngrx-signals.md](./07-ngrx-signals.md)) for all state
4. **Use Firebase integration patterns** ([08-firebase-integration.md](./08-firebase-integration.md)) for backend

### Common Tasks
- **Adding a new feature module**: See [04-modules.md](./04-modules.md)
- **Creating a new store**: See [07-ngrx-signals.md](./07-ngrx-signals.md)
- **Adding authentication**: See [02-account-identity.md](./02-account-identity.md)
- **Implementing workspace isolation**: See [03-workspace.md](./03-workspace.md)
- **Working with events**: See [06-cross-cutting.md](./06-cross-cutting.md)

## Related Documentation
- [Project Specification](../specification.md) - Naming conventions and folder structure
- [Copilot Instructions](../../.github/copilot-instructions.md) - Development guidelines
- [Instruction Files](../../.github/instructions/) - Detailed implementation patterns
