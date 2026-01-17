import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Type, computed, effect, inject } from '@angular/core';
import { pipe, switchMap, tap, catchError, of, combineLatest } from 'rxjs';
import { initialContextState } from '../state/context.state';
import {
  AppContext,
  ContextState,
  ContextSwitchEvent,
  OrganizationContext,
  TeamContext,
  PartnerContext,
} from '../models/context.model';
import { OrganizationService } from '../../organization/services/organization.service';
import { TeamService } from '../../team/services/team.service';
import { PartnerService } from '../../partner/services/partner.service';
import { EventBusStore } from '../../event-bus/stores/event-bus.store';
import { Organization, OrganizationSettings } from '../../organization/models/organization.model';
import { Team } from '../../team/models/team.model';
import { Partner } from '../../partner/models/partner.model';

export interface ContextStoreInstance {
  current: () => AppContext | null;
  available: () => ContextState['available'];
  history: () => ContextState['history'];
  currentContextType: () => AppContext['type'] | null;
  currentContextId: () => string | null;
  currentContextName: () => string | null;
  currentOrganizationId: () => string | null;
  hasOrganizations: () => boolean;
  hasTeams: () => boolean;
  hasPartners: () => boolean;
  canSwitchContext: () => boolean;
  canNavigateBack: () => boolean;
  teamsInCurrentOrg: () => TeamContext[];
  partnersInCurrentOrg: () => PartnerContext[];
  switchContext: (context: AppContext) => void;
  navigateBack: () => void;
  setAvailableOrganizations: (organizations: OrganizationContext[]) => void;
  setAvailableTeams: (teams: TeamContext[]) => void;
  setAvailablePartners: (partners: PartnerContext[]) => void;
  resetContext: () => void;
  clearContext: () => void;
  refreshAvailableContexts: (userInfo?: { userId: string; email: string; displayName?: string | null }) => void;
  createOrganization: (payload: { name: string; description?: string; userId: string }) => void;
  createTeam: (payload: { name: string; description?: string; organizationId?: string; userId: string }) => void;
  createPartner: (payload: { name: string; description?: string; organizationId?: string; userId: string }) => void;
}

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
    currentOrganizationId: computed(() => {
      const ctx = current();
      if (!ctx) return null;
      switch (ctx.type) {
        case 'organization':
          return ctx.organizationId;
        case 'team':
        case 'partner':
          return ctx.organizationId;
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
    canNavigateBack: computed(() => {
      const ctx = current();
      // Can navigate back if in org/team/partner (not in user context)
      return ctx?.type !== 'user';
    }),
    teamsInCurrentOrg: computed(() => {
      const ctx = current();
      const orgId = ctx?.type === 'organization' ? ctx.organizationId : 
                    ctx?.type === 'team' ? ctx.organizationId :
                    ctx?.type === 'partner' ? ctx.organizationId : null;
      if (!orgId) return [];
      return available().teams.filter(t => t.organizationId === orgId);
    }),
    partnersInCurrentOrg: computed(() => {
      const ctx = current();
      const orgId = ctx?.type === 'organization' ? ctx.organizationId : 
                    ctx?.type === 'team' ? ctx.organizationId :
                    ctx?.type === 'partner' ? ctx.organizationId : null;
      if (!orgId) return [];
      return available().partners.filter(p => p.organizationId === orgId);
    }),
  })),
  withMethods(
    (
      store,
      orgService = inject(OrganizationService),
      teamService = inject(TeamService),
      partnerService = inject(PartnerService),
      eventBus = inject(EventBusStore)
    ) => {
      const clearContextState = () => {
        patchState(store, initialContextState);
        // Emit event instead of directly calling WorkspaceStore
        eventBus.emit({
          type: 'context.cleared',
          payload: { timestamp: Date.now() },
          scope: 'global',
          timestamp: Date.now(),
          producer: 'ContextStore',
        });
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
        // Emit event with full context data for WorkspaceStore to consume
        eventBus.emit({
          type: 'context.switched',
          payload: { 
            event,
            context, // Include full context so WorkspaceStore can create workspace shape
          },
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

      const loadAvailableContexts = rxMethod<{ userId: string; email: string; displayName?: string | null }>(
        pipe(
          switchMap((userInfo) => {
            if (!userInfo) {
              // User logged out - clear context
              clearContextState();
              return of(null);
            }

            applySwitchContext({
              type: 'user',
              userId: userInfo.userId,
              email: userInfo.email,
              displayName: userInfo.displayName ?? null,
            });

            return combineLatest([
              orgService.list({ createdBy: userInfo.userId }),
              teamService.list({ createdBy: userInfo.userId }),
              partnerService.list({ createdBy: userInfo.userId }),
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

      const createOrganizationEffect = rxMethod<{ name: string; description?: string; userId: string }>(
        pipe(
          switchMap((payload) => {
            if (!payload.userId) {
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
              createdBy: payload.userId,
              ownerId: payload.userId,
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

      const createTeamEffect = rxMethod<{ name: string; description?: string; organizationId?: string; userId: string }>(
        pipe(
          switchMap((payload) => {
            if (!payload.userId) {
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
              createdBy: payload.userId,
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

      const createPartnerEffect = rxMethod<{ name: string; description?: string; organizationId?: string; userId: string }>(
        pipe(
          switchMap((payload) => {
            if (!payload.userId) {
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
              createdBy: payload.userId,
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
        navigateBack(): void {
          const ctx = store.current();
          if (!ctx) return;
          
          // Navigate up the hierarchy
          switch (ctx.type) {
            case 'team':
            case 'partner': {
              // Navigate to parent organization
              const orgId = ctx.organizationId;
              const org = store.available().organizations.find(o => o.organizationId === orgId);
              if (org) {
                applySwitchContext(org);
              } else {
                // Fallback to user context if org not found - emit event to get user
                eventBus.emit({
                  type: 'context.request-user-info',
                  payload: {},
                  scope: 'global',
                  timestamp: Date.now(),
                  producer: 'ContextStore',
                });
              }
              break;
            }
            case 'organization': {
              // Navigate to user context - emit event to get user
              eventBus.emit({
                type: 'context.request-user-info',
                payload: {},
                scope: 'global',
                timestamp: Date.now(),
                producer: 'ContextStore',
              });
              break;
            }
            case 'user':
              // Already at top level, do nothing
              break;
          }
        },
        setAvailableOrganizations,
        setAvailableTeams,
        setAvailablePartners,
        resetContext(): void {
          // Emit event to request user info instead of accessing AuthStore
          eventBus.emit({
            type: 'context.request-user-info',
            payload: {},
            scope: 'global',
            timestamp: Date.now(),
            producer: 'ContextStore',
          });
        },
        clearContext: clearContextState,
        refreshAvailableContexts(userInfo?: { userId: string; email: string; displayName?: string | null }): void {
          if (userInfo) {
            loadAvailableContexts(userInfo);
          } else {
            // Request user info via event
            eventBus.emit({
              type: 'context.request-user-info',
              payload: {},
              scope: 'global',
              timestamp: Date.now(),
              producer: 'ContextStore',
            });
          }
        },
        createOrganization(payload: { name: string; description?: string; userId: string }): void {
          createOrganizationEffect(payload);
        },
        createTeam(payload: { name: string; description?: string; organizationId?: string; userId: string }): void {
          createTeamEffect(payload);
        },
        createPartner(payload: { name: string; description?: string; organizationId?: string; userId: string }): void {
          createPartnerEffect(payload);
        },
      };
    }
  ),
  withHooks({
    onInit(store) {
      const eventBus = inject(EventBusStore);
      
      // Listen for auth.login events to trigger context loading
      effect(() => {
        const lastEvent = eventBus.lastEvent();
        if (lastEvent && lastEvent.type === 'auth.login') {
          const userInfo = lastEvent.payload as { userId: string; email: string; displayName?: string | null };
          if (userInfo && userInfo.userId) {
            store.refreshAvailableContexts(userInfo);
          }
        }
      });
      
      // Listen for logout events to clear context
      effect(() => {
        const lastEvent = eventBus.lastEvent();
        if (lastEvent && lastEvent.type === 'auth.logout') {
          patchState(store, initialContextState);
        }
      });
      
      // Listen for user info requests and respond with context.switched to user context
      effect(() => {
        const lastEvent = eventBus.lastEvent();
        if (lastEvent && lastEvent.type === 'auth.user-info') {
          const userInfo = lastEvent.payload as { userId: string; email: string; displayName?: string | null };
          if (userInfo && userInfo.userId) {
            // Navigate to user context
            patchState(store, {
              current: {
                type: 'user',
                userId: userInfo.userId,
                email: userInfo.email,
                displayName: userInfo.displayName ?? null,
              },
            });
          }
        }
      });
    },
  })
) as unknown as Type<ContextStoreInstance>;
