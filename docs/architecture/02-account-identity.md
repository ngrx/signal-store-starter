# Account & Identity Layer

## Overview

The Account layer defines "WHO" is acting in the system. It handles identity management, authentication, authorization, and account relationships.

## Account Types

### Account Definition

```
Account = Identity (User | Organization | Bot | SubUnit)
  → @angular/fire/auth (Authentication | Token | Session | Claims)
```

**AccountType**
- `User` - Individual account
- `Organization` - Collective account
- `Bot` - Automated account
- `SubUnit` - Delegated account (Team or Partner)

### User (Individual Account)

```
User = IndividualAccount (Email | Profile | Preferences)
```

**Properties**
- `email` - Primary identifier
- `profile` - Name, avatar, bio
- `preferences` - UI settings, notifications

**Use Cases**
- Personal workspace owner
- Team member
- Organization member
- Guest collaborator

### Organization (Collective Account)

```
Organization = CollectiveAccount (Domain | Branding | BillingEntity)
```

**Properties**
- `domain` - Email domain for auto-join
- `branding` - Logo, colors, theme
- `billingEntity` - Payment information

**Use Cases**
- Company or enterprise
- Contains teams and partners
- Owns workspaces
- Manages billing

### Bot (Automated Account)

```
Bot = AutomatedAccount (ApiKey | Webhook | ServiceAccount)
```

**Properties**
- `apiKey` - API authentication
- `webhook` - Event notification endpoint
- `serviceAccount` - Firebase service account

**Use Cases**
- Automated integrations
- CI/CD pipelines
- Third-party services
- Scheduled tasks

### SubUnit (Delegated Account)

```
SubUnit = DelegatedAccount (Team | Partner)
```

**Team** (Internal SubUnit)
```
Team = SubUnit (Internal | Collaborative | Hierarchical)
  → @angular/fire/firestore (Collection | Query | SecurityRule)
```

**Properties**
- `parentOrgId` - Parent organization reference
- `type` - Internal, Collaborative, Hierarchical
- `members[]` - Team member list
- `permissions` - Inherited and custom permissions

**Use Cases**
- Department within organization
- Project team
- Working group
- Cross-functional team

**Partner** (External SubUnit)
```
Partner = SubUnit (External | Contractual | LimitedAccess)
  → @angular/fire/firestore (Collection | WebhookBinding | AccessRule)
```

**Properties**
- `parentOrgId` - Sponsoring organization
- `contractInfo` - Partnership terms
- `accessRules` - Restricted permissions
- `webhookBinding` - Integration endpoints

**Use Cases**
- External vendor
- Client access
- Contractor team
- Third-party integration

## Account Relationships

### Membership Model

```
AccountRelation = Membership (Account ↔ Workspace | Role | JoinedAt | Status)

WorkspaceMembership = Relationship (
  AccountId | WorkspaceId | Role | Permissions | InvitedBy | JoinedAt
)
```

**MembershipRole**
- `Owner` - Full control, billing
- `Admin` - Manage workspace, invite members
- `Member` - Standard access to workspace features
- `Guest` - Limited, read-only or specific access
- `Bot` - Automated access

**MembershipStatus**
- `Active` - Current member
- `Invited` - Pending invitation acceptance
- `Suspended` - Temporarily disabled
- `Archived` - Historical record

### Relationship Types

**User ↔ Workspace**
- Direct membership
- Role assignment
- Permission grants

**Organization ↔ Workspace**
- Organization-owned workspace
- All org members have access
- Org-level permissions

**Team ↔ Workspace**
- Team assigned to workspace
- Team members inherit access
- Team-level permissions

**Partner ↔ Workspace**
- External collaboration
- Limited access scope
- Contract-based permissions

## Authentication & Authorization

### Firebase Auth Integration

**Authentication**
```typescript
// Auth service wrapper
@angular/fire/auth
├─ signInWithEmailAndPassword()
├─ signInWithPopup(GoogleAuthProvider)
├─ signOut()
├─ onAuthStateChanged()
└─ currentUser
```

**Custom Claims**
```typescript
interface UserClaims {
  accountType: 'user' | 'organization' | 'team' | 'partner' | 'bot';
  orgId?: string;
  teamId?: string;
  partnerId?: string;
  roles: {
    [workspaceId: string]: 'owner' | 'admin' | 'member' | 'guest' | 'bot';
  };
}
```

**Token Management**
- ID token contains claims
- Token refresh on expiration
- Token validation in guards
- Session persistence

### Authorization Model

**Permission Evaluation**
```
1. Check authentication status
2. Verify account type
3. Evaluate workspace membership
4. Check role permissions
5. Apply permission overrides
6. Enforce access rules
```

**Permission Hierarchy**
```
Account Type
  ↓
Workspace Role
  ↓
Module Permissions
  ↓
Entity Permissions
```

## State Management - AuthStore

