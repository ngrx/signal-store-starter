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
  withComputed(({ byWorkspace, invitationsByWorkspace, currentWorkspaceId, selectedMemberId, loading }) => ({
    // Current workspace members
    members: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return [];
      return byWorkspace()[id] ?? [];
    }),

    // Current workspace invitations
    invitations: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return [];
      return invitationsByWorkspace()[id] ?? [];
    }),

    // Selected member details
    selectedMember: computed(() => {
      const memberId = selectedMemberId();
      if (!memberId) return null;
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.find(m => m.id === memberId) ?? null;
    }),

    // Member statistics
    totalMembers: computed(() => {
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.length;
    }),

    activeMembers: computed(() => {
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.filter(m => m.status === 'Active').length;
    }),

    pendingInvitations: computed(() => {
      const invitations = computed(() => {
        const id = currentWorkspaceId();
        return id ? invitationsByWorkspace()[id] : [];
      })();
      return invitations.filter(i => i.status === 'pending').length;
    }),

    // Members by role
    owners: computed(() => {
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.filter(m => m.role === 'Owner');
    }),

    admins: computed(() => {
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.filter(m => m.role === 'Admin');
    }),

    regularMembers: computed(() => {
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.filter(m => m.role === 'Member');
    }),

    guests: computed(() => {
      const members = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : [];
      })();
      return members.filter(m => m.role === 'Guest');
    }),

    // Loading state
    isLoading: computed(() => loading()),

    // Has selected member
    hasSelection: computed(() => selectedMemberId() !== null),
  })),
  withMethods((store, membersService = inject(MembersService)) => {
    /**
     * Load members using rxMethod
     */
    const loadMembers = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, {
            currentWorkspaceId: workspaceId,
            loading: true,
            error: null,
          })
        ),
        switchMap((workspaceId) =>
          membersService.getMembers(workspaceId).pipe(
            tap((members) => {
              const next = { ...store.byWorkspace(), [workspaceId]: members };
              patchState(store, {
                byWorkspace: next,
                loading: false,
              });
            }),
            catchError((err) => {
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
        switchMap((workspaceId) =>
          membersService.getInvitations(workspaceId).pipe(
            tap((invitations) => {
              const next = { ...store.invitationsByWorkspace(), [workspaceId]: invitations };
              patchState(store, {
                invitationsByWorkspace: next,
                loading: false,
              });
            }),
            catchError((err) => {
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
        switchMap(({ workspaceId, member }) =>
          membersService.addMember(workspaceId, member).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload members to get the updated list
              loadMembers(workspaceId);
            }),
            catchError((err) => {
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
        switchMap(({ workspaceId, memberId, updates }) =>
          membersService.updateMember(workspaceId, memberId, updates).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload members to get the updated list
              loadMembers(workspaceId);
            }),
            catchError((err) => {
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
        switchMap(({ workspaceId, memberId }) =>
          membersService.removeMember(workspaceId, memberId).pipe(
            tap(() => {
              patchState(store, { loading: false, selectedMemberId: null });
              // Reload members to get the updated list
              loadMembers(workspaceId);
            }),
            catchError((err) => {
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
        switchMap(({ workspaceId, invitation }) =>
          membersService.sendInvitation(workspaceId, invitation).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload invitations to get the updated list
              loadInvitations(workspaceId);
            }),
            catchError((err) => {
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
        switchMap(({ workspaceId, invitationId }) =>
          membersService.revokeInvitation(workspaceId, invitationId).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload invitations to get the updated list
              loadInvitations(workspaceId);
            }),
            catchError((err) => {
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
