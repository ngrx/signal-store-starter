/**
 * MembersStore - NgRx Signals store for workspace members
 * Module.members = IdentityMapping (User | Team | Partner | Role | Invitation | Onboarding)
 * Following pure reactive patterns per prd-sup.md
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { initialMembersState } from '../state/members.state';
import { 
  WorkspaceMember, 
  WorkspaceInvitation, 
  MemberOnboarding,
  MembershipRole 
} from '../models/members.model';
import { MembersService } from '../services/members.service';

export const MembersStore = signalStore(
  { providedIn: 'root' },
  withState(initialMembersState),
  withComputed((store) => {
    // Create a base computed for current workspace members to avoid repetition
    const currentMembers = computed(() => {
      const id = store.currentWorkspaceId();
      if (!id) return [];
      return store.byWorkspace()[id] ?? [];
    });

    const currentInvitations = computed(() => {
      const id = store.currentWorkspaceId();
      if (!id) return [];
      return store.invitationsByWorkspace()[id] ?? [];
    });

    return {
      // Current workspace members
      members: currentMembers,

      // Current workspace invitations
      invitations: currentInvitations,

      // Selected member details
      selectedMember: computed(() => {
        const memberId = store.selectedMemberId();
        if (!memberId) return null;
        const members = currentMembers();
        return members.find(m => m.id === memberId) ?? null;
      }),

      // Member statistics
      totalMembers: computed(() => currentMembers().length),

      activeMembers: computed(() => 
        currentMembers().filter(m => m.status === 'Active').length
      ),

      pendingInvitations: computed(() => 
        currentInvitations().filter(i => i.status === 'pending').length
      ),

      // Members by role
      owners: computed(() => 
        currentMembers().filter(m => m.role === 'Owner')
      ),

      admins: computed(() => 
        currentMembers().filter(m => m.role === 'Admin')
      ),

      regularMembers: computed(() => 
        currentMembers().filter(m => m.role === 'Member')
      ),

      guests: computed(() => 
        currentMembers().filter(m => m.role === 'Guest')
      ),

      // Loading state
      isLoading: computed(() => store.loading()),

      // Has selected member
      hasSelection: computed(() => store.selectedMemberId() !== null),
    };
  }),
  withMethods((store, membersService = inject(MembersService)) => {
    /**
     * Load members using rxMethod
     */
    const loadMembers = rxMethod<string>(
      pipe(
        tap((workspaceId: string) =>
          patchState(store, {
            currentWorkspaceId: workspaceId,
            loading: true,
            error: null,
          })
        ),
        switchMap((workspaceId: string) =>
          membersService.getMembers(workspaceId).pipe(
            tap((members: WorkspaceMember[]) => {
              const next = { ...store.byWorkspace(), [workspaceId]: members };
              patchState(store, {
                byWorkspace: next,
                loading: false,
              });
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to load members',
                loading: false,
              });
              return of([]);
            })
          )
        )
      )
    );

    /**
     * Load invitations using rxMethod
     */
    const loadInvitations = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((workspaceId: string) =>
          membersService.getInvitations(workspaceId).pipe(
            tap((invitations: WorkspaceInvitation[]) => {
              const next = { ...store.invitationsByWorkspace(), [workspaceId]: invitations };
              patchState(store, {
                invitationsByWorkspace: next,
                loading: false,
              });
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to load invitations',
                loading: false,
              });
              return of([]);
            })
          )
        )
      )
    );

    /**
     * Add member using rxMethod
     */
    const addMember = rxMethod<{ workspaceId: string; member: Omit<WorkspaceMember, 'id' | 'createdAt' | 'updatedAt'> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ workspaceId, member }: { workspaceId: string; member: Omit<WorkspaceMember, 'id' | 'createdAt' | 'updatedAt'> }) =>
          membersService.addMember(workspaceId, member).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload members to get the updated list
              loadMembers(workspaceId);
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to add member',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Update member using rxMethod
     */
    const updateMember = rxMethod<{ workspaceId: string; memberId: string; updates: Partial<WorkspaceMember> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ workspaceId, memberId, updates }: { workspaceId: string; memberId: string; updates: Partial<WorkspaceMember> }) =>
          membersService.updateMember(workspaceId, memberId, updates).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload members to get the updated list
              loadMembers(workspaceId);
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to update member',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Remove member using rxMethod
     */
    const removeMember = rxMethod<{ workspaceId: string; memberId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ workspaceId, memberId }: { workspaceId: string; memberId: string }) =>
          membersService.removeMember(workspaceId, memberId).pipe(
            tap(() => {
              patchState(store, { loading: false, selectedMemberId: null });
              // Reload members to get the updated list
              loadMembers(workspaceId);
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to remove member',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Send invitation using rxMethod
     */
    const sendInvitation = rxMethod<{ workspaceId: string; invitation: Omit<WorkspaceInvitation, 'id' | 'invitedAt' | 'status'> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ workspaceId, invitation }: { workspaceId: string; invitation: Omit<WorkspaceInvitation, 'id' | 'invitedAt' | 'status'> }) =>
          membersService.sendInvitation(workspaceId, invitation).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload invitations to get the updated list
              loadInvitations(workspaceId);
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to send invitation',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Revoke invitation using rxMethod
     */
    const revokeInvitation = rxMethod<{ workspaceId: string; invitationId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ workspaceId, invitationId }: { workspaceId: string; invitationId: string }) =>
          membersService.revokeInvitation(workspaceId, invitationId).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload invitations to get the updated list
              loadInvitations(workspaceId);
            }),
            catchError((err: Error) => {
              patchState(store, {
                error: err.message || 'Failed to revoke invitation',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    return {
      // Reactive effects
      loadMembers,
      loadInvitations,
      addMember,
      updateMember,
      removeMember,
      sendInvitation,
      revokeInvitation,

      // Synchronous state updates
      setMembers(workspaceId: string, members: WorkspaceMember[]) {
        const next = { ...store.byWorkspace(), [workspaceId]: members };
        patchState(store, {
          byWorkspace: next,
          currentWorkspaceId: workspaceId,
        });
      },

      setInvitations(workspaceId: string, invitations: WorkspaceInvitation[]) {
        const next = { ...store.invitationsByWorkspace(), [workspaceId]: invitations };
        patchState(store, {
          invitationsByWorkspace: next,
        });
      },

      selectMember(memberId: string | null) {
        patchState(store, { selectedMemberId: memberId });
      },

      setCurrentWorkspace(workspaceId: string) {
        patchState(store, { currentWorkspaceId: workspaceId });
      },

      clearAll() {
        patchState(store, initialMembersState);
      },
    };
  })
);
