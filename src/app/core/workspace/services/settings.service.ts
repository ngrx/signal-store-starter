import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkspaceSettingsState } from '../state/settings.state';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  getSettings(workspaceId: string): Observable<WorkspaceSettingsState> {
    return of({
      workspaceId,
      theme: 'light',
      timezone: 'UTC',
    });
  }
}
