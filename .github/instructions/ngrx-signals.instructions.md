---
description: 'NgRx Signals pure reactive state management patterns. Use signalStore, computed, patchState, and rxMethod only. No traditional NgRx patterns. Apply to all store files.'
applyTo: 'src/app/core/**/stores/**/*'
---

# NgRx Signals State Management

## Core Principles

This project uses **ONLY** `@ngrx/signals` for state management. Traditional NgRx (actions, reducers, effects) is **FORBIDDEN**.

### Pure Reactive Principles

```
SignalsPrinciple = PureReactivity (
  NoSideEffectInComputed | 
  ImmutableState | 
  UnidirectionalDataFlow | 
  DerivedStateFromSignals
)
```

**Core Rules**
- ✅ All state managed with `signalStore`
- ✅ All mutations via `patchState`
- ✅ All derived state via `computed()`
- ✅ All async operations via `rxMethod`
- ❌ NO traditional NgRx (actions, reducers, effects)
- ❌ NO RxJS operators for state management
- ❌ NO direct state mutation
- ❌ NO side effects in computed signals

## Store Structure

### Basic Store Template

```typescript
import { signalStore, withState, withComputed, withMethods, withHooks } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

// 1. Define State Interface
export interface FeatureState {
  // Data
  entities: Entity[];
  selectedId: string | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Filters/Sorting
  filters: Filters;
  sorting: Sorting;
}

// 2. Initial State
const initialState: FeatureState = {
  entities: [],
  selectedId: null,
  loading: false,
  error: null,
  filters: {},
  sorting: { field: 'createdAt', order: 'desc' }
};

// 3. Create Store
export const FeatureStore = signalStore(
  // Provide in root for singleton, or omit for scoped
  { providedIn: 'root' },
  
  // State
  withState(initialState),
  
  // Computed (Derived State)
  withComputed(({ entities, selectedId, filters, sorting }) => ({
    // Simple computed
    entityCount: computed(() => entities().length),
    
    // Computed with dependency
    selectedEntity: computed(() => 
      entities().find(e => e.id === selectedId()) ?? null
    ),
    
    // Complex computed (filtering + sorting)
    filteredEntities: computed(() => {
      let result = entities();
      
      // Apply filters
      const f = filters();
      if (f.search) {
        result = result.filter(e => 
          e.name.toLowerCase().includes(f.search!.toLowerCase())
        );
      }
      
      // Apply sorting
      const s = sorting();
      result = [...result].sort((a, b) => {
        const aVal = a[s.field];
        const bVal = b[s.field];
        return s.order === 'asc' 
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1;
      });
      
      return result;
    }),
    
    // Boolean computed
    hasSelection: computed(() => selectedId() !== null),
    isEmpty: computed(() => entities().length === 0)
  })),
  
  // Methods (Mutations + Effects)
  withMethods((store, service = inject(FeatureService)) => ({
    // Simple mutation
    selectEntity(id: string | null) {
      patchState(store, { selectedId: id });
    },
    
    // Mutation with transformation
    setFilters(filters: Partial<Filters>) {
      patchState(store, (state) => ({
        filters: { ...state.filters, ...filters }
      }));
    },
    
    // Async effect with rxMethod
    loadEntities: rxMethod<string>(
      pipe(
        // Set loading state
        tap(() => patchState(store, { loading: true, error: null })),
        
        // Call service
        switchMap((workspaceId) => service.getEntities(workspaceId)),
        
        // Handle response
        tapResponse({
          next: (entities) => patchState(store, { 
            entities, 
            loading: false 
          }),
          error: (error: Error) => patchState(store, { 
            error: error.message, 
            loading: false 
          })
        })
      )
    ),
    
    // Optimistic update
    addEntity: rxMethod<Entity>(
      pipe(
        tap((entity) => {
          // Optimistically add to state
          patchState(store, (state) => ({
            entities: [...state.entities, entity]
          }));
        }),
        switchMap((entity) => service.createEntity(entity)),
        tapResponse({
          next: (savedEntity) => {
            // Replace optimistic entity with saved one
            patchState(store, (state) => ({
              entities: state.entities.map(e => 
                e.id === savedEntity.id ? savedEntity : e
              )
            }));
          },
          error: (error: Error) => {
            // Rollback on error
            patchState(store, (state) => ({
              entities: state.entities.filter(e => e.id !== entity.id),
              error: error.message
            }));
          }
        })
      )
    )
  })),
  
  // Lifecycle Hooks
  withHooks({
    onInit(store) {
      // Auto-load on init
      const contextStore = inject(ContextStore);
      effect(() => {
        const workspaceId = contextStore.currentWorkspaceId();
        if (workspaceId) {
          store.loadEntities(workspaceId);
        }
      });
    },
    
    onDestroy() {
      // Cleanup if needed
      console.log('Store destroyed');
    }
  })
);
```

