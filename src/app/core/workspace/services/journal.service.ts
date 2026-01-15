import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JournalEntry } from '../models/workspace.model';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private entries$ = new BehaviorSubject<JournalEntry[]>([]);

  list(workspaceId: string): Observable<JournalEntry[]> {
    return this.entries$.asObservable();
  }

  add(entry: JournalEntry): void {
    this.entries$.next([entry, ...this.entries$.value]);
  }

  update(entry: JournalEntry): void {
    this.entries$.next(
      this.entries$.value.map((e) => (e.id === entry.id ? entry : e))
    );
  }
}
