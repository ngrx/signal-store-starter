# Documentation Index

Welcome to the signal-store-starter documentation. This index helps you navigate the comprehensive documentation for this Angular 20+ project using NgRx Signals and Firebase.

## 🎯 Quick Start

### New to the Project?
1. Read the [Project README](../README.md) for setup and basic usage
2. Review the [Architecture Overview](./architecture/01-overview.md) to understand the system design
3. Check the [Project Specification](./specification.md) for naming conventions and folder structure
4. Explore [Copilot Instructions](./../.github/instructions/README.md) for development guidelines

### Looking for Specific Topics?

| Topic | Document |
|-------|----------|
| **Setup & Configuration** | [README.md](../README.md) |
| **Architecture Overview** | [Architecture Overview](./architecture/01-overview.md) |
| **DDD Principles** | [DDD Architecture](./../.github/instructions/ddd-architecture.instructions.md) |
| **State Management** | [NgRx Signals](./architecture/07-ngrx-signals.md), [Signals Instructions](./../.github/instructions/ngrx-signals.instructions.md) |
| **Firebase Integration** | [Firebase Integration](./architecture/08-firebase-integration.md), [Firebase Instructions](./../.github/instructions/firebase-integration.instructions.md) |
| **Coding Standards** | [Angular Instructions](./../.github/instructions/angular.instructions.md), [TypeScript Instructions](./../.github/instructions/typescript-5-es2022.instructions.md) |

## 📚 Documentation Structure

### 1. Architecture Documentation (`docs/architecture/`)

Comprehensive architectural specifications for the DDD-based system:

| Document | Description |
|----------|-------------|
| [README](./architecture/README.md) | Architecture navigation and quick reference |
| [01 - Overview](./architecture/01-overview.md) | System architecture and core principles |
| [02 - Account & Identity](./architecture/02-account-identity.md) | Account types, authentication, authorization |
| [03 - Workspace Layer](./architecture/03-workspace.md) | ⏳ Workspace management and isolation |
| [04 - Module Layer](./architecture/04-modules.md) | ⏳ Feature modules and bounded contexts |
| [05 - Entity Layer](./architecture/05-entity.md) | ⏳ Domain entities and state objects |
| [06 - Cross-Cutting Concerns](./architecture/06-cross-cutting.md) | ⏳ Events, permissions, observability |
| [07 - NgRx Signals Architecture](./architecture/07-ngrx-signals.md) | ⏳ Complete NgRx Signals reference |
| [08 - Firebase Integration](./architecture/08-firebase-integration.md) | ⏳ Complete Firebase patterns |

*⏳ = In progress*

### 2. Product Requirements (`docs/`)

High-level requirements and specifications:

| Document | Description |
|----------|-------------|
| [prd.md](./prd.md) | Product Requirements Document (comprehensive DDD spec) |
| [specification.md](./specification.md) | Project naming conventions and folder structure |
| [design.md](./design.md) | Context switcher and UI design |
| [requirements.md](./requirements.md) | Functional requirements (EARS notation) |
| [tasks.md](./tasks.md) | Task tracking and completion status |

### 3. Copilot Instructions (`.github/instructions/`)

Development guidelines and patterns for GitHub Copilot:

| Category | Files |
|----------|-------|
| **Master Index** | [README.md](./../.github/instructions/README.md) |
| **Architecture** | [DDD Architecture](./../.github/instructions/ddd-architecture.instructions.md), [NgRx Signals](./../.github/instructions/ngrx-signals.instructions.md), [Firebase Integration](./../.github/instructions/firebase-integration.instructions.md) |
| **Code Quality** | [Angular](./../.github/instructions/angular.instructions.md), [TypeScript](./../.github/instructions/typescript-5-es2022.instructions.md), [Code Review](./../.github/instructions/code-review-generic.instructions.md) |
| **Security** | [Security & OWASP](./../.github/instructions/security-and-owasp.instructions.md), [Accessibility](./../.github/instructions/a11y.instructions.md) |

Full list: [Instruction Files Index](./../.github/instructions/README.md)

## 🏗️ Architecture Layers

This project follows strict Domain-Driven Design with clear layer boundaries:

```
┌─────────────────────────────────────────────────┐
│ Domain Layer (Models, Rules)                    │
│ Location: src/app/core/**/models                │
│ Pure TypeScript, no framework dependencies      │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Application Layer (State Management)            │
│ Location: src/app/core/**/stores                │
│ signalStore + rxMethod only                     │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Infrastructure Layer (External Services)        │
│ Location: src/app/core/**/services              │
│ Firebase wrappers, API clients                  │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Interface Layer (UI)                            │
│ Location: src/app/features/**                   │
│ Components, pages, guards                       │
└─────────────────────────────────────────────────┘
```

**Learn More**: [Architecture Overview](./architecture/01-overview.md) | [DDD Principles](./../.github/instructions/ddd-architecture.instructions.md)

## 🔥 Core Technology Stack

- **Framework**: Angular 20.0.0 (zone-less mode)
- **State Management**: @ngrx/signals 20.0.0 (pure reactive)
- **Backend**: @angular/fire 20.0.0 (Firebase)
- **Language**: TypeScript 5.8.0 (strict mode)

