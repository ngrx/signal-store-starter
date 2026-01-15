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
      import('./features/account/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/account/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/account/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/account/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/account/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'workspace',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/workspace/my/my-workspace.component').then(
            (m) => m.MyWorkspaceComponent
          ),
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
              import('./features/modules/overview/overview.component').then(
                (m) => m.OverviewComponent
              ),
          },
          {
            path: 'documents',
            loadComponent: () =>
              import('./features/modules/documents/documents.component').then(
                (m) => m.DocumentsComponent
              ),
          },
          {
            path: 'tasks',
            loadComponent: () =>
              import('./features/modules/tasks/tasks.component').then(
                (m) => m.TasksComponent
              ),
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./features/modules/members/members.component').then(
                (m) => m.MembersComponent
              ),
          },
          {
            path: 'permissions',
            loadComponent: () =>
              import('./features/modules/permissions/permissions.component').then(
                (m) => m.PermissionsComponent
              ),
          },
          {
            path: 'audit',
            loadComponent: () =>
              import('./features/modules/audit/audit.component').then(
                (m) => m.AuditComponent
              ),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/modules/settings/settings.component').then(
                (m) => m.SettingsComponent
              ),
          },
          {
            path: 'journal',
            loadComponent: () =>
              import('./features/modules/journal/journal.component').then(
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
      import('./features/account/profile/profile.component').then(
        (m) => m.AccountProfileComponent
      ),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },
  {
    path: 'logout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/auth/logout/logout.component').then(
        (m) => m.LogoutComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
