import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkspaceSettings } from '../models/workspace.model';

const defaultSettings: WorkspaceSettings = {
  notifications: true,
  theme: 'system',
  defaultWorkspaceId: null,
  preferences: {
    compactView: false,
    auditEmails: false,
  },
};

@Injectable({
  providedIn: 'root',
})
export class WorkspaceSettingsService {
  private settings$ = new BehaviorSubject<WorkspaceSettings>(defaultSettings);

  load(workspaceId: string | null): Observable<WorkspaceSettings> {
    // In a full implementation this would read from Firestore.
    // For now we keep a per-session copy to simulate persistence.
    return this.settings$.asObservable();
  }

  save(settings: WorkspaceSettings): void {
    this.settings$.next({ ...settings });
  }
}
