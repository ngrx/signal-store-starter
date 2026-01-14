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
import { Team } from '../models/team.model';

/**
 * TeamService
 * Handles CRUD operations for teams (SubUnit - Internal)
 */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private firestore = inject(Firestore);
  private collectionName = 'teams';

  /**
   * Get team by ID
   */
  getTeam(id: string): Observable<Team | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(
      getDoc(docRef).then((snapshot) => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Team;
        }
        return null;
      })
    );
  }

  /**
   * Get all teams for an organization
   */
  getOrganizationTeams(organizationId: string): Observable<Team[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('organizationId', '==', organizationId));
    
    return from(
      getDocs(q).then((snapshot) => {
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Team)
        );
      })
    );
  }

  /**
   * Create a new team
   */
  createTeam(team: Omit<Team, 'id'>): Observable<string> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    return from(
      setDoc(docRef, team).then(() => docRef.id)
    );
  }

  /**
   * Update an existing team
   */
  updateTeam(id: string, data: Partial<Team>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, data));
  }

  /**
   * Delete a team
   */
  deleteTeam(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }
}
