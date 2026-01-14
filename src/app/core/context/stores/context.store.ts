import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
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
            displayName: user.displayName || undefined,
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
      // Initialize user context when authenticated
      const user = authStore.user();
      if (user) {
        store.switchContext({
          type: 'user',
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
        });

        // Load available contexts from Firestore
        // Note: In a real app, these would be filtered by user permissions
        orgService.list({}).subscribe((orgs) => {
          const orgContexts: OrganizationContext[] = orgs.map((org) => ({
            type: 'organization' as const,
            organizationId: org.id,
            name: org.name,
            role: 'member' as const, // Should come from membership data
          }));
          store.setAvailableOrganizations(orgContexts);
        });

        teamService.list({}).subscribe((teams) => {
          const teamContexts: TeamContext[] = teams.map((team) => ({
            type: 'team' as const,
            teamId: team.id,
            organizationId: team.organizationId,
            name: team.name,
            role: 'member' as const, // Should come from membership data
          }));
          store.setAvailableTeams(teamContexts);
        });

        partnerService.list({}).subscribe((partners) => {
          const partnerContexts: PartnerContext[] = partners.map((partner) => ({
            type: 'partner' as const,
            partnerId: partner.id,
            organizationId: partner.organizationId,
            name: partner.name,
            accessLevel: 'readonly' as const, // Should come from access data
          }));
          store.setAvailablePartners(partnerContexts);
        });
      }
    },
  })
);
