import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-edit-settings-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-settings-module.component.html',
  styleUrls: ['./edit-settings-module.component.scss']
})
export class EditSettingsModuleComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  editForm: FormGroup = this.fb.group({
    // TODO: Add form controls for SettingsModule
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('SettingsModule edit error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      // TODO: Implement edit SettingsModule logic
      console.log('edit SettingsModule:', this.editForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
