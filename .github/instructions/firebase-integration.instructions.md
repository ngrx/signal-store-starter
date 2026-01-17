---
description: 'Firebase integration patterns using @angular/fire. Service layer patterns for Auth, Firestore, Storage, Functions. Apply to all service files in core layer.'
applyTo: 'src/app/core/**/services/**/*'
---

# Firebase Integration Patterns

## Overview

This project uses `@angular/fire` for Firebase integration. All Firebase operations must be wrapped in service classes in the Infrastructure layer.

## Firebase Services Mapping

| Domain | Firebase Service | Purpose | Location |
|--------|------------------|---------|----------|
| Account/Auth | `@angular/fire/auth` | Authentication, claims, tokens | `src/app/core/auth/services/` |
| Workspace/Team/Partner | `@angular/fire/firestore` | Collections, queries, security rules | `src/app/core/workspace/services/` |
| Documents | `@angular/fire/storage` | File storage, uploads, downloads | `src/app/core/workspace/services/` |
| Events | `@angular/fire/functions` | Event triggers, callable functions | `src/app/core/event-bus/services/` |
| Config | `@angular/fire/remote-config` | Feature flags, A/B testing | `src/app/core/global-shell/services/` |
| Performance | `@angular/fire/performance` | Metrics, traces | `src/app/core/global-shell/services/` |

## Service Layer Principles

### Infrastructure Layer Only

Firebase services belong in the Infrastructure layer, never in Domain or Application layers:

```
❌ Domain Layer (models/) - NO Firebase imports
❌ Application Layer (stores/) - NO Firebase imports
✅ Infrastructure Layer (services/) - Firebase service wrappers
❌ Interface Layer (features/) - NO direct Firebase imports
```

### Service Wrapper Pattern

Always wrap Firebase operations in typed service classes:

```typescript
// ✅ GOOD: Service wrapper
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private firestore = inject(Firestore);
  
  getWorkspace(id: string): Observable<Workspace> {
    const docRef = doc(this.firestore, `workspaces/${id}`);
    return docData(docRef) as Observable<Workspace>;
  }
}

// ❌ BAD: Direct Firebase in store
export const WorkspaceStore = signalStore(
  withMethods(() => ({
    load: rxMethod<string>(
      pipe(
        switchMap((id) => {
          const firestore = inject(Firestore); // ❌ NO
          const docRef = doc(firestore, `workspaces/${id}`);
          return docData(docRef);
        })
      )
    )
  }))
);
```

## Firebase Auth (@angular/fire/auth)

### Auth Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  authState,
  User,
  UserCredential,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  
  // Auth state observable
  readonly authState$ = authState(this.auth);
  
  // Sign in with email/password
  signInWithEmailAndPassword(
    email: string, 
    password: string
  ): Observable<UserCredential> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    );
  }
  
  // Sign in with Google
  signInWithGoogle(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }
  
  // Sign out
  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
  
  // Get current user
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
  
  // Get ID token
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? await user.getIdToken() : null;
  }
  
  // Get custom claims
  async getCustomClaims(): Promise<Record<string, any> | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims;
  }
}
```

### Usage in Store

```typescript
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withMethods((store, authService = inject(AuthService)) => ({
    login: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(({ email, password }) => 
          authService.signInWithEmailAndPassword(email, password)
        ),
        tapResponse({
          next: (credential) => patchState(store, { 
            user: credential.user, 
            loading: false 
          }),
          error: (error) => patchState(store, { 
            error: error.message, 
            loading: false 
          })
        })
      )
    ),
    
    syncAuthState: rxMethod<void>(
      pipe(
        switchMap(() => authService.authState$),
        tapResponse({
          next: (user) => patchState(store, { user }),
          error: (error) => patchState(store, { error: error.message })
        })
      )
    )
  }))
);
```

## Firestore (@angular/fire/firestore)

### Firestore Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { 
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Workspace } from '../models/workspace.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private firestore = inject(Firestore);
  private collectionName = 'workspaces';
  
  // Get single document
  getWorkspace(id: string): Observable<Workspace> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Workspace>;
  }
  
  // Get collection with query
  getWorkspaces(accountId: string): Observable<Workspace[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('members', 'array-contains', accountId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Workspace[]>;
  }
  
  // Create document
  createWorkspace(workspace: Omit<Workspace, 'id'>): Observable<DocumentReference> {
    const collectionRef = collection(this.firestore, this.collectionName);
    return from(addDoc(collectionRef, workspace));
  }
  
  // Update document
  updateWorkspace(id: string, data: Partial<Workspace>): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(updateDoc(docRef, { ...data, updatedAt: new Date() }));
  }
  
  // Delete document
  deleteWorkspace(id: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(docRef));
  }
  
  // Complex query
  searchWorkspaces(params: {
    accountId: string;
    searchTerm?: string;
    limit?: number;
  }): Observable<Workspace[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    
    const constraints: QueryConstraint[] = [
      where('members', 'array-contains', params.accountId)
    ];
    
    if (params.searchTerm) {
      // Note: Firestore doesn't support full-text search
      // This is a simple prefix match
      constraints.push(where('name', '>=', params.searchTerm));
      constraints.push(where('name', '<=', params.searchTerm + '\uf8ff'));
    }
    
    if (params.limit) {
      constraints.push(limit(params.limit));
    }
    
    const q = query(collectionRef, ...constraints);
    return collectionData(q, { idField: 'id' }) as Observable<Workspace[]>;
  }
}
```

