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
import { Partner } from '../models/partner.model';

/**
 * PartnerService
 * Handles CRUD operations for partners (SubUnit - External)
 */
@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private firestore = inject(Firestore);
  private collectionName = 'partners';

  /**
   * Get partner by ID
   */
  getPartner(id: string): Observable<Partner | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(
      getDoc(docRef).then((snapshot) => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Partner;
        }
        return null;
      })
    );
  }

  /**
   * Get all partners for an organization
   */
  getOrganizationPartners(organizationId: string): Observable<Partner[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('organizationId', '==', organizationId));
    
    return from(
      getDocs(q).then((snapshot) => {
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Partner)
        );
      })
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
