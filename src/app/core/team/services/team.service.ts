import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  collectionData,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Team } from '../models/team.model';

/**
 * TeamService
 * Handles CRUD operations for teams (SubUnit - Internal) with reactive streams
 */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private firestore = inject(Firestore);
  private collectionName = 'teams';

  /**
   * Get team by ID - reactive stream
   */
  getTeam(id: string): Observable<Team | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef, { idField: 'id' }).pipe(
      map((data) => (data ? ({ ...data, id } as Team) : null)),
      catchError(() => of(null))
    );
  }

  /**
   * Get all teams for an organization - reactive stream
   */
  getOrganizationTeams(organizationId: string): Observable<Team[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('organizationId', '==', organizationId));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((data) => data as Team[]),
      catchError(() => of([]))
    );
  }

  /**
   * List all teams (with optional filters) - reactive stream
   */
  list(filters: Record<string, any> = {}): Observable<Team[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    
    // Build query constraints from filters
    const constraints: QueryConstraint[] = [];
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null) {
        constraints.push(where(field, '==', value));
      }
    });
    
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((data) => data as Team[]),
      catchError(() => of([]))
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
