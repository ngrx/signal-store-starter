import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
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
        path: 'overview',
        loadComponent: () =>
          import('./features/workspace/overview/overview.component').then(
            (m) => m.OverviewComponent
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/workspace/documents/documents.component').then(
            (m) => m.DocumentsComponent
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/workspace/tasks/tasks.component').then(
            (m) => m.TasksComponent
          ),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./features/workspace/members/members.component').then(
            (m) => m.MembersComponent
          ),
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./features/workspace/permissions/permissions.component').then(
            (m) => m.PermissionsComponent
          ),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/workspace/audit/audit.component').then(
            (m) => m.AuditComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/workspace/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
      {
        path: 'journal',
        loadComponent: () =>
          import('./features/workspace/journal/journal.component').then(
            (m) => m.JournalComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
