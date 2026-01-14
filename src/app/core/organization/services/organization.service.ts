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
import { Organization } from '../models/organization.model';

/**
 * OrganizationService
 * Handles CRUD operations for organizations using Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private firestore = inject(Firestore);
  private collectionName = 'organizations';

  /**
   * Get organization by ID
   */
  getOrganization(id: string): Observable<Organization | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(
      getDoc(docRef).then((snapshot) => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Organization;
        }
        return null;
      })
    );
  }

  /**
   * Get all organizations for a user
   */
  getUserOrganizations(userId: string): Observable<Organization[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('createdBy', '==', userId));
    
    return from(
      getDocs(q).then((snapshot) => {
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Organization)
        );
      })
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
