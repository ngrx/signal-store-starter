/**
 * Task Store - NgRx Signals store for task management
 * Following modern reactive patterns with rxMethod
 * 100% pure reactive - no manual subscriptions
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { TaskService } from '../services/task.service';
import { initialTaskState, TaskState } from './task.state';
import { Task, TaskFilter, ViewMode, TaskTreeNode, GanttTaskData, TimelineEvent } from '../models/task.model';

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialTaskState),
  withComputed(({ tasks, selectedTask, filter, expandedNodes, viewMode }) => ({
    // Task filtering
    filteredTasks: computed(() => {
      let result = tasks();
      const currentFilter = filter();

      if (currentFilter.searchText) {
        const search = currentFilter.searchText.toLowerCase();
        result = result.filter(
          (task) =>
            task.title.toLowerCase().includes(search) ||
            task.description.toLowerCase().includes(search)
        );
      }

      return result;
    }),

    // Root level tasks (for tree views)
    rootTasks: computed(() => {
      return tasks().filter((task) => task.parentId === null);
    }),

    // Build task tree structure
    taskTree: computed(() => {
      const allTasks = tasks();
      const taskMap = new Map<string, TaskTreeNode>();
      const expanded = expandedNodes();

      // Create map of all tasks as tree nodes
      allTasks.forEach((task) => {
        taskMap.set(task.id, {
          ...task,
          expanded: expanded.has(task.id),
          visible: true,
          hasChildren: allTasks.some((t) => t.parentId === task.id),
        });
      });

      // Build parent-child relationships
      const roots: TaskTreeNode[] = [];
      allTasks.forEach((task) => {
        const node = taskMap.get(task.id)!;
        if (task.parentId === null) {
          roots.push(node);
        } else {
          const parent = taskMap.get(task.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(node);
          }
        }
      });

      return roots;
    }),

    // Flatten tree for list view with indentation
    flatTaskList: computed(() => {
      const tree = computed(() => tasks())();
      const result: TaskTreeNode[] = [];
      const expanded = expandedNodes();

      function traverse(nodes: Task[], level: number, parentExpanded: boolean) {
        nodes.forEach((node) => {
          const isExpanded = expanded.has(node.id);
          result.push({
            ...node,
            level,
            expanded: isExpanded,
            visible: parentExpanded,
            hasChildren: (node.children?.length || 0) > 0,
          });

          if (node.children && isExpanded) {
            traverse(node.children, level + 1, parentExpanded && isExpanded);
          }
        });
      }

      const roots = tasks().filter((t) => t.parentId === null);
      traverse(roots, 0, true);
      return result;
    }),

    // Gantt chart data
    ganttData: computed(() => {
      const allTasks = tasks();
      const result: GanttTaskData[] = [];

      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      allTasks.forEach((task, index) => {
        if (!task.startDate || !task.dueDate) return;

        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);
        const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / oneDay));

        const barColor =
          task.status === 'done'
            ? '#10b981'
            : task.status === 'in-progress'
            ? '#3b82f6'
            : task.status === 'blocked'
            ? '#ef4444'
            : '#94a3b8';

        result.push({
          ...task,
          x: Math.floor((start.getTime() - now.getTime()) / oneDay),
          y: index * 40,
          width: duration * 50, // 50px per day
          height: 30,
          barColor,
        });
      });

      return result;
    }),

    // Timeline events
    timelineEvents: computed(() => {
      const allTasks = tasks();
      const events: TimelineEvent[] = [];

      allTasks.forEach((task) => {
        if (task.createdAt) {
          events.push({
            id: `${task.id}-created`,
            taskId: task.id,
            title: `Created: ${task.title}`,
            date: new Date(task.createdAt),
            type: 'created',
            description: task.description,
            icon: '➕',
            color: '#3b82f6',
          });
        }

        if (task.completedDate) {
          events.push({
            id: `${task.id}-completed`,
            taskId: task.id,
            title: `Completed: ${task.title}`,
            date: new Date(task.completedDate),
            type: 'completed',
            description: `Task completed`,
            icon: '✓',
            color: '#10b981',
          });
        }
      });

      return events.sort((a, b) => b.date.getTime() - a.date.getTime());
    }),

    // Statistics
    totalTasks: computed(() => tasks().length),
    completedTasks: computed(() => tasks().filter((t) => t.status === 'done').length),
    inProgressTasks: computed(() => tasks().filter((t) => t.status === 'in-progress').length),
    blockedTasks: computed(() => tasks().filter((t) => t.status === 'blocked').length),
    
    // Loading states
    isLoading: computed(() => tasks().length === 0),
    hasSelectedTask: computed(() => selectedTask() !== null),
  })),
  withMethods((store, taskService = inject(TaskService)) => {
    /**
     * Load tasks using rxMethod - reactive Firestore stream
     */
    const loadTasks = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((workspaceId) =>
          taskService.getTasks(workspaceId, store.filter()).pipe(
            tap((tasks) => patchState(store, { tasks, loading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of([]);
            })
          )
        )
      )
    );

    /**
     * Load workflows using rxMethod
     */
    const loadWorkflows = rxMethod<string>(
      pipe(
        switchMap((workspaceId) =>
          taskService.getWorkflows(workspaceId).pipe(
            tap((workflows) => patchState(store, { workflows })),
            catchError(() => of([]))
          )
        )
      )
    );

    /**
     * Create task using rxMethod
     */
    const createTask = rxMethod<Omit<Task, 'id'>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((task) =>
          taskService.createTask(task).pipe(
            tap(() => patchState(store, { loading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Update task status using rxMethod with transaction
     */
    const updateTaskStatus = rxMethod<{ taskId: string; status: Task['status'] }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ taskId, status }) =>
          taskService.updateTaskStatus(taskId, status).pipe(
            tap(() => patchState(store, { loading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Delete task using rxMethod
     */
    const deleteTask = rxMethod<{ taskId: string; cascadeChildren: boolean }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ taskId, cascadeChildren }) =>
          taskService.deleteTask(taskId, cascadeChildren).pipe(
            tap(() => patchState(store, { loading: false, selectedTask: null })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(null);
            })
          )
        )
      )
    );

    return {
      // Reactive effects
      loadTasks,
      loadWorkflows,
      createTask,
      updateTaskStatus,
      deleteTask,

      // Synchronous state updates
      setFilter(filter: TaskFilter) {
        patchState(store, { filter });
      },

      setViewMode(viewMode: ViewMode) {
        patchState(store, { viewMode });
      },

      selectTask(task: Task | null) {
        patchState(store, { selectedTask: task });
      },

      toggleNode(taskId: string) {
        const expanded = new Set(store.expandedNodes());
        if (expanded.has(taskId)) {
          expanded.delete(taskId);
        } else {
          expanded.add(taskId);
        }
        patchState(store, { expandedNodes: expanded });
      },

      expandAll() {
        const allIds = new Set(store.tasks().map((t) => t.id));
        patchState(store, { expandedNodes: allIds });
      },

      collapseAll() {
        patchState(store, { expandedNodes: new Set() });
      },

      setTimelineRange(start: Date | null, end: Date | null, zoom: number) {
        patchState(store, { timelineStart: start, timelineEnd: end, timelineZoom: zoom });
      },
    };
  }),
  withHooks({
    onInit(store) {
      // Auto-load tasks when workspace context is available
      // This would typically be triggered by ContextStore
      console.log('TaskStore initialized');
    },
  })
);
