import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  docData,
  updateDoc,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private firestore = inject(Firestore);
  private collectionName = 'accounts';

  createUserAccount(user: { uid: string; email?: string | null; displayName?: string | null }): Observable<void> {
    const docRef = doc(collection(this.firestore, this.collectionName), user.uid);
    const account: Account = {
      id: user.uid,
      type: 'user',
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        emailVerified: false,
      },
    };
    return from(setDoc(docRef, account));
  }

  getAccount(id: string): Observable<Account | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef, { idField: 'id' }).pipe(
      map((data) => (data ? (data as Account) : null))
    );
  }

  updateAccount(id: string, data: Partial<Account>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, data));
  }
}
