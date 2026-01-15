import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { CreateProjectPayload, Project, applyProjectScopes } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { AuthStore } from '../../auth/stores/auth.store';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialProjectState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState(initialProjectState),
  withComputed(({ projects, loading }) => ({
    projectCount: computed(() => projects().length),
    isLoading: computed(() => loading()),
  })),
  withMethods((store, projectService = inject(ProjectService), authStore = inject(AuthStore)) => {
    const loadProjects = rxMethod<Record<string, any> | undefined>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((filters = {}) =>
          projectService.list(filters).pipe(
            tap((projects) => patchState(store, { projects, loading: false })),
            catchError((error) => {
              patchState(store, { loading: false, error: error?.message || 'Failed to load projects' });
              return of([]);
            })
          )
        )
      )
    );

    const createProject = rxMethod<CreateProjectPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) => {
          const ownerId = authStore.user()?.uid;
          if (!ownerId) {
            patchState(store, { loading: false, error: 'User not authenticated' });
            return of(null);
          }
          return projectService.create(ownerId, payload).pipe(
            tap((projectId) => {
              if (projectId) {
                // optimistic append
                const now = new Date();
                const project: Project = {
                  id: projectId,
                  name: payload.name,
                  description: payload.description ?? '',
                  ownerId,
                  createdAt: now,
                  updatedAt: now,
                  status: 'active',
                  ...applyProjectScopes(payload),
                };
                patchState(store, { projects: [...store.projects(), project] });
              }
              patchState(store, { loading: false });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error?.message || 'Failed to create project' });
              return of(null);
            })
          );
        })
      )
    );

    return {
      loadProjects(filters?: Record<string, any>) {
        loadProjects(filters);
      },
      createProject(payload: CreateProjectPayload) {
        createProject(payload);
      },
      clearError() {
        patchState(store, { error: null });
      },
    };
  }),
  withHooks({
    onDestroy(store) {
      patchState(store, initialProjectState);
    },
  })
);
