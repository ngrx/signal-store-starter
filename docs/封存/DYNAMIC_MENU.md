# Dynamic Menu & Context Switching Implementation

Complete implementation of reactive, context-aware dynamic menu system using Angular 20 + NgRx Signals + @ngrx/operators.

## Architecture Overview

```
User Auth → Context Switch → Menu Computed → UI Updates
    ↓            ↓                ↓              ↓
AuthStore → ContextStore → MenuService → HeaderComponent
```

## Core Components

### 1. Context System

**ContextStore** (`src/app/core/context/stores/context.store.ts`)

Pure NgRx Signals store managing current user context:

```typescript
export const ContextStore = signalStore(
  { providedIn: 'root' },
  withState(initialContextState),
  withComputed(({ current, available }) => ({
    currentContextType: computed(() => current()?.type || null),
    currentContextId: computed(...),
    currentContextName: computed(...),
    hasOrganizations: computed(...),
    canSwitchContext: computed(...),
  })),
  withMethods((store) => ({
    switchContext(context: AppContext): void,
    setAvailableOrganizations(...): void,
    setAvailableTeams(...): void,
    setAvailablePartners(...): void,
    resetContext(): void,
  }))
);
```

**Context Types:**
- `UserContext`: Personal workspace
- `OrganizationContext`: Organization + role (owner/admin/member)
- `TeamContext`: Team + role (lead/member)
- `PartnerContext`: Partner + accessLevel (full/limited/readonly)

**Features:**
- Reactive context switching with history tracking
- Automatically loads available contexts from Firestore on init
- Computed signals for current context metadata
- Type-safe context models

### 2. Menu System

**MenuService** (`src/app/shared/services/menu.service.ts`)

Reactive menu generation based on current context:

```typescript
@Injectable({ providedIn: 'root' })
export class MenuService {
  menu: Signal<DynamicMenu> = computed(() => {
    const context = this.contextStore.current();
    const isAuthenticated = this.authStore.isAuthenticated();
    
    if (!isAuthenticated || !context) {
      return { sections: [] };
    }
    
    return this.buildMenuForContext(context);
  });
}
```

**Menu Sections Generated:**

1. **Context Switcher** (if multiple contexts available)
   - Personal workspace
   - Organizations list
   - Teams list
   - Partners list

2. **Context-Specific Navigation**
   - User: Dashboard, My Tasks, My Documents
   - Organization: Org Dashboard, Teams, Partners
   - Team: Team Dashboard, Members
   - Partner: Partner Dashboard, Integration

3. **Workspace Modules** (for org/team/partner contexts)
   - Overview, Documents, Tasks, Members
   - Permissions, Audit, Settings, Journal

4. **User Section**
   - Profile, Settings, Logout

**Module Visibility & Permissions:**

```typescript
private isModuleVisible(module: WorkspaceModule, context: AppContext): boolean {
  // Organization owners/admins see all modules
  if (context.type === 'organization' && role === 'owner') return true;
  
  // Partners have limited access
  if (context.type === 'partner') {
    const restricted = ['permissions', 'audit', 'settings'];
    return accessLevel === 'full' || !restricted.includes(module);
  }
  
  // Team leads see restricted modules
  if (context.type === 'team') {
    const restricted = ['permissions', 'settings'];
    return role === 'lead' || !restricted.includes(module);
  }
  
  return true;
}
```

### 3. Header Component

**HeaderComponent** (`src/app/shared/components/header/header.component.ts`)

Reactive UI consuming MenuService:

```typescript
export class HeaderComponent {
  protected authStore = inject(AuthStore);
  protected contextStore = inject(ContextStore);
  private menuService = inject(MenuService);
  
  protected dynamicMenu = this.menuService.menu; // Computed signal

  handleMenuItem(item: MenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      item.action();
    }
  }
}
```

**Template Features:**
- Context name in header (instead of static app name)
- Context type badge (USER/ORG/TEAM/PARTNER)
- Dynamic menu sections rendered from signals
- Automatic UI updates on context switch

## Data Flow

### Context Switching Flow

```
1. User clicks context in dropdown
   ↓
2. ContextStore.switchContext(context)
   ↓
3. patchState updates current context
   ↓
4. MenuService.menu computed signal recalculates
   ↓
5. HeaderComponent template auto-updates
   ↓
6. New menu structure displayed
```

### Menu Generation Flow

