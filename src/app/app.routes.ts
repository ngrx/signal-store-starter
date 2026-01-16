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
  // Account Management Routes
  {
    path: 'account',
    canActivate: [authGuard],
    children: [
      // Create Account Entities
      {
        path: 'create/organization',
        loadComponent: () =>
          import('./features/account/create').then((m) => m.CreateOrganizationComponent),
      },
      {
        path: 'create/team',
        loadComponent: () =>
          import('./features/account/create').then((m) => m.CreateTeamComponent),
      },
      {
        path: 'create/partner',
        loadComponent: () =>
          import('./features/account/create').then((m) => m.CreatePartnerComponent),
      },
      {
        path: 'create/bot',
        loadComponent: () =>
          import('./features/account/create').then((m) => m.CreateBotComponent),
      },
      // Manage Account Entities
      {
        path: 'manage/organization/:id/edit',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.EditOrganizationComponent),
      },
      {
        path: 'manage/organization/:id/delete',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.DeleteOrganizationComponent),
      },
      {
        path: 'manage/team/:id/edit',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.EditTeamComponent),
      },
      {
        path: 'manage/team/:id/delete',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.DeleteTeamComponent),
      },
      {
        path: 'manage/partner/:id/edit',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.EditPartnerComponent),
      },
      {
        path: 'manage/partner/:id/delete',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.DeletePartnerComponent),
      },
      {
        path: 'manage/bot/:id/edit',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.EditBotComponent),
      },
      {
        path: 'manage/bot/:id/delete',
        loadComponent: () =>
          import('./features/account/manage').then((m) => m.DeleteBotComponent),
      },
    ],
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
      // Workspace Type CRUD
      {
        path: 'create/project',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.CreateProjectComponent),
      },
      {
        path: 'edit/project/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.EditProjectComponent),
      },
      {
        path: 'delete/project/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.DeleteProjectComponent),
      },
      {
        path: 'create/department',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.CreateDepartmentComponent),
      },
      {
        path: 'edit/department/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.EditDepartmentComponent),
      },
      {
        path: 'delete/department/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.DeleteDepartmentComponent),
      },
      {
        path: 'create/client',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.CreateClientComponent),
      },
      {
        path: 'edit/client/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.EditClientComponent),
      },
      {
        path: 'delete/client/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.DeleteClientComponent),
      },
      {
        path: 'create/campaign',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.CreateCampaignComponent),
      },
      {
        path: 'edit/campaign/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.EditCampaignComponent),
      },
      {
        path: 'delete/campaign/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.DeleteCampaignComponent),
      },
      {
        path: 'create/product',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.CreateProductComponent),
      },
      {
        path: 'edit/product/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.EditProductComponent),
      },
      {
        path: 'delete/product/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.DeleteProductComponent),
      },
      {
        path: 'create/internal',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.CreateInternalComponent),
      },
      {
        path: 'edit/internal/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.EditInternalComponent),
      },
      {
        path: 'delete/internal/:id',
        loadComponent: () =>
          import('./features/workspace').then((m) => m.DeleteInternalComponent),
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
          // Documents Module with CRUD
          {
            path: 'documents',
            loadComponent: () =>
              import('./features/modules/documents').then(
                (m) => m.DocumentsComponent
              ),
          },
          {
            path: 'documents/create',
            loadComponent: () =>
              import('./features/entities/document').then((m) => m.CreateDocumentComponent),
          },
          {
            path: 'documents/:id/edit',
            loadComponent: () =>
              import('./features/entities/document').then((m) => m.EditDocumentComponent),
          },
          {
            path: 'documents/:id/delete',
            loadComponent: () =>
              import('./features/entities/document').then((m) => m.DeleteDocumentComponent),
          },
          // Tasks Module with CRUD
          {
            path: 'tasks',
            loadComponent: () =>
              import('./features/modules/tasks').then((m) => m.TasksComponent),
          },
          {
            path: 'tasks/create',
            loadComponent: () =>
              import('./features/entities/task').then((m) => m.CreateTaskComponent),
          },
          {
            path: 'tasks/:id/edit',
            loadComponent: () =>
              import('./features/entities/task').then((m) => m.EditTaskComponent),
          },
          {
            path: 'tasks/:id/delete',
            loadComponent: () =>
              import('./features/entities/task').then((m) => m.DeleteTaskComponent),
          },
          // Members Module with CRUD
          {
            path: 'members',
            loadComponent: () =>
              import('./features/modules/members').then(
                (m) => m.MembersComponent
              ),
          },
          {
            path: 'members/create',
            loadComponent: () =>
              import('./features/entities/member').then((m) => m.CreateMemberComponent),
          },
          {
            path: 'members/:id/edit',
            loadComponent: () =>
              import('./features/entities/member').then((m) => m.EditMemberComponent),
          },
          {
            path: 'members/:id/delete',
            loadComponent: () =>
              import('./features/entities/member').then((m) => m.DeleteMemberComponent),
          },
          // Permissions Module with CRUD
          {
            path: 'permissions',
            loadComponent: () =>
              import('./features/modules/permissions').then(
                (m) => m.PermissionsComponent
              ),
          },
          {
            path: 'permissions/create',
            loadComponent: () =>
              import('./features/entities/permission').then((m) => m.CreatePermissionComponent),
          },
          {
            path: 'permissions/:id/edit',
            loadComponent: () =>
              import('./features/entities/permission').then((m) => m.EditPermissionComponent),
          },
          {
            path: 'permissions/:id/delete',
            loadComponent: () =>
              import('./features/entities/permission').then((m) => m.DeletePermissionComponent),
          },
          // Audit Module with CRUD
          {
            path: 'audit',
            loadComponent: () =>
              import('./features/modules/audit').then((m) => m.AuditComponent),
          },
          {
            path: 'audit/create',
            loadComponent: () =>
              import('./features/entities/audit-log').then((m) => m.CreateAuditLogComponent),
          },
          {
            path: 'audit/:id/edit',
            loadComponent: () =>
              import('./features/entities/audit-log').then((m) => m.EditAuditLogComponent),
          },
          {
            path: 'audit/:id/delete',
            loadComponent: () =>
              import('./features/entities/audit-log').then((m) => m.DeleteAuditLogComponent),
          },
          // Settings Module with CRUD
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/modules/settings').then(
                (m) => m.WorkspaceSettingsComponent
              ),
          },
          {
            path: 'settings/create',
            loadComponent: () =>
              import('./features/entities/setting').then((m) => m.CreateSettingComponent),
          },
          {
            path: 'settings/:id/edit',
            loadComponent: () =>
              import('./features/entities/setting').then((m) => m.EditSettingComponent),
          },
          {
            path: 'settings/:id/delete',
            loadComponent: () =>
              import('./features/entities/setting').then((m) => m.DeleteSettingComponent),
          },
          // Journal Module with CRUD
          {
            path: 'journal',
            loadComponent: () =>
              import('./features/modules/journal').then(
                (m) => m.JournalComponent
              ),
          },
          {
            path: 'journal/create',
            loadComponent: () =>
              import('./features/entities/journal-entry').then((m) => m.CreateJournalEntryComponent),
          },
          {
            path: 'journal/:id/edit',
            loadComponent: () =>
              import('./features/entities/journal-entry').then((m) => m.EditJournalEntryComponent),
          },
          {
            path: 'journal/:id/delete',
            loadComponent: () =>
              import('./features/entities/journal-entry').then((m) => m.DeleteJournalEntryComponent),
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
