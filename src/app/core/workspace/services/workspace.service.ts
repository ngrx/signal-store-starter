import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Workspace } from '../models/workspace.model';

/**
 * WorkspaceService
 * Handles CRUD operations for workspaces
 */
@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private firestore = inject(Firestore);
  private collectionName = 'workspaces';

  /**
   * Get workspace by ID
   */
  getWorkspace(id: string): Observable<Workspace | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(
      getDoc(docRef).then((snapshot) => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Workspace;
        }
        return null;
      })
    );
  }

  /**
   * Get all workspaces for an organization
   */
  getOrganizationWorkspaces(organizationId: string): Observable<Workspace[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('organizationId', '==', organizationId));
    
    return from(
      getDocs(q).then((snapshot) => {
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Workspace)
        );
      })
    );
  }

  /**
   * Create a new workspace
   */
  createWorkspace(workspace: Omit<Workspace, 'id'>): Observable<string> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    return from(
      setDoc(docRef, workspace).then(() => docRef.id)
    );
  }

  /**
   * Update an existing workspace
   */
  updateWorkspace(id: string, data: Partial<Workspace>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, data));
  }

  /**
   * Delete a workspace
   */
  deleteWorkspace(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }
}
