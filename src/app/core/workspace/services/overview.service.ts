/**
 * Service for retrieving workspace overview data
 * Following NgRx Signals reactive patterns per prd-sup.md
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkspaceOverview, ActivityItem, DashboardMetrics } from '../models/overview.model';
import { createEmptyOverview } from '../state/overview.state';

@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  /**
   * Get overview data for a workspace
   * In a real implementation, this would fetch from Firestore
   */
  getOverview(workspaceId: string): Observable<WorkspaceOverview> {
    // Mock implementation - replace with actual Firestore query
    const overview = createEmptyOverview(workspaceId);
    return of(overview);
  }

  /**
   * Get recent activity for a workspace
   */
  getRecentActivity(workspaceId: string, limit: number = 10): Observable<ActivityItem[]> {
    // Mock implementation - replace with actual Firestore query
    return of([]);
  }

  /**
   * Get dashboard metrics for a workspace
   */
  getDashboardMetrics(workspaceId: string): Observable<DashboardMetrics> {
    // Mock implementation - replace with actual aggregation query
    return of({
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
      totalDocuments: 0,
      totalMembers: 0,
      recentTasksCount: 0,
      recentDocumentsCount: 0,
      recentActivityCount: 0,
    });
  }

  /**
   * Refresh overview data
   * Triggers recalculation of all metrics
   */
  refreshOverview(workspaceId: string): Observable<WorkspaceOverview> {
    return this.getOverview(workspaceId);
  }
}
