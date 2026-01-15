import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  collectionData,
  query,
  where,
  QueryConstraint,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateProjectPayload, Project, applyProjectScopes } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private firestore = inject(Firestore);
  private collectionName = 'projects';

  list(filters: Record<string, any> = {}): Observable<Project[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const constraints: QueryConstraint[] = [];

    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(field, '==', value));
      }
    });

    const q = constraints.length ? query(collectionRef, ...constraints) : collectionRef;
    return collectionData(q, { idField: 'id' }).pipe(
      map((data) => data as Project[]),
      catchError(() => of([]))
    );
  }

  create(ownerId: string, payload: CreateProjectPayload): Observable<string> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const now = new Date();
    const project: Project = {
      id: docRef.id,
      name: payload.name,
      description: payload.description ?? '',
      ownerId,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      ...applyProjectScopes(payload),
    };

    return from(setDoc(docRef, project).then(() => docRef.id)).pipe(
      catchError((error) => {
        throw new Error(error?.message || 'Failed to create project');
      })
    );
  }
}
