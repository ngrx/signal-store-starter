import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import {
  WorkspaceModuleDescriptor,
  WorkspaceModuleType,
  initialModuleState,
} from '../models/workspace-module.model';

/**
 * ModuleStore
 * Reactive registry for workspace modules (see docs/prd.md).
 * Keeps module metadata in signals so UI and guards can react instantly.
 */
export const ModuleStore = signalStore(
  { providedIn: 'root' },
  withState(initialModuleState),
  withComputed(({ registered }) => ({
    availableModules: computed(() => registered().filter((m) => m.enabled)),
    moduleIndex: computed(() =>
      registered().reduce<Record<WorkspaceModuleType, WorkspaceModuleDescriptor>>(
        (acc, module) => ({ ...acc, [module.id]: module }),
        {} as Record<WorkspaceModuleType, WorkspaceModuleDescriptor>
      )
    ),
  })),
  withMethods((store) => ({
    register(module: WorkspaceModuleDescriptor): void {
      const exists = store.registered().some((m) => m.id === module.id);
      const registered = exists
        ? store.registered().map((m) => (m.id === module.id ? module : m))
        : [...store.registered(), module];

      patchState(store, { registered });
    },
    enable(id: WorkspaceModuleType): void {
      patchState(store, {
        registered: store.registered().map((m) =>
          m.id === id ? { ...m, enabled: true } : m
        ),
      });
    },
    disable(id: WorkspaceModuleType): void {
      patchState(store, {
        registered: store.registered().map((m) =>
          m.id === id ? { ...m, enabled: false } : m
        ),
      });
    },
    reset(): void {
      patchState(store, initialModuleState);
    },
  }))
);
