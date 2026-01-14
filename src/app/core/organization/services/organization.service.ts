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
import { Organization } from '../models/organization.model';

/**
 * OrganizationService
 * Handles CRUD operations for organizations using Firestore with reactive streams
 */
@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private firestore = inject(Firestore);
  private collectionName = 'organizations';

  /**
   * Get organization by ID - reactive stream that updates in real-time
   */
  getOrganization(id: string): Observable<Organization | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef, { idField: 'id' }).pipe(
      map((data) => (data ? ({ ...data, id } as Organization) : null)),
      catchError(() => of(null))
    );
  }

  /**
   * Get all organizations for a user - reactive stream
   */
  getUserOrganizations(userId: string): Observable<Organization[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('createdBy', '==', userId));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((data) => data as Organization[]),
      catchError(() => of([]))
    );
  }

  /**
   * List all organizations (with optional filters) - reactive stream
   */
  list(filters: Record<string, any> = {}): Observable<Organization[]> {
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
      map((data) => data as Organization[]),
      catchError(() => of([]))
    );
  }

  /**
   * Create a new organization
   */
  createOrganization(organization: Omit<Organization, 'id'>): Observable<string> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    return from(
      setDoc(docRef, organization).then(() => docRef.id)
    );
  }

  /**
   * Update an existing organization
   */
  updateOrganization(id: string, data: Partial<Organization>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, data));
  }

  /**
   * Delete an organization
   */
  deleteOrganization(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }
}
