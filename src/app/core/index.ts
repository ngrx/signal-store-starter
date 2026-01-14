// Core domain exports for easy importing

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

// Workspace
export * from './workspace/models/workspace.model';
export * from './workspace/stores/workspace.state';
export * from './workspace/stores/workspace.store';
export * from './workspace/services/workspace.service';

// Auth
export * from './auth/stores/auth.state';
export * from './auth/stores/auth.store';
export * from './auth/services/auth.service';
export * from './auth/guards/auth.guard';

// Tasks
export * from './tasks/models/task.model';
export * from './tasks/stores/task.state';
export * from './tasks/stores/task.store';
export * from './tasks/services/task.service';