### Subcollection Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore = inject(Firestore);
  
  // Get tasks for a workspace (subcollection)
  getTasks(workspaceId: string): Observable<Task[]> {
    const collectionRef = collection(
      this.firestore, 
      `workspaces/${workspaceId}/tasks`
    );
    const q = query(
      collectionRef,
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }
  
  // Create task in workspace
  createTask(workspaceId: string, task: Omit<Task, 'id'>): Observable<DocumentReference> {
    const collectionRef = collection(
      this.firestore, 
      `workspaces/${workspaceId}/tasks`
    );
    return from(addDoc(collectionRef, {
      ...task,
      workspaceId, // Always include parent reference
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
}
```

### Batch Operations

```typescript
import { writeBatch } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private firestore = inject(Firestore);
  
  // Batch update multiple documents
  batchUpdateTasks(updates: Array<{ id: string; data: Partial<Task> }>): Observable<void> {
    const batch = writeBatch(this.firestore);
    
    updates.forEach(({ id, data }) => {
      const docRef = doc(this.firestore, `tasks/${id}`);
      batch.update(docRef, { ...data, updatedAt: new Date() });
    });
    
    return from(batch.commit());
  }
}
```

## Storage (@angular/fire/storage)

### Storage Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { 
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot
} from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DocumentStorageService {
  private storage = inject(Storage);
  
  // Upload file
  uploadFile(
    workspaceId: string,
    file: File,
    path: string
  ): Observable<string> {
    const filePath = `workspaces/${workspaceId}/documents/${path}/${file.name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return from(uploadTask).pipe(
      map(() => getDownloadURL(storageRef)),
      map((url) => from(url))
    ) as Observable<string>;
  }
  
  // Delete file
  deleteFile(filePath: string): Observable<void> {
    const storageRef = ref(this.storage, filePath);
    return from(deleteObject(storageRef));
  }
  
  // Get download URL
  getDownloadURL(filePath: string): Observable<string> {
    const storageRef = ref(this.storage, filePath);
    return from(getDownloadURL(storageRef));
  }
}
```

## Functions (@angular/fire/functions)

### Functions Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { 
  Functions,
  httpsCallable,
  HttpsCallableResult
} from '@angular/fire/functions';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceFunctionsService {
  private functions = inject(Functions);
  
  // Call cloud function
  createWorkspace(data: {
    name: string;
    ownerId: string;
  }): Observable<HttpsCallableResult<{ workspaceId: string }>> {
    const callable = httpsCallable(this.functions, 'createWorkspace');
    return from(callable(data));
  }
  
  // Call with typed response
  inviteMember(data: {
    workspaceId: string;
    email: string;
    role: string;
  }): Observable<{ invitationId: string }> {
    const callable = httpsCallable<typeof data, { invitationId: string }>(
      this.functions, 
      'inviteMember'
    );
    return from(callable(data)).pipe(
      map(result => result.data)
    );
  }
}
```

## Remote Config (@angular/fire/remote-config)

### Remote Config Service

```typescript
import { Injectable, inject } from '@angular/core';
import { 
  RemoteConfig,
  getValue,
  fetchAndActivate
} from '@angular/fire/remote-config';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private remoteConfig = inject(RemoteConfig);
  
  constructor() {
    // Set defaults
    this.remoteConfig.defaultConfig = {
      'feature_new_ui': false,
      'max_workspace_members': 50
    };
  }
  
  // Fetch and activate config
  fetchConfig(): Observable<boolean> {
    return from(fetchAndActivate(this.remoteConfig));
  }
  
  // Get config value
  getFeatureFlag(key: string): boolean {
    return getValue(this.remoteConfig, key).asBoolean();
  }
  
  getConfigNumber(key: string): number {
    return getValue(this.remoteConfig, key).asNumber();
  }
  
  getConfigString(key: string): string {
    return getValue(this.remoteConfig, key).asString();
  }
}
```

## Performance (@angular/fire/performance)

### Performance Service

```typescript
import { Injectable, inject } from '@angular/core';
import { 
  Performance,
  trace
} from '@angular/fire/performance';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private performance = inject(Performance);
  
  // Trace async operation
  async traceOperation<T>(
    name: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const t = trace(this.performance, name);
    t.start();
    
    try {
      const result = await operation();
      t.stop();
      return result;
    } catch (error) {
      t.stop();
      throw error;
    }
  }
  
  // Custom metric
  recordMetric(name: string, value: number) {
    const t = trace(this.performance, name);
    t.putMetric(name, value);
  }
}
```

## Error Handling

### Service Error Pattern

```typescript
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private firestore = inject(Firestore);
  
  getWorkspace(id: string): Observable<Workspace> {
    const docRef = doc(this.firestore, `workspaces/${id}`);
    return docData(docRef, { idField: 'id' }).pipe(
      catchError((error) => {
        console.error('Failed to load workspace:', error);
        return throwError(() => new Error('Failed to load workspace'));
      })
    ) as Observable<Workspace>;
  }
}
```

## Data Conversion

### Firestore Converters

```typescript
import { 
  DocumentData, 
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions
} from '@angular/fire/firestore';

// Define converter
const workspaceConverter: FirestoreDataConverter<Workspace> = {
  toFirestore(workspace: Workspace): DocumentData {
    return {
      name: workspace.name,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Workspace {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data['name'],
      ownerId: data['ownerId'],
      createdAt: data['createdAt']?.toDate(),
      updatedAt: data['updatedAt']?.toDate()
    };
  }
};

// Use converter
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private firestore = inject(Firestore);
  
  getWorkspace(id: string): Observable<Workspace> {
    const docRef = doc(this.firestore, `workspaces/${id}`)
      .withConverter(workspaceConverter);
    return docData(docRef);
  }
}
```

## Best Practices

### 1. Always Filter by Workspace
```typescript
// ✅ GOOD: Always include workspace filter
getTasks(workspaceId: string): Observable<Task[]> {
  const q = query(
    collection(this.firestore, 'tasks'),
    where('workspaceId', '==', workspaceId)
  );
  return collectionData(q);
}

// ❌ BAD: No workspace filter
getAllTasks(): Observable<Task[]> {
  return collectionData(collection(this.firestore, 'tasks'));
}
```

### 2. Use Converters for Type Safety
```typescript
// ✅ GOOD: Type-safe conversion
const docRef = doc(this.firestore, 'workspaces/1')
  .withConverter(workspaceConverter);
return docData(docRef); // Returns Observable<Workspace>

// ❌ BAD: Manual type assertion
return docData(docRef) as Observable<Workspace>;
```

### 3. Handle Timestamps Properly
```typescript
// ✅ GOOD: Convert Firestore Timestamp to Date
fromFirestore(snapshot): Workspace {
  const data = snapshot.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
}
```

### 4. Use Subcollections for Hierarchical Data
```typescript
// ✅ GOOD: Subcollection structure
/workspaces/{workspaceId}/tasks/{taskId}
/workspaces/{workspaceId}/members/{memberId}

// ❌ BAD: Flat structure with foreign keys
/tasks/{taskId} { workspaceId: '...' }
```

## Related Documentation
- [DDD Architecture](./ddd-architecture.instructions.md)
- [NgRx Signals](./ngrx-signals.instructions.md)
- [Firebase Integration Architecture](../../docs/architecture/08-firebase-integration.md)
