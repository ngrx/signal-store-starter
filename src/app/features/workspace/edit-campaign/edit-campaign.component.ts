import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-edit-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.scss']
})
export class EditCampaignComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  editForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Campaign
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Campaign edit error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      // TODO: Implement edit Campaign logic
      console.log('edit Campaign:', this.editForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
