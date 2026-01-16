/**
 * WorkspaceList Service
 * Per prd-sup.md section on WorkspaceListStore
 */

import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { WorkspaceListItem, WorkspaceMembership } from '../models/workspace-list.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceListService {
  private firestore = inject(Firestore);
  private workspacesCollection = 'workspaces';
  private membershipsCollection = 'workspace-memberships';

  /**
   * Get all workspaces for the current user
   * Queries Firestore for workspaces where user is a member
   */
  getWorkspaces(userId: string): Observable<WorkspaceListItem[]> {
    const membershipsRef = collection(this.firestore, this.membershipsCollection);
    const q = query(membershipsRef, where('userId', '==', userId));
    
    return from(
      getDocs(q).then(async (snapshot) => {
        const workspaces: WorkspaceListItem[] = [];
        
        for (const membershipDoc of snapshot.docs) {
          const membership = membershipDoc.data() as WorkspaceMembership;
          const workspaceId = membershipDoc.data()['workspaceId'];
          
          // Get workspace details
          const workspaceRef = doc(this.firestore, this.workspacesCollection, workspaceId);
          const workspaceSnap = await getDoc(workspaceRef);
          
          if (workspaceSnap.exists()) {
            const workspaceData = workspaceSnap.data();
            workspaces.push({
              id: workspaceSnap.id,
              name: workspaceData['name'] || '',
              type: workspaceData['type'] || 'project',
              description: workspaceData['description'] || '',
              avatarUrl: workspaceData['avatarUrl'],
              membership,
              isFavorite: membership.isFavorite || false,
              createdAt: workspaceData['createdAt']?.toDate() || new Date(),
              updatedAt: workspaceData['updatedAt']?.toDate() || new Date(),
            });
          }
        }
        
        return workspaces;
      })
    );
  }

  /**
   * Get workspace membership details
   */
  getMembership(workspaceId: string, userId: string): Observable<WorkspaceMembership | null> {
    const membershipsRef = collection(this.firestore, this.membershipsCollection);
    const q = query(
      membershipsRef,
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId)
    );
    
    return from(
      getDocs(q).then((snapshot) => {
        if (snapshot.empty) return null;
        if (!snapshot.docs[0]) return null;
        return snapshot.docs[0].data() as WorkspaceMembership;
      })
    );
  }

  /**
   * Create a new workspace
   */
  createWorkspace(workspace: Omit<WorkspaceListItem, 'id'>): Observable<string> {
    const workspaceRef = doc(collection(this.firestore, this.workspacesCollection));
    const workspaceId = workspaceRef.id;
    
    return from(
      setDoc(workspaceRef, {
        name: workspace.name,
        type: workspace.type,
        description: workspace.description,
        avatarUrl: workspace.avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).then(() => workspaceId)
    );
  }

  /**
   * Update workspace
   */
  updateWorkspace(workspaceId: string, updates: Partial<WorkspaceListItem>): Observable<void> {
    const workspaceRef = doc(this.firestore, this.workspacesCollection, workspaceId);
    return from(
      updateDoc(workspaceRef, {
        ...updates,
        updatedAt: new Date(),
      })
    );
  }

  /**
   * Archive workspace
   */
  archiveWorkspace(workspaceId: string): Observable<void> {
    const workspaceRef = doc(this.firestore, this.workspacesCollection, workspaceId);
    return from(
      updateDoc(workspaceRef, {
        archived: true,
        updatedAt: new Date(),
      })
    );
  }

  /**
   * Leave workspace
   */
  leaveWorkspace(workspaceId: string, userId: string): Observable<void> {
    const membershipsRef = collection(this.firestore, this.membershipsCollection);
    const q = query(
      membershipsRef,
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId)
    );
    
    return from(
      getDocs(q).then(async (snapshot) => {
        if (!snapshot.empty && snapshot.docs[0]) {
          await updateDoc(snapshot.docs[0].ref, {
            status: 'Left',
            updatedAt: new Date(),
          });
        }
      })
    );
  }

  /**
   * Toggle favorite
   */
  toggleFavorite(workspaceId: string, userId: string, isFavorite: boolean): Observable<void> {
    const membershipsRef = collection(this.firestore, this.membershipsCollection);
    const q = query(
      membershipsRef,
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId)
    );
    
    return from(
      getDocs(q).then(async (snapshot) => {
        if (!snapshot.empty && snapshot.docs[0]) {
          await updateDoc(snapshot.docs[0].ref, {
            isFavorite,
            updatedAt: new Date(),
          });
        }
      })
    );
  }

  /**
   * Update last accessed time
   */
  updateLastAccessed(workspaceId: string, userId: string): Observable<void> {
    const membershipsRef = collection(this.firestore, this.membershipsCollection);
    const q = query(
      membershipsRef,
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId)
    );
    
    return from(
      getDocs(q).then(async (snapshot) => {
        if (!snapshot.empty && snapshot.docs[0]) {
          await updateDoc(snapshot.docs[0].ref, {
            lastAccessedAt: new Date(),
          });
        }
      })
    );
  }
}