```
ContextStore.current() change
   ↓
MenuService.menu() recomputed
   ↓
buildMenuForContext(context)
   ↓
buildContextSwitcherSection()
buildOrganizationMenu() / buildTeamMenu() / etc.
buildWorkspaceModulesSection()
buildUserSection()
   ↓
Return DynamicMenu with sections
   ↓
HeaderComponent renders menu items
```

## Workspace Modules

Based on PRD specification:

| Module | Icon | Description | Route Pattern |
|--------|------|-------------|---------------|
| overview | 📊 | Workspace summary, dashboard, health | `/{context}/{id}/overview` |
| documents | 📄 | Content management, files, versions | `/{context}/{id}/documents` |
| tasks | ✓ | Work management, workflows, status | `/{context}/{id}/tasks` |
| members | 👥 | Identity mapping, users, teams | `/{context}/{id}/members` |
| permissions | 🔒 | Access control, roles, policies | `/{context}/{id}/permissions` |
| audit | 📋 | Traceability, audit logs | `/{context}/{id}/audit` |
| settings | ⚙️ | Configuration, preferences | `/{context}/{id}/settings` |
| journal | 📖 | Event journal, activity timeline | `/{context}/{id}/journal` |

## NgRx Signals Compliance

✅ **Pure Reactive Composition**
- All state management uses NgRx Signals
- No traditional Store/Effects/Entity/Router-Store/Component-Store
- No @ngrx/devtools

✅ **Computed Signals for Derived State**
```typescript
menu: Signal<DynamicMenu> = computed(() => {
  const context = this.contextStore.current();
  // Pure computation based on signals
  return this.buildMenuForContext(context);
});
```

✅ **No Component I/O for State**
- Header component uses injected stores and services
- No @Input/@Output for state management

✅ **No Reducer Side Effects**
- withMethods only updates state via patchState
- No async operations in state updates

✅ **No Direct Store Mutation**
- All updates through patchState
- Immutable state updates

✅ **No Circular Dependencies**
- Clear dependency hierarchy: Auth → Context → Menu → UI

## Context Lifecycle

### Initialization (onInit)

```typescript
withHooks({
  onInit(store, authStore, orgService, teamService, partnerService) {
    const user = authStore.user();
    if (user) {
      // 1. Set initial user context
      store.switchContext({
        type: 'user',
        userId: user.uid,
        email: user.email,
      });
      
      // 2. Load available contexts from Firestore
      orgService.list({}).subscribe((orgs) => {
        const orgContexts = orgs.map(...);
        store.setAvailableOrganizations(orgContexts);
      });
      
      // Similar for teams and partners
    }
  }
})
```

### Runtime Context Switch

```typescript
// User clicks organization in menu
menuItem.action = () => {
  contextStore.switchContext({
    type: 'organization',
    organizationId: '123',
    name: 'Acme Corp',
    role: 'admin',
  });
};

// ContextStore updates state
patchState(store, {
  current: context,
  history: [...history, event],
});

// MenuService.menu automatically recalculates
// HeaderComponent automatically re-renders
```

## Permission System

### Role-Based Visibility

```typescript
// Organization context
if (context.type === 'organization') {
  const role = context.role; // 'owner' | 'admin' | 'member'
  
  // Owners/admins see everything
  if (role === 'owner' || role === 'admin') {
    return allModules;
  }
  
  // Members see limited modules
  return memberModules;
}

// Team context
if (context.type === 'team') {
  const role = context.role; // 'lead' | 'member'
  
  // Leads see restricted modules
  if (role === 'lead') {
    return ['permissions', 'settings'];
  }
}

// Partner context
if (context.type === 'partner') {
  const accessLevel = context.accessLevel; // 'full' | 'limited' | 'readonly'
  
  // Full access sees everything
  if (accessLevel === 'full') {
    return allModules;
  }
}
```

### Module-Level Permissions

```typescript
interface MenuItem {
  id: string;
  module?: WorkspaceModule;
  requiredRole?: string[];
  requiredPermission?: string[];
  visible?: boolean;
  disabled?: boolean;
}

// Menu service checks permissions
hasModulePermission(module: WorkspaceModule, context: AppContext): boolean {
  // Real implementation would check against permission service
  return this.isModuleVisible(module, context);
}
```

## Event Bus Integration

### Future Enhancement

```typescript
// Event bus for cross-module communication
export interface ContextSwitchEvent {
  type: ContextType;
  id: string;
  timestamp: number;
}

// Publish context switch events
contextStore.switchContext(context);
eventBus.publish({
  type: 'CONTEXT_SWITCHED',
  payload: { type, id, timestamp },
});

// Modules subscribe to context changes
eventBus.subscribe('CONTEXT_SWITCHED', (event) => {
  // Update module state based on new context
  moduleStore.loadDataForContext(event.payload.id);
});
```

