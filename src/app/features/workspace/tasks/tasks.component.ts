/**
 * Tasks Component - Multi-view task management
 * Supports: Tree List, Tree Diagram, Gantt Chart, Timeline
 * 100% reactive with NgRx Signals
 */

import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskStore } from '../../../core/tasks/stores/task.store';
import { ViewMode, TaskStatus, TaskPriority } from '../../../core/tasks/models/task.model';
import { ContextStore } from '../../../core/context/stores/context.store';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tasks-container">
      <!-- Header -->
      <div class="tasks-header">
        <div class="header-left">
          <h1>✓ Tasks</h1>
          <div class="task-stats">
            <span class="stat">Total: {{ taskStore.totalTasks() }}</span>
            <span class="stat stat-success">Completed: {{ taskStore.completedTasks() }}</span>
            <span class="stat stat-info">In Progress: {{ taskStore.inProgressTasks() }}</span>
            <span class="stat stat-danger">Blocked: {{ taskStore.blockedTasks() }}</span>
          </div>
        </div>

        <div class="header-right">
          <!-- View Mode Selector -->
          <div class="view-selector">
            <button
              *ngFor="let mode of viewModes"
              [class.active]="taskStore.viewMode() === mode.value"
              (click)="taskStore.setViewMode(mode.value)"
              class="view-btn"
              [title]="mode.label"
            >
              {{ mode.icon }} {{ mode.label }}
            </button>
          </div>

          <button class="btn-primary" (click)="createNewTask()">
            ➕ New Task
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          type="text"
          [(ngModel)]="searchText"
          (ngModelChange)="onSearchChange()"
          placeholder="🔍 Search tasks..."
          class="search-input"
        />

        <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="filter-select">
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>

        <select [(ngModel)]="filterPriority" (ngModelChange)="onFilterChange()" class="filter-select">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        @if (taskStore.viewMode() === 'tree-list' || taskStore.viewMode() === 'tree-diagram') {
          <div class="tree-actions">
            <button (click)="taskStore.expandAll()" class="btn-small">Expand All</button>
            <button (click)="taskStore.collapseAll()" class="btn-small">Collapse All</button>
          </div>
        }
      </div>

      <!-- View Content -->
      <div class="view-content">
        <!-- Tree List View -->
        @if (taskStore.viewMode() === 'tree-list') {
          <div class="tree-list-view">
            @for (task of taskStore.flatTaskList(); track task.id) {
              @if (task.visible) {
                <div 
                  class="task-row"
                  [class.task-selected]="taskStore.selectedTask()?.id === task.id"
                  [style.paddingLeft.px]="task.level * 24 + 16"
                  (click)="taskStore.selectTask(task)"
                >
                  <div class="task-row-content">
                    @if (task.hasChildren) {
                      <button 
                        class="expand-btn"
                        (click)="taskStore.toggleNode(task.id); $event.stopPropagation()"
                      >
                        {{ task.expanded ? '▼' : '▶' }}
                      </button>
                    } @else {
                      <span class="expand-spacer"></span>
                    }
                    
                    <span class="task-status" [class]="'status-' + task.status">
                      {{ getStatusIcon(task.status) }}
                    </span>
                    
                    <span class="task-priority" [class]="'priority-' + task.priority">
                      {{ getPriorityIcon(task.priority) }}
                    </span>
                    
                    <span class="task-title">{{ task.title }}</span>
                    
                    @if (task.assigneeName) {
                      <span class="task-assignee">👤 {{ task.assigneeName }}</span>
                    }
                    
                    @if (task.dueDate) {
                      <span class="task-due-date" [class.overdue]="isOverdue(task.dueDate)">
                        📅 {{ formatDate(task.dueDate) }}
                      </span>
                    }
                    
                    <div class="task-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="task.progress"></div>
                      </div>
                      <span class="progress-text">{{ task.progress }}%</span>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Tree Diagram View -->
        @if (taskStore.viewMode() === 'tree-diagram') {
          <div class="tree-diagram-view">
            <div class="tree-diagram-content">
              @for (rootTask of taskStore.taskTree(); track rootTask.id) {
                <div class="tree-node">
                  {{ renderTreeNode(rootTask) }}
                </div>
              }
            </div>
          </div>
        }

        <!-- Gantt Chart View -->
        @if (taskStore.viewMode() === 'gantt') {
          <div class="gantt-view">
            <div class="gantt-header">
              <h3>Gantt Chart</h3>
              <p class="gantt-info">Showing tasks with start and due dates</p>
            </div>
            
            <div class="gantt-chart">
              <div class="gantt-timeline">
                <!-- Timeline headers would go here -->
                <div class="timeline-header">
                  @for (day of [0, 1, 2, 3, 4, 5, 6, 7]; track day) {
                    <div class="day-column">Day {{ day }}</div>
                  }
                </div>
              </div>
              
              <div class="gantt-tasks">
                @for (task of taskStore.ganttData(); track task.id) {
                  <div 
                    class="gantt-bar"
                    [style.top.px]="task.y"
                    [style.left.px]="task.x"
                    [style.width.px]="task.width"
                    [style.height.px]="task.height"
                    [style.backgroundColor]="task.barColor"
                    [title]="task.title"
                  >
                    <span class="gantt-task-title">{{ task.title }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Timeline View -->
        @if (taskStore.viewMode() === 'timeline') {
          <div class="timeline-view">
            <h3>Activity Timeline</h3>
            
            <div class="timeline">
              @for (event of taskStore.timelineEvents(); track event.id) {
                <div class="timeline-event">
                  <div class="event-marker" [style.backgroundColor]="event.color">
                    {{ event.icon }}
                  </div>
                  <div class="event-content">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-date">{{ formatDateTime(event.date) }}</div>
                    <div class="event-description">{{ event.description }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (taskStore.totalTasks() === 0) {
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <button class="btn-primary" (click)="createNewTask()">
              ➕ Create Task
            </button>
          </div>
        }
      </div>

      <!-- Task Detail Panel (if selected) -->
      @if (taskStore.selectedTask()) {
        <div class="task-detail-panel">
          <div class="detail-header">
            <h3>{{ taskStore.selectedTask()!.title }}</h3>
            <button class="close-btn" (click)="taskStore.selectTask(null)">✕</button>
          </div>
          <div class="detail-content">
            <p><strong>Status:</strong> {{ taskStore.selectedTask()!.status }}</p>
            <p><strong>Priority:</strong> {{ taskStore.selectedTask()!.priority }}</p>
            <p><strong>Description:</strong> {{ taskStore.selectedTask()!.description }}</p>
            @if (taskStore.selectedTask()!.assigneeName) {
              <p><strong>Assignee:</strong> {{ taskStore.selectedTask()!.assigneeName }}</p>
            }
            <p><strong>Progress:</strong> {{ taskStore.selectedTask()!.progress }}%</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tasks-container {
      padding: 1.5rem;
      height: 100vh;
      overflow: auto;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    .header-left h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .task-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat {
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .stat-success { background: #d1fae5; color: #065f46; }
    .stat-info { background: #dbeafe; color: #1e40af; }
    .stat-danger { background: #fee2e2; color: #991b1b; }

    .header-right {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .view-selector {
      display: flex;
      gap: 0.5rem;
      background: #f3f4f6;
      padding: 0.25rem;
      border-radius: 8px;
    }

    .view-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .view-btn:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .view-btn.active {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .filters {
      display: flex;
      gap: 1rem;
      background: white;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-input, .filter-select {
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
    }

    .filter-select {
      min-width: 150px;
    }

    .tree-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-small:hover {
      background: #e5e7eb;
    }

    .view-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-height: 500px;
      position: relative;
    }

    /* Tree List View */
    .tree-list-view {
      padding: 1rem;
    }

    .task-row {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.2s;
    }

    .task-row:hover {
      background: #f9fafb;
    }

    .task-row.task-selected {
      background: #ede9fe;
    }

    .task-row-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .expand-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .expand-spacer {
      width: 24px;
    }

    .task-status, .task-priority {
      font-size: 1.25rem;
    }

    .status-todo { opacity: 0.5; }
    .status-in-progress { color: #3b82f6; }
    .status-done { color: #10b981; }
    .status-blocked { color: #ef4444; }

    .priority-urgent { color: #ef4444; }
    .priority-high { color: #f59e0b; }
    .priority-medium { color: #3b82f6; }
    .priority-low { color: #94a3b8; }

    .task-title {
      font-weight: 500;
      flex: 1;
    }

    .task-assignee, .task-due-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .task-due-date.overdue {
      color: #ef4444;
      font-weight: 600;
    }

    .task-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-bar {
      width: 100px;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.75rem;
      color: #6b7280;
      min-width: 40px;
    }

    /* Tree Diagram View */
    .tree-diagram-view {
      padding: 2rem;
      overflow: auto;
    }

    .tree-diagram-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Gantt View */
    .gantt-view {
      padding: 1.5rem;
    }

    .gantt-header {
      margin-bottom: 1.5rem;
    }

    .gantt-header h3 {
      margin: 0 0 0.5rem 0;
    }

    .gantt-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .gantt-chart {
      position: relative;
      min-height: 400px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow-x: auto;
    }

    .gantt-timeline {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .timeline-header {
      display: flex;
    }

    .day-column {
      width: 100px;
      padding: 0.75rem;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      border-right: 1px solid #e5e7eb;
    }

    .gantt-tasks {
      position: relative;
      min-height: 300px;
    }

    .gantt-bar {
      position: absolute;
      border-radius: 4px;
      padding: 0.5rem;
      color: white;
      font-size: 0.75rem;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .gantt-bar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .gantt-task-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Timeline View */
    .timeline-view {
      padding: 1.5rem;
    }

    .timeline-view h3 {
      margin: 0 0 1.5rem 0;
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
    }

    .timeline-event {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .event-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .event-content {
      flex: 1;
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
    }

    .event-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .event-date {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .event-description {
      font-size: 0.875rem;
      color: #4b5563;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #4b5563;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    /* Task Detail Panel */
    .task-detail-panel {
      position: fixed;
      right: 0;
      top: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      overflow-y: auto;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #f3f4f6;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.25rem;
    }

    .close-btn:hover {
      background: #e5e7eb;
    }

    .detail-content {
      padding: 1.5rem;
    }

    .detail-content p {
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .tasks-header {
        flex-direction: column;
        gap: 1rem;
      }

      .task-detail-panel {
        width: 100%;
      }
    }
  `]
})
export class TasksComponent implements OnInit {
  taskStore = inject(TaskStore);
  contextStore = inject(ContextStore);

  searchText = '';
  filterStatus: TaskStatus | '' = '';
  filterPriority: TaskPriority | '' = '';

  viewModes: { value: ViewMode; label: string; icon: string }[] = [
    { value: 'tree-list', label: 'Tree List', icon: '📋' },
    { value: 'tree-diagram', label: 'Tree Diagram', icon: '🌳' },
    { value: 'gantt', label: 'Gantt', icon: '📊' },
    { value: 'timeline', label: 'Timeline', icon: '⏱️' },
  ];

  ngOnInit() {
    // Load tasks for current workspace
    const context = this.contextStore.current();
    if (context) {
      // In a real app, we'd get workspaceId from context
      // For demo, using a placeholder
      const workspaceId = 'demo-workspace';
      this.taskStore.loadTasks(workspaceId);
      this.taskStore.loadWorkflows(workspaceId);
    }
  }

  onSearchChange() {
    this.taskStore.setFilter({
      ...this.taskStore.filter(),
      searchText: this.searchText || null,
    });
  }

  onFilterChange() {
    this.taskStore.setFilter({
      ...this.taskStore.filter(),
      status: this.filterStatus ? [this.filterStatus] : null,
      priority: this.filterPriority ? [this.filterPriority] : null,
    });
  }

  createNewTask() {
    console.log('Create new task');
    // Would open a modal or navigate to create form
  }

  getStatusIcon(status: TaskStatus): string {
    const icons: Record<TaskStatus, string> = {
      'todo': '⭕',
      'in-progress': '🔄',
      'review': '👀',
      'done': '✅',
      'blocked': '🚫',
      'cancelled': '❌',
    };
    return icons[status] || '⭕';
  }

  getPriorityIcon(priority: TaskPriority): string {
    const icons: Record<TaskPriority, string> = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🟠',
      'urgent': '🔴',
    };
    return icons[priority] || '🟢';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  renderTreeNode(task: any): string {
    // Simplified tree rendering
    return task.title;
  }
}
