import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  listAll,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { from, map, mergeMap, Observable, of } from 'rxjs';
import { DocumentAsset } from '../models/workspace.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentStorageService {
  private storage = inject(Storage);

  list(workspaceId: string): Observable<DocumentAsset[]> {
    if (!workspaceId) return of([]);
    const baseRef = ref(this.storage, `workspaces/${workspaceId}/documents`);
    return from(listAll(baseRef)).pipe(
      mergeMap((list) =>
        from(
          Promise.all(
            list.items.map(async (itemRef) => {
              const downloadUrl = await getDownloadURL(itemRef);
              return {
                id: itemRef.name,
                name: itemRef.name,
                size: 0,
                downloadUrl,
                contentType: itemRef.name.split('.').pop() || 'unknown',
                uploadedAt: Date.now(),
                workspaceId,
                uploadedBy: 'system',
              } as DocumentAsset;
            })
          )
        )
      )
    );
  }

  upload(workspaceId: string, file: File, uploadedBy: string): Observable<DocumentAsset> {
    if (!workspaceId) return of({} as DocumentAsset);
    const target = ref(this.storage, `workspaces/${workspaceId}/documents/${file.name}`);
    return from(uploadBytes(target, file)).pipe(
      mergeMap(() => getDownloadURL(target)),
      map(
        (downloadUrl): DocumentAsset => ({
          id: file.name,
          name: file.name,
          size: file.size,
          downloadUrl,
          contentType: file.type,
          uploadedAt: Date.now(),
          workspaceId,
          uploadedBy,
        })
      )
    );
  }
}