**Learn More**: [README.md](../README.md#-tech-stack)

## 🚀 Common Development Tasks

### Adding a New Feature Module

1. Read [Module Layer Documentation](./architecture/04-modules.md)
2. Follow [DDD Architecture Guidelines](./../.github/instructions/ddd-architecture.instructions.md)
3. Use [NgRx Signals Patterns](./../.github/instructions/ngrx-signals.instructions.md) for state
4. Apply [Firebase Integration Patterns](./../.github/instructions/firebase-integration.instructions.md) for services

### Creating a New Store

1. Review [NgRx Signals Architecture](./architecture/07-ngrx-signals.md)
2. Follow [Store Templates](./../.github/instructions/ngrx-signals.instructions.md#store-structure)
3. Ensure [Workspace Isolation](./../.github/instructions/ddd-architecture.instructions.md#state-isolation)

### Implementing Authentication

1. Review [Account & Identity Layer](./architecture/02-account-identity.md)
2. Use [Auth Service Pattern](./../.github/instructions/firebase-integration.instructions.md#firebase-auth-angularfireauth)
3. Follow [Security Guidelines](./../.github/instructions/security-and-owasp.instructions.md)

### Working with Firebase

1. Check [Firebase Integration Architecture](./architecture/08-firebase-integration.md)
2. Follow [Service Layer Patterns](./../.github/instructions/firebase-integration.instructions.md)
3. Apply [Firestore Best Practices](./../.github/instructions/firebase-integration.instructions.md#best-practices)

## ⚠️ Critical Rules

### Forbidden Patterns (Never Use)

- ❌ Traditional NgRx (actions, reducers, effects)
- ❌ RxJS operators in state management (`switchMap`, `mergeMap`, `concatMap` in stores)
- ❌ Direct state mutation (always use `patchState`)
- ❌ Business logic in components
- ❌ Cross-layer direct access (respect DDD boundaries)
- ❌ Undefined state initialization
- ❌ Zone.js imports

### Required Patterns (Always Use)

- ✅ `@ngrx/signals` for all state management
- ✅ `patchState` for all state mutations
- ✅ `computed()` for all derived state
- ✅ `rxMethod` for all async operations
- ✅ Respect layer boundaries (Domain → Application → Infrastructure → Interface)
- ✅ Initialize all state values (no `undefined`)
- ✅ Zone-less change detection

**Learn More**: [Copilot Instructions](./../.github/copilot-instructions.md) | [Forbidden Instructions](./../.github/forbidden-copilot-instructions.md)

## 🔍 Finding Documentation

### By Topic

- **Authentication**: [Account & Identity](./architecture/02-account-identity.md) → [Auth Service](./../.github/instructions/firebase-integration.instructions.md#firebase-auth-angularfireauth)
- **Workspaces**: [Workspace Layer](./architecture/03-workspace.md) → [Workspace Isolation](./../.github/instructions/ddd-architecture.instructions.md#workspace-isolation)
- **State Management**: [NgRx Signals](./architecture/07-ngrx-signals.md) → [Store Patterns](./../.github/instructions/ngrx-signals.instructions.md)
- **Database**: [Firebase Integration](./architecture/08-firebase-integration.md) → [Firestore Patterns](./../.github/instructions/firebase-integration.instructions.md#firestore-angularfirefirestore)
- **Code Quality**: [Code Review Guidelines](./../.github/instructions/code-review-generic.instructions.md)
- **Security**: [Security & OWASP](./../.github/instructions/security-and-owasp.instructions.md)

### By Layer

- **Domain Layer** (`core/**/models`): [DDD Architecture](./../.github/instructions/ddd-architecture.instructions.md#domain-layer)
- **Application Layer** (`core/**/stores`): [NgRx Signals Patterns](./../.github/instructions/ngrx-signals.instructions.md)
- **Infrastructure Layer** (`core/**/services`): [Firebase Integration](./../.github/instructions/firebase-integration.instructions.md)
- **Interface Layer** (`features/**`): [Angular Instructions](./../.github/instructions/angular.instructions.md)

### By File Type

- **TypeScript Files**: [TypeScript Standards](./../.github/instructions/typescript-5-es2022.instructions.md)
- **Angular Components**: [Angular Instructions](./../.github/instructions/angular.instructions.md)
- **Store Files**: [NgRx Signals](./../.github/instructions/ngrx-signals.instructions.md)
- **Service Files**: [Firebase Integration](./../.github/instructions/firebase-integration.instructions.md)
- **GitHub Actions**: [CI/CD Best Practices](./../.github/instructions/github-actions-ci-cd-best-practices.instructions.md)

## 📝 Contributing

When adding or updating documentation:

1. Follow the [Documentation Update Guidelines](./../.github/instructions/update-docs-on-code-change.instructions.md)
2. Maintain consistency with existing structure
3. Update this index if adding new major sections
4. Keep cross-references current

## 🆘 Getting Help

- **Architecture Questions**: Start with [Architecture Overview](./architecture/01-overview.md)
- **Implementation Guidance**: Check [Instruction Files](./../.github/instructions/README.md)
- **Code Examples**: Look for patterns in instruction files
- **Troubleshooting**: See [README Troubleshooting](../README.md#-troubleshooting)

---

**Last Updated**: 2026-01-16  
**Version**: 1.0.0  
**Maintainer**: Project Team