## State Management Patterns

### 1. State Definition (withState)

```typescript
// Define clear state interface
interface MyState {
  // Data
  items: Item[];
  
  // Selection
  selectedId: string | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;
  
  // Filters
  searchTerm: string;
  filters: Record<string, unknown>;
}

// Initialize all fields (no undefined!)
const initialState: MyState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  totalCount: 0,
  searchTerm: '',
  filters: {}
};

// Add to store
export const MyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState)
);
```

### 2. Computed Signals (withComputed)

```typescript
withComputed(({ items, selectedId, page, pageSize, searchTerm }) => ({
  // Simple computed
  itemCount: computed(() => items().length),
  
  // With logic
  selectedItem: computed(() => 
    items().find(i => i.id === selectedId()) ?? null
  ),
  
  // Filtered
  filteredItems: computed(() => {
    const term = searchTerm().toLowerCase();
    return term 
      ? items().filter(i => i.name.toLowerCase().includes(term))
      : items();
  }),
  
  // Paginated
  paginatedItems: computed(() => {
    const filtered = filteredItems();
    const start = (page() - 1) * pageSize();
    return filtered.slice(start, start + pageSize());
  }),
  
  // Calculated properties
  totalPages: computed(() => 
    Math.ceil(filteredItems().length / pageSize())
  ),
  
  // Boolean checks
  hasItems: computed(() => items().length > 0),
  hasSelection: computed(() => selectedId() !== null),
  canGoNext: computed(() => page() < totalPages()),
  canGoPrevious: computed(() => page() > 1)
}))
```

**Computed Rules**
- ✅ Pure functions only (no side effects)
- ✅ Read-only (cannot mutate state)
- ✅ Automatically memoized
- ✅ Only recompute when dependencies change
- ❌ NO async operations
- ❌ NO calls to services
- ❌ NO patchState inside computed

### 3. Methods (withMethods)

```typescript
withMethods((store, service = inject(MyService)) => ({
  // Synchronous mutations
  setSelection(id: string | null) {
    patchState(store, { selectedId: id });
  },
  
  updateFilters(filters: Partial<Filters>) {
    patchState(store, (state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },
  
  clearFilters() {
    patchState(store, { filters: {}, searchTerm: '' });
  },
  
  nextPage() {
    patchState(store, (state) => ({ 
      page: Math.min(state.page + 1, state.totalPages) 
    }));
  },
  
  // Async operations with rxMethod
  loadItems: rxMethod<void>(
    pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => service.getItems()),
      tapResponse({
        next: (items) => patchState(store, { items, loading: false }),
        error: (error: Error) => patchState(store, { 
          error: error.message, 
          loading: false 
        })
      })
    )
  ),
  
  deleteItem: rxMethod<string>(
    pipe(
      switchMap((id) => service.deleteItem(id)),
      tapResponse({
        next: (deletedId) => patchState(store, (state) => ({
          items: state.items.filter(i => i.id !== deletedId),
          selectedId: state.selectedId === deletedId ? null : state.selectedId
        })),
        error: (error: Error) => patchState(store, { error: error.message })
      })
    )
  )
}))
```

**Method Rules**
- ✅ All state changes via `patchState`
- ✅ Async operations via `rxMethod`
- ✅ Inject services for I/O
- ✅ Handle errors in `tapResponse`
- ❌ NO direct property assignment
- ❌ NO returning values from rxMethod

