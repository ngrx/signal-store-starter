import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkspaceDocument } from '../state/document.state';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  getDocuments(workspaceId: string): Observable<WorkspaceDocument[]> {
    return of([
      {
        id: `${workspaceId}-doc-1`,
        workspaceId,
        title: 'Getting Started',
        updatedAt: new Date(),
      },
    ]);
  }
}
