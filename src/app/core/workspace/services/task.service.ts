/**
 * Task Service - Firestore integration for tasks
 * Following modern reactive patterns with collectionData/docData
 * PRD: @angular/fire/firestore (Transaction | Batch | Query)
 */

import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  query,
  where,
  orderBy,
  QueryConstraint,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Task, Workflow, TaskFilter } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');
  private workflowsCollection = collection(this.firestore, 'workflows');

  /**
   * Get all tasks for a workspace with real-time updates
   */
  getTasks(workspaceId: string, filter?: TaskFilter): Observable<Task[]> {
    const constraints: QueryConstraint[] = [
      where('workspaceId', '==', workspaceId),
    ];

    if (filter?.status && filter.status.length > 0) {
      constraints.push(where('status', 'in', filter.status));
    }

    if (filter?.priority && filter.priority.length > 0) {
      constraints.push(where('priority', 'in', filter.priority));
    }

    if (filter?.assigneeId) {
      constraints.push(where('assigneeId', '==', filter.assigneeId));
    }

    if (filter?.workflowId) {
      constraints.push(where('workflowId', '==', filter.workflowId));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(this.tasksCollection, ...constraints);

    return collectionData(q, { idField: 'id' }).pipe(
      map((tasks) => tasks.map((task) => this.convertTimestamps(task as any))),
      catchError((error) => {
        console.error('Error fetching tasks:', error);
        return of([]);
      })
    );
  }

  /**
   * Get single task by ID with real-time updates
   */
  getTask(id: string): Observable<Task | null> {
    const taskDoc = doc(this.tasksCollection, id);
    return docData(taskDoc, { idField: 'id' }).pipe(
      map((task) => (task ? this.convertTimestamps(task as any) : null)),
      catchError(() => of(null))
    );
  }

  /**
   * Get all workflows for a workspace
   */
  getWorkflows(workspaceId: string): Observable<Workflow[]> {
    const q = query(
      this.workflowsCollection,
      where('workspaceId', '==', workspaceId),
      orderBy('name', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((workflows) =>
        workflows.map((wf) => this.convertTimestamps(wf as any))
      ),
      catchError(() => of([]))
    );
  }

  /**
   * Create a new task
   */
  createTask(task: Omit<Task, 'id'>): Observable<string> {
    const taskData = {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    return new Observable<string>((observer) => {
      addDoc(this.tasksCollection, taskData)
        .then((docRef) => {
          observer.next(docRef.id);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Update task status using Firestore transaction
   * Ensures atomic updates for progress calculations
   */
  updateTaskStatus(taskId: string, status: Task['status']): Observable<void> {
    return new Observable<void>((observer) => {
      const taskDoc = doc(this.tasksCollection, taskId);

      runTransaction(this.firestore, async (transaction) => {
        const taskSnapshot = await transaction.get(taskDoc);
        if (!taskSnapshot.exists()) {
          throw new Error('Task not found');
        }

        const updateData: any = {
          status,
          updatedAt: serverTimestamp(),
        };

        if (status === 'done') {
          updateData.completedDate = serverTimestamp();
          updateData.progress = 100;
        }

        transaction.update(taskDoc, updateData);
      })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Update task details
   */
  updateTask(taskId: string, updates: Partial<Task>): Observable<void> {
    const taskDoc = doc(this.tasksCollection, taskId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    return new Observable<void>((observer) => {
      updateDoc(taskDoc, updateData)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Delete task (with cascade for subtasks using batch)
   */
  deleteTask(taskId: string, cascadeChildren = true): Observable<void> {
    return new Observable<void>((observer) => {
      if (!cascadeChildren) {
        const taskDoc = doc(this.tasksCollection, taskId);
        deleteDoc(taskDoc)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch((error) => observer.error(error));
        return;
      }

      // Get all child tasks and delete in batch
      const childQuery = query(
        this.tasksCollection,
        where('parentId', '==', taskId)
      );

      collectionData(childQuery, { idField: 'id' })
        .pipe(
          map((children) => {
            const batch = writeBatch(this.firestore);
            const taskDoc = doc(this.tasksCollection, taskId);
            batch.delete(taskDoc);

            children.forEach((child: any) => {
              const childDoc = doc(this.tasksCollection, child.id);
              batch.delete(childDoc);
            });

            return batch;
          })
        )
        .subscribe({
          next: (batch) => {
            batch
              .commit()
              .then(() => {
                observer.next();
                observer.complete();
              })
              .catch((error) => observer.error(error));
          },
          error: (error) => observer.error(error),
        });
    });
  }

  /**
   * Reorder tasks using batch update
   */
  reorderTasks(tasks: { id: string; order: number }[]): Observable<void> {
    return new Observable<void>((observer) => {
      const batch = writeBatch(this.firestore);

      tasks.forEach(({ id, order }) => {
        const taskDoc = doc(this.tasksCollection, id);
        batch.update(taskDoc, { order, updatedAt: serverTimestamp() });
      });

      batch
        .commit()
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Convert Firestore Timestamps to Date objects
   */
  private convertTimestamps(data: any): any {
    const result = { ...data };

    ['createdAt', 'updatedAt', 'startDate', 'dueDate', 'completedDate'].forEach(
      (field) => {
        if (result[field] instanceof Timestamp) {
          result[field] = result[field].toDate();
        }
      }
    );

    return result;
  }
}