### 4. Effects (rxMethod)

```typescript
// Pattern: rxMethod<Input>(pipe(...operators))
loadData: rxMethod<string>(
  pipe(
    // 1. Set loading state
    tap(() => patchState(store, { loading: true })),
    
    // 2. Transform input (optional)
    map((id) => ({ id, timestamp: Date.now() })),
    
    // 3. Call service (switchMap, mergeMap, concatMap, exhaustMap)
    switchMap(({ id }) => service.getData(id)),
    
    // 4. Handle response
    tapResponse({
      next: (data) => patchState(store, { data, loading: false }),
      error: (error) => patchState(store, { 
        error: error.message, 
        loading: false 
      })
    })
  )
)
```

**RxJS Operator Selection**
- `switchMap` - Cancel previous, use for search/filters
- `mergeMap` - Run concurrently, use for independent operations
- `concatMap` - Queue sequentially, use for ordered operations
- `exhaustMap` - Ignore new while running, use for save/submit

**Error Handling**
```typescript
// Always use tapResponse for error handling
tapResponse({
  next: (result) => {
    // Success: update state
    patchState(store, { result });
  },
  error: (error: Error) => {
    // Error: log and update error state
    console.error('Operation failed:', error);
    patchState(store, { error: error.message });
  }
})
```

### 5. Lifecycle Hooks (withHooks)

```typescript
withHooks({
  onInit(store) {
    // Auto-load data
    store.loadData();
    
    // React to other stores
    const authStore = inject(AuthStore);
    effect(() => {
      const user = authStore.user();
      if (user) {
        store.loadUserData(user.uid);
      } else {
        patchState(store, initialState);
      }
    });
    
    // Watch workspace changes
    const contextStore = inject(ContextStore);
    effect(() => {
      const workspaceId = contextStore.currentWorkspaceId();
      if (workspaceId) {
        // Reset and reload for new workspace
        patchState(store, initialState);
        store.loadWorkspaceData(workspaceId);
      }
    });
  },
  
  onDestroy(store) {
    // Cleanup subscriptions (auto-handled by rxMethod)
    // Custom cleanup if needed
    console.log('Store destroyed');
  }
})
```

## Store Types by Layer

### GlobalShell Store
```typescript
export const GlobalShellStore = signalStore(
  { providedIn: 'root' },
  withState({
    config: null,
    layout: 'default',
    theme: 'light'
  }),
  withComputed(({ config, theme }) => ({
    isDarkTheme: computed(() => theme() === 'dark'),
    appVersion: computed(() => config()?.version ?? '1.0.0')
  })),
  withMethods((store, configService = inject(ConfigService)) => ({
    toggleTheme() {
      patchState(store, (state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      }));
    },
    loadConfig: rxMethod<void>(
      pipe(
        switchMap(() => configService.getConfig()),
        tapResponse({
          next: (config) => patchState(store, { config }),
          error: (error) => console.error('Config load failed:', error)
        })
      )
    )
  }))
);
```

### WorkspaceListStore
```typescript
export const WorkspaceListStore = signalStore(
  { providedIn: 'root' },
  withState({
    workspaces: [] as Workspace[],
    currentWorkspaceId: null as string | null,
    loading: false,
    error: null as string | null
  }),
  withComputed(({ workspaces, currentWorkspaceId }) => ({
    ownedWorkspaces: computed(() => 
      workspaces().filter(w => w.role === 'owner')
    ),
    memberWorkspaces: computed(() => 
      workspaces().filter(w => w.role !== 'owner')
    ),
    currentWorkspace: computed(() => 
      workspaces().find(w => w.id === currentWorkspaceId()) ?? null
    )
  })),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    selectWorkspace(id: string | null) {
      patchState(store, { currentWorkspaceId: id });
    },
    loadWorkspaces: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((accountId) => workspaceService.getUserWorkspaces(accountId)),
        tapResponse({
          next: (workspaces) => patchState(store, { workspaces, loading: false }),
          error: (error) => patchState(store, { error: error.message, loading: false })
        })
      )
    )
  }))
);
```

