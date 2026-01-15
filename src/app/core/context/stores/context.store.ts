import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap, catchError, of, combineLatest } from 'rxjs';
import { initialContextState } from './context.state';
import {
  AppContext,
  ContextSwitchEvent,
  OrganizationContext,
  TeamContext,
  PartnerContext,
} from '../models/context.model';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationService } from '../../organization/services/organization.service';
import { TeamService } from '../../team/services/team.service';
import { PartnerService } from '../../partner/services/partner.service';
import { EventBusStore } from '../../event-bus/stores/event-bus.store';
import { Organization, OrganizationSettings } from '../../organization/models/organization.model';
import { Team } from '../../team/models/team.model';
import { Partner } from '../../partner/models/partner.model';
import { WorkspaceStore } from '../../workspace/stores/workspace.store';

const defaultOrganizationSettings: OrganizationSettings = {
  allowPartnerInvitation: true,
  allowTeamCreation: true,
  defaultWorkspaceQuota: 1,
  requireEmailVerification: false,
  features: {
    auditEnabled: true,
    documentsEnabled: true,
    journalEnabled: true,
    tasksEnabled: true,
  },
};

export const ContextStore = signalStore(
  { providedIn: 'root' },
  withState(initialContextState),
  withComputed(({ current, available }) => ({
    currentContextType: computed(() => current()?.type || null),
    currentContextId: computed(() => {
      const ctx = current();
      if (!ctx) return null;
      switch (ctx.type) {
        case 'organization':
          return ctx.organizationId;
        case 'team':
          return ctx.teamId;
        case 'partner':
          return ctx.partnerId;
        case 'user':
          return ctx.userId;
        default:
          return null;
      }
    }),
    currentContextName: computed(() => {
      const ctx = current();
      if (!ctx) return null;
      switch (ctx.type) {
        case 'organization':
        case 'team':
        case 'partner':
          return ctx.name;
        case 'user':
          return ctx.email;
        default:
          return null;
      }
    }),
    hasOrganizations: computed(() => available().organizations.length > 0),
    hasTeams: computed(() => available().teams.length > 0),
    hasPartners: computed(() => available().partners.length > 0),
    canSwitchContext: computed(() => {
      const avail = available();
      return (
        avail.organizations.length > 0 ||
        avail.teams.length > 0 ||
        avail.partners.length > 0
      );
    }),
  })),
  withMethods(
    (
      store,
      authStore = inject(AuthStore),
      orgService = inject(OrganizationService),
      teamService = inject(TeamService),
      partnerService = inject(PartnerService),
      eventBus = inject(EventBusStore),
      workspaceStore = inject(WorkspaceStore)
    ) => {
      const clearContextState = () => {
        patchState(store, initialContextState);
        workspaceStore.clearAll();
      };

      const applySwitchContext = (context: AppContext): void => {
        const event: ContextSwitchEvent = {
          type: context.type,
          id:
            context.type === 'user'
              ? context.userId
              : context.type === 'organization'
              ? context.organizationId
              : context.type === 'team'
              ? context.teamId
              : context.partnerId,
          timestamp: Date.now(),
        };

        patchState(store, {
          current: context,
          history: [...store.history(), event],
        });
        // Keep workspace store in sync so modules resolve current workspace
        const workspaceShape =
          context.type === 'user'
            ? {
                id: context.userId,
                name: context.displayName || context.email,
                description: 'Personal workspace',
                type: 'personal' as const,
              }
            : context.type === 'organization'
            ? {
                id: context.organizationId,
                name: context.name,
                description: 'Organization workspace',
                type: 'organization' as const,
              }
            : context.type === 'team'
            ? {
                id: context.teamId,
                name: context.name,
                description: 'Team workspace',
                type: 'team' as const,
              }
            : {
                id: context.partnerId,
                name: context.name,
                description: 'Partner workspace',
                type: 'partner' as const,
              };
        workspaceStore.upsertWorkspace(workspaceShape as any);
        workspaceStore.setCurrentWorkspace(workspaceShape as any);
        eventBus.emit({
          type: 'context.switched',
          payload: event,
          scope: 'workspace',
          timestamp: Date.now(),
          producer: 'ContextStore',
        });
      };

      const setAvailableOrganizations = (organizations: OrganizationContext[]) =>
        patchState(store, (state) => ({
          available: {
            ...state.available,
            organizations,
          },
        }));

      const setAvailableTeams = (teams: TeamContext[]) =>
        patchState(store, (state) => ({
          available: {
            ...state.available,
            teams,
          },
        }));

      const setAvailablePartners = (partners: PartnerContext[]) =>
        patchState(store, (state) => ({
          available: {
            ...state.available,
            partners,
          },
        }));

      const loadAvailableContexts = rxMethod<void>(
        pipe(
          switchMap(() => {
            const user = authStore.user();
            if (!user) {
              clearContextState();
              return of(null);
            }

            applySwitchContext({
              type: 'user',
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName ?? null,
            });

            return combineLatest([
              orgService.list({ createdBy: user.uid }),
              teamService.list({ createdBy: user.uid }),
              partnerService.list({ createdBy: user.uid }),
            ]);
          }),
          tap((result) => {
            if (result) {
              const [orgs, teams, partners] = result;

              const orgContexts: OrganizationContext[] = orgs.map((org: Organization) => ({
                type: 'organization' as const,
                organizationId: org.id,
                name: org.name,
                role: 'member' as const,
              }));

              const teamContexts: TeamContext[] = teams.map((team: Team) => ({
                type: 'team' as const,
                teamId: team.id,
                organizationId: team.organizationId,
                name: team.name,
                role: 'member' as const,
              }));

              const partnerContexts: PartnerContext[] = partners.map((partner: Partner) => ({
                type: 'partner' as const,
                partnerId: partner.id,
                organizationId: partner.organizationId,
                name: partner.name,
                accessLevel: 'readonly' as const,
              }));

              setAvailableOrganizations(orgContexts);
              setAvailableTeams(teamContexts);
              setAvailablePartners(partnerContexts);
            }
          }),
          catchError((error) => {
            console.error('[ContextStore] Error loading available contexts:', error);
            return of(null);
          })
        )
      );

      const createOrganizationEffect = rxMethod<{ name: string; description?: string }>(
        pipe(
          switchMap((payload) => {
            const user = authStore.user();
            if (!user) {
              console.warn('[ContextStore] Cannot create organization without user');
              return of(null);
            }

            const now = new Date();
            const org: Omit<Organization, 'id'> = {
              name: payload.name,
              displayName: payload.name,
              description: payload.description ?? '',
              createdAt: now,
              updatedAt: now,
              createdBy: user.uid,
              ownerId: user.uid,
              status: 'active',
              settings: defaultOrganizationSettings,
            };

            return orgService.createOrganization(org).pipe(
              tap((organizationId) => {
                if (!organizationId) {
                  eventBus.emit({
                    type: 'context.organization.failed',
                    payload: { name: payload.name, reason: 'missing id' },
                    scope: 'workspace',
                    timestamp: Date.now(),
                    producer: 'ContextStore',
                  });
                  return;
                }
                const orgContext: OrganizationContext = {
                  type: 'organization',
                  organizationId,
                  name: payload.name,
                  role: 'owner',
                };
                setAvailableOrganizations([...store.available().organizations, orgContext]);
                applySwitchContext(orgContext);
                eventBus.emit({
                  type: 'context.organization.created',
                  payload: { organizationId, name: payload.name },
                  scope: 'workspace',
                  timestamp: Date.now(),
                  producer: 'ContextStore',
                });
              }),
              catchError((error) => {
                console.error('[ContextStore] Failed to create organization', error);
                return of(null);
              })
            );
          })
        )
      );

      const createTeamEffect = rxMethod<{ name: string; description?: string; organizationId?: string }>(
        pipe(
          switchMap((payload) => {
            const user = authStore.user();
            if (!user) {
              console.warn('[ContextStore] Cannot create team without user');
              return of(null);
            }
            const currentContext = store.current();
            const organizationId =
              payload.organizationId ||
              (currentContext?.type === 'organization' ? currentContext.organizationId : null);

            if (!organizationId) {
              console.warn('[ContextStore] Team creation requires organization context');
              return of(null);
            }

            const now = new Date();
            const team: Omit<Team, 'id'> = {
              name: payload.name,
              displayName: payload.name,
              description: payload.description ?? '',
              organizationId,
              type: 'internal',
              memberCount: 1,
              visibility: 'private',
              createdAt: now,
              updatedAt: now,
              createdBy: user.uid,
              status: 'active',
            };

            return teamService.createTeam(team).pipe(
              tap((teamId) => {
                if (!teamId) {
                  eventBus.emit({
                    type: 'context.team.failed',
                    payload: { name: payload.name, organizationId, reason: 'missing id' },
                    scope: 'workspace',
                    timestamp: Date.now(),
                    producer: 'ContextStore',
                  });
                  return;
                }
                const teamContext: TeamContext = {
                  type: 'team',
                  teamId,
                  organizationId,
                  name: payload.name,
                  role: 'lead',
                };
                setAvailableTeams([...store.available().teams, teamContext]);
                applySwitchContext(teamContext);
                eventBus.emit({
                  type: 'context.team.created',
                  payload: { teamId, organizationId, name: payload.name },
                  scope: 'workspace',
                  timestamp: Date.now(),
                  producer: 'ContextStore',
                });
              }),
              catchError((error) => {
                console.error('[ContextStore] Failed to create team', error);
                return of(null);
              })
            );
          })
        )
      );

      const createPartnerEffect = rxMethod<{ name: string; description?: string; organizationId?: string }>(
        pipe(
          switchMap((payload) => {
            const user = authStore.user();
            if (!user) {
              console.warn('[ContextStore] Cannot create partner without user');
              return of(null);
            }
            const currentContext = store.current();
            const organizationId =
              payload.organizationId ||
              (currentContext?.type === 'organization' ? currentContext.organizationId : null);

            if (!organizationId) {
              console.warn('[ContextStore] Partner creation requires organization context');
              return of(null);
            }

            const now = new Date();
            const partner: Omit<Partner, 'id'> = {
              name: payload.name,
              displayName: payload.name,
              description: payload.description ?? '',
              organizationId,
              type: 'external',
              accessLevel: 'read',
              createdAt: now,
              updatedAt: now,
              createdBy: user.uid,
              status: 'active',
            };

            return partnerService.createPartner(partner).pipe(
              tap((partnerId) => {
                if (!partnerId) {
                  eventBus.emit({
                    type: 'context.partner.failed',
                    payload: { name: payload.name, organizationId, reason: 'missing id' },
                    scope: 'workspace',
                    timestamp: Date.now(),
                    producer: 'ContextStore',
                  });
                  return;
                }
                const partnerContext: PartnerContext = {
                  type: 'partner',
                  partnerId,
                  organizationId,
                  name: payload.name,
                  accessLevel: 'readonly',
                };
                setAvailablePartners([...store.available().partners, partnerContext]);
                eventBus.emit({
                  type: 'context.partner.created',
                  payload: { partnerId, organizationId, name: payload.name },
                  scope: 'workspace',
                  timestamp: Date.now(),
                  producer: 'ContextStore',
                });
              }),
              catchError((error) => {
                console.error('[ContextStore] Failed to create partner', error);
                return of(null);
              })
            );
          })
        )
      );

      return {
        switchContext: applySwitchContext,
        setAvailableOrganizations,
        setAvailableTeams,
        setAvailablePartners,
        resetContext(): void {
          const user = authStore.user();
          if (user) {
            patchState(store, {
              current: {
                type: 'user',
                userId: user.uid,
                email: user.email || '',
                displayName: user.displayName ?? null,
              },
            });
          } else {
            patchState(store, initialContextState);
          }
        },
        clearContext: clearContextState,
        refreshAvailableContexts(): void {
          loadAvailableContexts();
        },
        createOrganization(payload: { name: string; description?: string }): void {
          createOrganizationEffect(payload);
        },
        createTeam(payload: { name: string; description?: string; organizationId?: string }): void {
          createTeamEffect(payload);
        },
        createPartner(payload: { name: string; description?: string; organizationId?: string }): void {
          createPartnerEffect(payload);
        },
      };
    }
  ),
  withHooks({
    onInit(store) {
      // Trigger loading immediately (handles already-authenticated sessions)
      // This will also react to auth state changes
      store.refreshAvailableContexts();
    },
  })
);
