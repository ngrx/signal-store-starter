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
import { Partner } from '../models/partner.model';

/**
 * PartnerService
 * Handles CRUD operations for partners (SubUnit - External) with reactive streams
 */
@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private firestore = inject(Firestore);
  private collectionName = 'partners';

  /**
   * Get partner by ID - reactive stream
   */
  getPartner(id: string): Observable<Partner | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef, { idField: 'id' }).pipe(
      map((data) => (data ? ({ ...data, id } as Partner) : null)),
      catchError(() => of(null))
    );
  }

  /**
   * Get all partners for an organization - reactive stream
   */
  getOrganizationPartners(organizationId: string): Observable<Partner[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('organizationId', '==', organizationId));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((data) => data as Partner[]),
      catchError(() => of([]))
    );
  }

  /**
   * List all partners (with optional filters) - reactive stream
   */
  list(filters: Record<string, any> = {}): Observable<Partner[]> {
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
      map((data) => data as Partner[]),
      catchError(() => of([]))
    );
  }

  /**
   * Create a new partner
   */
  createPartner(partner: Omit<Partner, 'id'>): Observable<string> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    return from(
      setDoc(docRef, partner).then(() => docRef.id)
    );
  }

  /**
   * Update an existing partner
   */
  updatePartner(id: string, data: Partial<Partner>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, data));
  }

  /**
   * Delete a partner
   */
  deletePartner(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }
}
