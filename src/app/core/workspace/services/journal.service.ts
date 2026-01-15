import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { JournalEntry } from '../state/journal.state';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  getEntries(workspaceId: string): Observable<JournalEntry[]> {
    return of([
      {
        id: `${workspaceId}-journal-1`,
        workspaceId,
        content: 'Workspace initialized',
        createdAt: new Date(),
      },
    ]);
  }
}
