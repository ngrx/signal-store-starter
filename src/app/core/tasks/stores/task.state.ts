/**
 * Task State - Initial state for TaskStore
 * Following modern NgRx Signals patterns
 */

import { Task, Workflow, TaskFilter, ViewMode } from '../models/task.model';

export interface TaskState {
  tasks: Task[];
  workflows: Workflow[];
  selectedTask: Task | null;
  filter: TaskFilter;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  
  // Tree state
  expandedNodes: Set<string>;
  
  // Timeline state
  timelineStart: Date | null;
  timelineEnd: Date | null;
  timelineZoom: number; // 1 = day, 7 = week, 30 = month
}

export const initialTaskState: TaskState = {
  tasks: [],
  workflows: [],
  selectedTask: null,
  filter: {},
  viewMode: 'tree-list',
  loading: false,
  error: null,
  expandedNodes: new Set<string>(),
  timelineStart: null,
  timelineEnd: null,
  timelineZoom: 7,
};
