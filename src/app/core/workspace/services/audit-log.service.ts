import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuditEntry } from '../models/workspace.model';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private entries$ = new BehaviorSubject<AuditEntry[]>([]);

  list(workspaceId: string): Observable<AuditEntry[]> {
    return this.entries$.asObservable();
  }

  record(entry: AuditEntry): void {
    const current = this.entries$.value;
    this.entries$.next([entry, ...current].slice(0, 50));
  }
}