## Testing Strategy

### Context Store Tests

```typescript
describe('ContextStore', () => {
  it('should switch context and update computed signals', () => {
    const orgContext: OrganizationContext = {
      type: 'organization',
      organizationId: '123',
      name: 'Test Org',
      role: 'admin',
    };
    
    contextStore.switchContext(orgContext);
    
    expect(contextStore.currentContextType()).toBe('organization');
    expect(contextStore.currentContextId()).toBe('123');
    expect(contextStore.currentContextName()).toBe('Test Org');
  });
});
```

### Menu Service Tests

```typescript
describe('MenuService', () => {
  it('should generate organization menu for org context', () => {
    contextStore.switchContext(orgContext);
    const menu = menuService.menu();
    
    expect(menu.sections).toContain({
      id: 'organization-menu',
      title: 'Test Org',
    });
  });
  
  it('should hide restricted modules for partner with limited access', () => {
    const partnerContext: PartnerContext = {
      type: 'partner',
      partnerId: '456',
      name: 'Partner Inc',
      accessLevel: 'limited',
    };
    
    contextStore.switchContext(partnerContext);
    const menu = menuService.menu();
    const modulesSection = menu.sections.find(s => s.id === 'workspace-modules');
    const restrictedModules = modulesSection?.items.filter(
      item => ['permissions', 'audit', 'settings'].includes(item.module)
    );
    
    expect(restrictedModules.every(m => m.visible === false)).toBe(true);
  });
});
```

## File Structure

```
src/app/
├── core/
│   ├── context/
│   │   ├── models/
│   │   │   └── context.model.ts          # Context type definitions
│   │   └── stores/
│   │       ├── context.state.ts          # Initial state
│   │       └── context.store.ts          # NgRx Signal store
│   ├── auth/
│   ├── organization/
│   ├── team/
│   ├── partner/
│   └── workspace/
├── shared/
│   ├── models/
│   │   └── menu.model.ts                 # Menu type definitions
│   ├── services/
│   │   ├── menu.service.ts               # Dynamic menu service
│   │   └── avatar.service.ts
│   └── components/
│       └── header/
│           └── header.component.ts       # Reactive header with menu
└── features/
```

## Migration Path

### From Static Menu to Dynamic Menu

**Before:**
```typescript
// Static navigation
<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/projects">Projects</a>
  <a routerLink="/team">Team</a>
</nav>
```

**After:**
```typescript
// Dynamic, context-aware menu
@for (section of dynamicMenu().sections; track section.id) {
  @for (item of section.items; track item.id) {
    <button (click)="handleMenuItem(item)">
      {{ item.icon }} {{ item.label }}
    </button>
  }
}
```

## Best Practices

1. **Always use computed signals for menu generation**
   - Menu recalculates automatically on context change
   - No manual subscription management

2. **Keep menu logic in MenuService**
   - Single source of truth for menu structure
   - Centralized permission checks

3. **Use action functions for context switching**
   - Type-safe context switching
   - Automatic menu updates

4. **Leverage context history for navigation**
   - Track context switches
   - Enable "back to previous context" feature

5. **Implement permission checks at module level**
   - Consistent visibility rules
   - Role-based access control

## Performance Considerations

- **Computed signals are memoized**: Menu only recalculates when context changes
- **Lazy loading**: All routes and modules are lazy-loaded
- **Minimal re-renders**: Only affected menu sections update
- **Efficient permission checks**: Cached during menu generation

## Security Considerations

- **Permission checks server-side**: Never trust client-side visibility
- **Context validation**: Verify user has access to switched context
- **Audit context switches**: Track all context changes for compliance
- **Token refresh**: Handle token expiration during context switches

## Future Enhancements

1. **Workspace-Specific Modules**: Load modules dynamically based on workspace configuration
2. **Custom Menu Items**: Allow users to customize menu structure
3. **Breadcrumbs**: Show context hierarchy in navigation
4. **Recent Contexts**: Quick access to recently used contexts
5. **Favorites**: Pin frequently used contexts to top of menu
6. **Search**: Search across all available contexts and modules

## References

- PRD: `docs/prd.md`
- Domain Structure: `DOMAIN_STRUCTURE.md`
- NgRx Signals: https://ngrx.io/guide/signals
- Angular Signals: https://angular.dev/guide/signals
