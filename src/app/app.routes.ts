import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { workspaceContextGuard } from './core/workspace/guards/workspace-context.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/account/auth').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/account/auth').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/account/auth').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/account/auth').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/account/auth').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'workspace',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.MyWorkspaceComponent),
      },
      {
        path: 'my',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: ':workspaceId',
        canActivate: [workspaceContextGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'overview',
          },
          {
            path: 'overview',
            loadComponent: () =>
              import('./features/modules/overview').then(
                (m) => m.OverviewComponent
              ),
          },
          {
            path: 'documents',
            loadComponent: () =>
              import('./features/modules/documents').then(
                (m) => m.DocumentsComponent
              ),
          },
          {
            path: 'tasks',
            loadComponent: () =>
              import('./features/modules/tasks').then((m) => m.TasksComponent),
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./features/modules/members').then(
                (m) => m.MembersComponent
              ),
          },
          {
            path: 'permissions',
            loadComponent: () =>
              import('./features/modules/permissions').then(
                (m) => m.PermissionsComponent
              ),
          },
          {
            path: 'audit',
            loadComponent: () =>
              import('./features/modules/audit').then((m) => m.AuditComponent),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/modules/settings').then(
                (m) => m.WorkspaceSettingsComponent
              ),
          },
          {
            path: 'journal',
            loadComponent: () =>
              import('./features/modules/journal').then(
                (m) => m.JournalComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account').then((m) => m.AccountProfileComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account').then((m) => m.AccountSettingsComponent),
  },
  {
    path: 'logout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/auth').then((m) => m.LogoutComponent),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
