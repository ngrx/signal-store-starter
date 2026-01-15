/**
 * Task Models - Domain objects for work management
 * Following PRD: Module.tasks = WorkManagement (Task | Workflow | Status)
 */

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ViewMode = 'tree-list' | 'tree-diagram' | 'gantt' | 'timeline';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Hierarchy
  parentId: string | null;
  children?: Task[];
  level: number;
  path: string[]; // Array of parent IDs for tree traversal
  
  // Assignment
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  
  // Scheduling
  startDate: Date | null;
  dueDate: Date | null;
  completedDate: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  
  // Progress
  progress: number; // 0-100
  subtaskCount: number;
  completedSubtaskCount: number;
  
  // Context
  workspaceId: string;
  organizationId: string;
  workflowId: string | null;
  tags: string[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  
  // Workflow stages
  stages: WorkflowStage[];
  
  // Context
  workspaceId: string;
  organizationId: string;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStage {
  id: string;
  name: string;
  status: TaskStatus;
  order: number;
  color: string;
}

export interface TaskFilter {
  status?: TaskStatus[] | null;
  priority?: TaskPriority[] | null;
  assigneeId?: string | null;
  workflowId?: string | null;
  tags?: string[] | null;
  dueDateFrom?: Date | null;
  dueDateTo?: Date | null;
  searchText?: string | null;
}

export interface TaskTreeNode extends Task {
  expanded: boolean;
  visible: boolean;
  hasChildren: boolean;
}

export interface GanttTaskData extends Task {
  x: number;
  y: number;
  width: number;
  height: number;
  barColor: string;
}

export interface TimelineEvent {
  id: string;
  taskId: string;
  title: string;
  date: Date;
  type: 'created' | 'status-changed' | 'assigned' | 'completed' | 'updated';
  description: string;
  icon: string;
  color: string;
}