### Feature Store (Module-specific)
```typescript
export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState({
    tasks: [] as Task[],
    selectedTaskId: null as string | null,
    filters: {} as TaskFilters,
    loading: false,
    error: null as string | null
  }),
  withComputed(({ tasks, selectedTaskId, filters }) => ({
    filteredTasks: computed(() => {
      // Apply filters
      let result = tasks();
      if (filters().status) {
        result = result.filter(t => t.status === filters().status);
      }
      return result;
    }),
    selectedTask: computed(() => 
      tasks().find(t => t.id === selectedTaskId()) ?? null
    ),
    tasksByStatus: computed(() => {
      const byStatus: Record<string, Task[]> = {};
      tasks().forEach(t => {
        if (!byStatus[t.status]) byStatus[t.status] = [];
        byStatus[t.status].push(t);
      });
      return byStatus;
    })
  })),
  withMethods((store, taskService = inject(TaskService)) => ({
    loadTasks: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((workspaceId) => taskService.getTasks(workspaceId)),
        tapResponse({
          next: (tasks) => patchState(store, { tasks, loading: false }),
          error: (error) => patchState(store, { error: error.message, loading: false })
        })
      )
    )
  })),
  withHooks({
    onInit(store) {
      const contextStore = inject(ContextStore);
      effect(() => {
        const workspaceId = contextStore.currentWorkspaceId();
        if (workspaceId) {
          store.loadTasks(workspaceId);
        }
      });
    }
  })
);
```

## Usage in Components

```typescript
import { TasksStore } from '@core/workspace/stores/tasks.store';

@Component({
  selector: 'app-task-list',
  template: `
    @if (tasksStore.loading()) {
      <div>Loading tasks...</div>
    } @else if (tasksStore.error()) {
      <div>Error: {{ tasksStore.error() }}</div>
    } @else {
      @for (task of tasksStore.filteredTasks(); track task.id) {
        <app-task-item [task]="task" />
      }
    }
  `
})
export class TaskListComponent {
  tasksStore = inject(TasksStore);
  
  // Methods call store methods
  selectTask(id: string) {
    this.tasksStore.selectEntity(id);
  }
}
```

## Forbidden Patterns

### ❌ Traditional NgRx
```typescript
// FORBIDDEN - Do not use
import { createAction, createReducer, createEffect } from '@ngrx/store';
export const loadTasks = createAction('[Tasks] Load');
```

### ❌ RxJS in State Management
```typescript
// FORBIDDEN - Do not use operators for state
tasks$.pipe(
  map(tasks => tasks.filter(t => t.status === 'active'))
);
```

### ❌ Direct Mutation
```typescript
// FORBIDDEN
store.tasks.push(newTask);
store.loading = true;
```

### ❌ Side Effects in Computed
```typescript
// FORBIDDEN
withComputed(() => ({
  tasks: computed(() => {
    // NO side effects!
    this.service.logAccess(); // ❌
    return this.tasks();
  })
}))
```

## Testing Stores

```typescript
describe('TasksStore', () => {
  let store: InstanceType<typeof TasksStore>;
  let mockService: jasmine.SpyObj<TaskService>;
  
  beforeEach(() => {
    mockService = jasmine.createSpyObj('TaskService', ['getTasks']);
    TestBed.configureTestingModule({
      providers: [
        TasksStore,
        { provide: TaskService, useValue: mockService }
      ]
    });
    store = TestBed.inject(TasksStore);
  });
  
  it('should load tasks', (done) => {
    const mockTasks = [{ id: '1', name: 'Test' }];
    mockService.getTasks.and.returnValue(of(mockTasks));
    
    store.loadTasks('workspace-1');
    
    setTimeout(() => {
      expect(store.tasks()).toEqual(mockTasks);
      expect(store.loading()).toBe(false);
      done();
    }, 100);
  });
});
```

## Related Documentation
- [DDD Architecture](./ddd-architecture.instructions.md)
- [NgRx Signals Architecture](../../docs/architecture/07-ngrx-signals.md)
- [Angular Instructions](./angular.instructions.md)
