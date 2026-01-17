import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-create-settings-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-settings-module.component.html',
  styleUrls: ['./create-settings-module.component.scss']
})
export class CreateSettingsModuleComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  createForm: FormGroup = this.fb.group({
    // TODO: Add form controls for SettingsModule
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('SettingsModule create error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      // TODO: Implement create SettingsModule logic
      console.log('create SettingsModule:', this.createForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
