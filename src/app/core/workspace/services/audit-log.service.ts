import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuditLogEntry } from '../state/audit.state';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  /**
   * In a real app, this would call Firestore/HTTP. Here we return a reactive stub.
   */
  getAuditLog(workspaceId: string): Observable<AuditLogEntry[]> {
    return of([
      {
        id: `${workspaceId}-seed`,
        workspaceId,
        action: 'workspace-created',
        createdAt: new Date(),
      },
    ]);
  }
}
