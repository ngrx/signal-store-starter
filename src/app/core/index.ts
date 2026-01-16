// Core domain exports for easy importing

// GlobalShell - Root level stores
export * from './global-shell/models/config.model';
export * from './global-shell/models/layout.model';
export * from './global-shell/models/router.model';
export * from './global-shell/state/config.state';
export * from './global-shell/state/layout.state';
export * from './global-shell/state/router.state';
export * from './global-shell/stores/config.store';
export * from './global-shell/stores/layout.store';
export * from './global-shell/stores/router.store';

// WorkspaceList - Account level store
export * from './workspace-list/models/workspace-list.model';
export * from './workspace-list/state/workspace-list.state';
export * from './workspace-list/stores/workspace-list.store';
export * from './workspace-list/services/workspace-list.service';

// Account
export * from './account/models/account.model';
export * from './account/stores/account.state';

// Context
export * from './context/models/context.model';
export * from './context/stores/context.state';
export * from './context/stores/context.store';

// Organization
export * from './organization/models/organization.model';
export * from './organization/stores/organization.state';
export * from './organization/stores/organization.store';
export * from './organization/services/organization.service';

// Team
export * from './team/models/team.model';
export * from './team/stores/team.state';
export * from './team/stores/team.store';
export * from './team/services/team.service';

// Partner
export * from './partner/models/partner.model';
export * from './partner/stores/partner.state';
export * from './partner/stores/partner.store';
export * from './partner/services/partner.service';

// Project
export * from './project/models/project.model';
export * from './project/stores/project.store';
export * from './project/services/project.service';

// Workspace
export * from './workspace/models/workspace.model';
export * from './workspace/state/workspace.state';
export * from './workspace/stores/workspace.store';
export * from './workspace/services/workspace.service';

// Auth
export * from './auth/state/auth.state';
export * from './auth/stores/auth.store';
export * from './auth/services/auth.service';
export * from './auth/guards/auth.guard';

// Event Bus
export * from './event-bus/models/event-bus.model';
export * from './event-bus/stores/event-bus.store';

// Modules Registry
export * from './modules/models/workspace-module.model';
export * from './modules/stores/module.store';

// Workspace Feature Stores
export * from './workspace/models/task.model';
export * from './workspace/state/task.state';
export * from './workspace/stores/task.store';
export * from './workspace/services/task.service';

export * from './workspace/models/overview.model';
export * from './workspace/state/overview.state';
export * from './workspace/stores/overview.store';
export * from './workspace/services/overview.service';

// Members models - explicit exports to avoid WorkspaceMember conflict with workspace.model
export {
  WorkspaceMember as DetailedWorkspaceMember,
  MembershipRole,
  MembershipStatus,
  WorkspaceInvitation,
  MemberOnboarding,
  OnboardingStep
} from './workspace/models/members.model';
export * from './workspace/state/members.state';
export * from './workspace/stores/members.store';
export * from './workspace/services/members.service';

export * from './workspace/models/document.model';
export * from './workspace/state/document.state';
export * from './workspace/stores/document.store';
export * from './workspace/services/document.service';

export * from './workspace/models/audit.model';
export * from './workspace/state/audit.state';
export * from './workspace/stores/audit.store';
export * from './workspace/services/audit-log.service';

// Journal - explicit exports to avoid JournalEntry conflict
export { JournalEntry as JournalEntryModel, JournalFilter } from './workspace/models/journal.model';
export * from './workspace/state/journal.state';
export * from './workspace/stores/journal.store';

export * from './workspace/models/permission.model';
export * from './workspace/state/permission.state';
export * from './workspace/stores/permission.store';

// Settings - explicit exports to avoid WorkspaceSettings conflict
export {
  WorkspaceSettings as WorkspaceSettingsModel,
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  IntegrationSettings
} from './workspace/models/settings.model';
export * from './workspace/state/settings.state';
export * from './workspace/stores/settings.store';