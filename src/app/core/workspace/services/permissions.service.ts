import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkspacePermission } from '../state/permission.state';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  getPermissions(workspaceId: string): Observable<WorkspacePermission[]> {
    return of([
      {
        id: `${workspaceId}-owner`,
        workspaceId,
        role: 'owner',
        principal: 'you',
      },
    ]);
  }
}
