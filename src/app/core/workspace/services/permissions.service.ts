import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Capability, RoleMatrixRow } from '../models/workspace.model';

const defaultRoles: RoleMatrixRow[] = [
  {
    role: 'owner',
    capabilities: [
      'documents:read',
      'documents:write',
      'settings:write',
      'audit:read',
      'journal:write',
      'permissions:manage',
    ],
    description: 'Full control',
  },
  {
    role: 'editor',
    capabilities: [
      'documents:read',
      'documents:write',
      'journal:write',
      'audit:read',
    ],
    description: 'Can edit documents and journal',
  },
  {
    role: 'viewer',
    capabilities: ['documents:read', 'audit:read'],
    description: 'Read-only',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private roles$ = new BehaviorSubject<RoleMatrixRow[]>(defaultRoles);

  list(): Observable<RoleMatrixRow[]> {
    return this.roles$.asObservable();
  }

  toggle(role: string, capability: Capability, enabled: boolean): void {
    const updated = this.roles$.value.map((row) =>
      row.role !== role
        ? row
        : {
            ...row,
            capabilities: enabled
              ? Array.from(new Set([...row.capabilities, capability]))
              : row.capabilities.filter((cap) => cap !== capability),
          }
    );
    this.roles$.next(updated);
  }
}
