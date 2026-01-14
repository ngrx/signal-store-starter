# Domain Structure Documentation

This document describes the domain-driven architecture implemented according to the PRD specifications.

## Architecture Overview

The application follows a clean domain-driven design with the following core entities:

```
Account → Workspace → Module → Entity
Who → Where → What → State
```

## Core Domains

### 1. Account (Identity Layer)

**Location**: `src/app/core/account/`

**Purpose**: Manages identity across different account types

**Types**:
- `UserAccount`: Individual users
- `OrganizationAccount`: Organizations
- `BotAccount`: Service accounts
- `SubUnitAccount`: Teams and Partners

**Integrates with**: `@angular/fire/auth` for authentication, tokens, sessions, and claims

### 2. Organization

**Location**: `src/app/core/organization/`

**Purpose**: Manages organizational entities

**Key Features**:
- Organization settings and preferences
- Member management
- Feature toggles
- Branding configuration

**Integrates with**: `@angular/fire/firestore`

**Store**: `OrganizationStore` (NgRx Signals)
**Service**: `OrganizationService` (Firestore CRUD)

### 3. Team (SubUnit - Internal)

**Location**: `src/app/core/team/`

**Purpose**: Internal collaboration units within organizations

**Key Features**:
- Team creation and management
- Member roles (lead, member)
- Visibility controls (public, private, secret)
- Workspace permissions

**Integrates with**: `@angular/fire/firestore`

**Store**: `TeamStore` (NgRx Signals)
**Service**: `TeamService` (Firestore CRUD)

### 4. Partner (SubUnit - External)

**Location**: `src/app/core/partner/`

**Purpose**: External collaboration entities

**Key Features**:
- Partner organization management
- Webhook integration
- API access control
- Permission management

**Integrates with**: `@angular/fire/firestore`

**Store**: `PartnerStore` (NgRx Signals)
**Service**: `PartnerService` (Firestore CRUD)

### 5. Workspace (Logical Container)

**Location**: `src/app/core/workspace/`

**Purpose**: LogicalContainer for resources, permissions, modules, and shared context

**Modules Available**:
- `overview`: Workspace summary, dashboard, health, usage
- `documents`: Content management (files, versions, permissions)
- `tasks`: Work management (tasks, workflows, status)
- `members`: Identity mapping (users, teams, partners, roles)
- `permissions`: Access control (roles, policies, scope)
- `audit`: Traceability (audit logs, compliance, history)
- `settings`: Configuration (preferences, feature flags, quota)
- `journal`: Event journal (activity, timeline, changelog)

**Integrates with**: `@angular/fire/firestore`

**Store**: `WorkspaceStore` (NgRx Signals)
**Service**: `WorkspaceService` (Firestore CRUD)

## State Management

All domains use **NgRx Signals** for reactive state management following these principles:

### Pattern

```typescript
export const DomainStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ signals }) => ({
    // Computed signals for derived state
  })),
  withMethods((store) => ({
    // Methods for state updates
  }))
);
```

### NgRx Rules (from PRD)

✅ **DO**:
- Use NgRx Signals for all state management
- Use `@ngrx/operators` for pure reactive composition
- Keep stores single-purpose (one domain per store)
- Use computed signals for derived state

❌ **DON'T**:
- Use component I/O for state
- Add side effects to reducers
- Access state across modules directly
- Mutate store directly
- Create circular feature dependencies

## Service Layer

Each domain has a dedicated service for Firebase Firestore operations:

### Service Responsibilities

- **CRUD Operations**: Create, Read, Update, Delete
- **Query Operations**: Filter, sort, paginate
- **Observable Patterns**: Return RxJS Observables
- **Error Handling**: Catch and transform Firebase errors

