import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationStore, OrganizationStoreInstance } from '../../../core/organization/stores/organization.store';

@Component({
  selector: 'app-edit-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.scss']
})
export class EditOrganizationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<OrganizationStoreInstance>(OrganizationStore);

  editForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Organization
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Organization edit error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      // TODO: Implement edit Organization logic
      console.log('edit Organization:', this.editForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
