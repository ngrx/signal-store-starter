import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  createForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Client
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Client create error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      // TODO: Implement create Client logic
      console.log('create Client:', this.createForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