### Example Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class DomainService {
  private firestore = inject(Firestore);
  private collectionName = 'collection-name';

  get(id: string): Observable<Domain | null> { }
  list(filters): Observable<Domain[]> { }
  create(data): Observable<string> { }
  update(id, data): Observable<void> { }
  delete(id): Observable<void> { }
}
```

## Avatar System

**Location**: `src/app/shared/services/avatar.service.ts`

The application uses GitHub-style identicon avatars generated from user email addresses.

### AvatarService

```typescript
getAvatarUrl(email: string, size: number = 80): string
```

**Features**:
- MD5 hash of email for consistent avatars
- Gravatar integration with identicon fallback
- Pixel-based geometric patterns
- Customizable size

**Usage**:
```typescript
const avatarUrl = avatarService.getAvatarUrl('user@example.com', 80);
```

## Authentication Flow

**Store**: `AuthStore` (in `src/app/core/auth/`)

**Features**:
- Login with email/password
- User registration
- Password reset
- Logout
- Session persistence

**Computed Signals**:
- `isAuthenticated()`
- `isLoading()`
- `isUnauthenticated()`

## Import Paths

Use the centralized index for clean imports:

```typescript
// Good
import { OrganizationStore, TeamService } from '@app/core';

// Also acceptable
import { OrganizationStore } from '@app/core/organization';
```

## Single Responsibility & Separation of Concerns

### Auth Responsibilities

1. **AuthService**: Firebase Auth integration only
   - Login, register, logout, password reset
   - Observable auth state stream
   - No business logic

2. **AuthStore**: Reactive state management only
   - User state
   - Loading/error states
   - Computed authentication status
   - No UI logic

3. **AuthGuard**: Route protection only
   - Check authentication status
   - Redirect logic
   - No state modification

4. **Auth Components**: UI presentation only
   - Form handling
   - User interaction
   - No direct Firebase calls
   - No state mutations

### Domain Responsibilities

Each domain follows the same pattern:

- **Models**: Type definitions only
- **Services**: Data access only (Firestore CRUD)
- **Stores**: State management only (NgRx Signals)
- **Components**: UI presentation only

## Next Steps

### Immediate Tasks
1. ✅ Account, Organization, Team, Partner, Workspace models created
2. ✅ NgRx Signal stores for each domain
3. ✅ Firestore services for CRUD operations
4. ✅ GitHub-style MD5 pixel avatars implemented

### Future Development
1. Implement workspace modules (documents, tasks, members, etc.)
2. Add permission system with role-based access control
3. Build event bus for cross-module communication
4. Implement audit logging system
5. Create workspace dashboard with analytics

## File Structure

```
src/app/
├── core/
│   ├── account/
│   │   ├── models/
│   │   │   └── account.model.ts
│   │   └── stores/
│   │       └── account.state.ts
│   ├── auth/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── stores/
│   │       ├── auth.state.ts
│   │       └── auth.store.ts
│   ├── organization/
│   │   ├── models/
│   │   │   └── organization.model.ts
│   │   ├── services/
│   │   │   └── organization.service.ts
│   │   └── stores/
│   │       ├── organization.state.ts
│   │       └── organization.store.ts
│   ├── team/
│   │   ├── models/
│   │   │   └── team.model.ts
│   │   ├── services/
│   │   │   └── team.service.ts
│   │   └── stores/
│   │       ├── team.state.ts
│   │       └── team.store.ts
│   ├── partner/
│   │   ├── models/
│   │   │   └── partner.model.ts
│   │   ├── services/
│   │   │   └── partner.service.ts
│   │   └── stores/
│   │       ├── partner.state.ts
│   │       └── partner.store.ts
│   ├── workspace/
│   │   ├── models/
│   │   │   └── workspace.model.ts
│   │   ├── services/
│   │   │   └── workspace.service.ts
│   │   └── stores/
│   │       ├── workspace.state.ts
│   │       └── workspace.store.ts
│   └── index.ts
├── features/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   └── dashboard/
└── shared/
    ├── components/
    │   └── header/
    └── services/
        └── avatar.service.ts
```

## References

- PRD: `docs/prd.md`
- NgRx Signals: https://ngrx.io/guide/signals
- Angular Fire: https://github.com/angular/angularfire