### Store Definition

```typescript
export interface AuthState {
  // Authentication
  user: User | null;
  token: string | null;
  claims: UserClaims | null;
  
  // Account context
  accountType: AccountType | null;
  currentAccountId: string | null;
  
  // Organization context (if applicable)
  organizationId: string | null;
  teamId: string | null;
  partnerId: string | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  status: 'unauthenticated' | 'authenticating' | 'authenticated';
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(({ user, status, claims }) => ({
    isAuthenticated: computed(() => status() === 'authenticated'),
    userDisplayName: computed(() => user()?.displayName ?? 'Anonymous'),
    accountType: computed(() => claims()?.accountType ?? 'user'),
    hasOrgContext: computed(() => claims()?.orgId !== undefined),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    // Login methods
    loginWithEmail: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, status: 'authenticating' })),
        switchMap(({ email, password }) => 
          authService.signInWithEmailAndPassword(email, password)
        ),
        tapResponse({
          next: (user) => patchState(store, { 
            user, 
            status: 'authenticated', 
            loading: false 
          }),
          error: (error) => patchState(store, { 
            error: error.message, 
            status: 'unauthenticated',
            loading: false 
          })
        })
      )
    ),
    
    // Logout
    logout: rxMethod<void>(
      pipe(
        switchMap(() => authService.signOut()),
        tapResponse({
          next: () => patchState(store, initialState),
          error: (error) => patchState(store, { error: error.message })
        })
      )
    ),
    
    // Sync auth state
    syncAuthState: rxMethod<void>(
      pipe(
        switchMap(() => authService.onAuthStateChanged()),
        tapResponse({
          next: (user) => {
            if (user) {
              patchState(store, { user, status: 'authenticated' });
            } else {
              patchState(store, initialState);
            }
          },
          error: (error) => patchState(store, { error: error.message })
        })
      )
    )
  }))
);
```

### Usage in Components

```typescript
import { AuthStore } from '@core/auth/stores/auth.store';

@Component({
  selector: 'app-login',
  template: `
    @if (authStore.isAuthenticated()) {
      <p>Welcome, {{ authStore.userDisplayName() }}!</p>
    } @else {
      <form (submit)="login()">
        <!-- Login form -->
      </form>
    }
  `
})
export class LoginComponent {
  authStore = inject(AuthStore);
  
  login() {
    this.authStore.loginWithEmail({ email: '...', password: '...' });
  }
}
```

## Account Discovery & Context

### WorkspaceList Context

When an account authenticates, the system needs to discover available workspaces:

```
Account.authenticate()
  ↓
Load WorkspaceList
  ↓
Filter by AccountType:
  - User: Personal + Member workspaces
  - Organization: Org-owned + Member workspaces
  - Team: Team-assigned workspaces
  - Partner: Partner-accessible workspaces
  ↓
Display available workspaces
  ↓
User selects workspace
  ↓
Load workspace context
```

### Context Switching

```typescript
// Switch between account contexts
switchToPersonal()      // User context
switchToOrganization()  // Organization context
switchToTeam()         // Team context
switchToPartner()      // Partner context
```

Each context switch:
1. Updates current account ID
2. Refreshes workspace list
3. Reloads permissions
4. Resets workspace-scoped state

## Security Considerations

### Account Protection
- Email verification required
- Password strength enforcement
- Rate limiting on auth attempts
- Session timeout
- Multi-factor authentication (optional)

### Data Isolation
- Account data isolated per account ID
- No cross-account queries
- Firestore security rules enforce boundaries
- Team/Partner access restricted to parent org

### Audit Trail
- Login/logout events logged
- Account creation tracked
- Permission changes recorded
- Suspicious activity flagged

## Firebase Security Rules

```javascript
// Account document access
match /accounts/{accountId} {
  allow read: if request.auth.uid == accountId;
  allow write: if request.auth.uid == accountId;
}

// Organization access
match /organizations/{orgId} {
  allow read: if request.auth.token.orgId == orgId 
              || isMember(orgId);
  allow write: if request.auth.token.orgId == orgId 
               && request.auth.token.role == 'owner';
}

// Team access
match /teams/{teamId} {
  allow read: if request.auth.token.teamId == teamId
              || isOrgAdmin(getParentOrg(teamId));
  allow write: if isOrgAdmin(getParentOrg(teamId));
}

// Partner access
match /partners/{partnerId} {
  allow read: if request.auth.token.partnerId == partnerId
              || isOrgAdmin(getParentOrg(partnerId));
  allow write: if isOrgAdmin(getParentOrg(partnerId));
}
```

## Related Documentation
- [Workspace Layer](./03-workspace.md) - Workspace membership and roles
- [Cross-Cutting Concerns](./06-cross-cutting.md) - Permission system
- [NgRx Signals](./07-ngrx-signals.md) - AuthStore implementation patterns
