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
  withMethods((store, authStore = inject(AuthStore)) => ({
    switchContext(context: AppContext): void {
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
    },
    setAvailableOrganizations(organizations: OrganizationContext[]): void {
      patchState(store, (state) => ({
        available: {
          ...state.available,
          organizations,
        },
      }));
    },
    setAvailableTeams(teams: TeamContext[]): void {
      patchState(store, (state) => ({
        available: {
          ...state.available,
          teams,
        },
      }));
    },
    setAvailablePartners(partners: PartnerContext[]): void {
      patchState(store, (state) => ({
        available: {
          ...state.available,
          partners,
        },
      }));
    },
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
    clearContext(): void {
      patchState(store, initialContextState);
    },
  })),
  withHooks({
    onInit(
      store,
      authStore = inject(AuthStore),
      orgService = inject(OrganizationService),
      teamService = inject(TeamService),
      partnerService = inject(PartnerService)
    ) {
      // Reactive method to load available contexts when user is authenticated
      const loadAvailableContexts = rxMethod<void>(
        pipe(
          switchMap(() => {
            const user = authStore.user();
            if (!user) {
              // Clear context when user logs out
              store.clearContext();
              return of(null);
            }

            // Initialize user context
            store.switchContext({
              type: 'user',
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName ?? null,
            });

            // Load all available contexts reactively
            return combineLatest([
              orgService.list({}),
              teamService.list({}),
              partnerService.list({}),
            ]);
          }),
          tap((result) => {
            if (result) {
              const [orgs, teams, partners] = result;
              
              // Transform to context objects
              const orgContexts: OrganizationContext[] = orgs.map((org: any) => ({
                type: 'organization' as const,
                organizationId: org.id,
                name: org.name,
                role: 'member' as const, // Should come from membership data
              }));

              const teamContexts: TeamContext[] = teams.map((team: any) => ({
                type: 'team' as const,
                teamId: team.id,
                organizationId: team.organizationId,
                name: team.name,
                role: 'member' as const, // Should come from membership data
              }));

              const partnerContexts: PartnerContext[] = partners.map((partner: any) => ({
                type: 'partner' as const,
                partnerId: partner.id,
                organizationId: partner.organizationId,
                name: partner.name,
                accessLevel: 'readonly' as const, // Should come from access data
              }));

              store.setAvailableOrganizations(orgContexts);
              store.setAvailableTeams(teamContexts);
              store.setAvailablePartners(partnerContexts);
            }
          }),
          catchError((error) => {
            console.error('[ContextStore] Error loading available contexts:', error);
            return of(null);
          })
        )
      );

      // Trigger loading immediately (user may already be authenticated from APP_INITIALIZER)
      // This will also react to auth state changes
      loadAvailableContexts();
    },
  })
);
