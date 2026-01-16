# GlobalShell Architecture

GlobalShell is the root-level store layer that manages application-wide state and provides cross-workspace functionality.

## Overview

According to `docs/prd-sup.md`, GlobalShell contains:

```
GlobalShell = RootLevelStore (Auth | Config | Layout | Router | WorkspaceList)
```

## Components

### 1. AuthStore (`src/app/core/auth/stores/auth.store.ts`)

Manages authentication state with Firebase Auth.

**Signals:**
- `user` - Current authenticated user
- `status` - Authentication status (loading | authenticated | unauthenticated)
- `error` - Error message if authentication fails

**Computed:**
- `isAuthenticated` - Boolean flag for auth status
- `isLoading` - Boolean flag for loading state
- `isUnauthenticated` - Boolean flag for unauthenticated state

**Methods:**
- `login(credentials)` - Authenticate user
- `register(credentials)` - Create new account
- `logout()` - Sign out user
- `resetPassword(email)` - Send password reset email
- `verifyEmail()` - Send verification email

### 2. ConfigStore (`src/app/core/global-shell/stores/config.store.ts`)

Manages application configuration and feature flags.

**Signals:**
- `appConfig` - Application configuration
- `remoteConfig` - Remote configuration from Firebase
- `loading` - Loading state
- `error` - Error message

**Computed:**
- `featureFlags` - All feature flags
- `isAuditEnabled`, `isDocumentsEnabled`, etc. - Individual feature checks
- `isMaintenanceMode` - Maintenance mode status
- `maxWorkspaces` - Workspace quota
- `environment` - Current environment (dev/staging/prod)
- `appVersion` - Application version

**Methods:**
- `loadRemoteConfig()` - Fetch remote configuration
- `setAppConfig(config)` - Set app configuration
- `setRemoteConfig(config)` - Set remote configuration
- `updateFeatureFlags(flags)` - Update feature flags

### 3. LayoutStore (`src/app/core/global-shell/stores/layout.store.ts`)

Manages UI layout preferences and theme.

**Signals:**
- `config` - Layout configuration
- `preferences` - User preferences
- `isAnimating` - Animation state

**Computed:**
- `layoutMode` - Current layout mode (default | compact | comfortable | spacious)
- `theme` - Current theme (light | dark | auto)
- `sidebarState` - Sidebar state (expanded | collapsed | hidden)
- `isSidebarExpanded`, `isSidebarCollapsed`, `isSidebarHidden` - Sidebar flags
- `isDarkMode`, `isLightMode`, `isAutoTheme` - Theme flags

**Methods:**
- `setTheme(theme)` - Set theme
- `toggleTheme()` - Toggle between light/dark
- `setSidebarState(state)` - Set sidebar state
- `toggleSidebar()` - Toggle sidebar
- `setLayoutMode(mode)` - Set layout mode
- `resetLayout()` - Reset to defaults

**Persistence:**
- Automatically persists preferences to localStorage
- Restores preferences on app initialization

### 4. RouterStore (`src/app/core/global-shell/stores/router.store.ts`)

Tracks navigation state and routing information.

**Signals:**
- `currentRoute` - Current route information
- `previousRoute` - Previous route
- `navigationHistory` - History of navigations
- `isNavigating` - Navigation in progress flag

**Computed:**
- `currentPath` - Current route path
- `currentUrl` - Current full URL
- `routeParams` - Route parameters
- `queryParams` - Query parameters
- `routeFragment` - URL fragment
- `canGoBack` - Whether back navigation is possible

**Methods:**
- `navigate(path)` - Navigate to path
- `navigateByUrl(url)` - Navigate to URL
- `back()` - Navigate back
- `trackNavigation()` - Start tracking navigation events

**Integration:**
- Automatically tracks Angular Router events
- Maintains navigation history (last 50 routes)

### 5. WorkspaceListStore (`src/app/core/workspace-list/stores/workspace-list.store.ts`)

Manages the collection of all workspaces the user has access to.

**Signals:**
- `workspaces` - All workspaces
- `workspaceById` - Workspace lookup map
- `currentWorkspaceId` - Selected workspace ID
- `recentWorkspaces` - Recently accessed workspaces
- `favoriteWorkspaces` - Favorite workspaces
- `loading` - Loading state
- `error` - Error message

**Computed (per prd-sup.md):**
- `ownedWorkspaces` - Workspaces where user is Owner
- `memberWorkspaces` - Workspaces where user is Admin/Member/Guest
- `archivedWorkspaces` - Archived workspaces
- `activeWorkspaces` - Active workspaces
- `currentWorkspace` - Currently selected workspace
- `recentWorkspacesList` - Last 5 recent workspaces
- `favoriteWorkspacesList` - Favorite workspaces sorted by order

**Methods:**
- `loadWorkspaces()` - Load all workspaces for user
- `createWorkspace(workspace)` - Create new workspace
- `archiveWorkspace(id)` - Archive workspace
- `leaveWorkspace(id)` - Leave workspace
- `selectWorkspace(id)` - Switch to workspace
- `toggleFavorite(id, isFavorite)` - Toggle favorite status

## State Flow

```
Application Start
    ↓
AuthStore.onInit → Load auth state
    ↓
ConfigStore.loadRemoteConfig → Fetch configuration
    ↓
LayoutStore.onInit → Restore user preferences
    ↓
RouterStore.onInit → Start tracking navigation
    ↓
WorkspaceListStore.onInit → Load user's workspaces
    ↓
Ready for user interaction
```

## Cross-Store Dependencies

GlobalShell stores follow these dependency patterns:

1. **AuthStore** → No dependencies (root level)
2. **ConfigStore** → No dependencies (independent)
3. **LayoutStore** → No dependencies (independent)
4. **RouterStore** → Angular Router (platform dependency)
5. **WorkspaceListStore** → AuthStore (requires authenticated user)

## Usage Example

```typescript
import { inject } from '@angular/core';
import { AuthStore } from '@/core/auth/stores/auth.store';
import { ConfigStore } from '@/core/global-shell/stores/config.store';
import { LayoutStore } from '@/core/global-shell/stores/layout.store';
import { WorkspaceListStore } from '@/core/workspace-list/stores/workspace-list.store';

export class AppComponent {
  private authStore = inject(AuthStore);
  private configStore = inject(ConfigStore);
  private layoutStore = inject(LayoutStore);
  private workspaceListStore = inject(WorkspaceListStore);

  // Access computed signals
  isAuthenticated = this.authStore.isAuthenticated;
  theme = this.layoutStore.theme;
  currentWorkspace = this.workspaceListStore.currentWorkspace;
  isMaintenanceMode = this.configStore.isMaintenanceMode;

  // Call methods
  toggleTheme() {
    this.layoutStore.toggleTheme();
  }

  selectWorkspace(id: string) {
    this.workspaceListStore.selectWorkspace(id);
  }
}
```

## Architecture Compliance

This implementation follows the specifications in `docs/prd-sup.md`:

✅ Pure reactive patterns using NgRx Signals
✅ `rxMethod` for async operations
✅ `computed` signals for derived state
✅ `patchState` for immutable updates
✅ Zone-less compatible architecture
✅ Proper dependency injection
✅ Cross-store communication via signals

## References

- [prd-sup.md](../../../docs/prd-sup.md) - Complete architecture specification
- [NgRx Signals Documentation](https://ngrx.io/guide/signals)
