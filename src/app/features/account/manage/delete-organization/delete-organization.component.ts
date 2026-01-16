import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationStore, OrganizationStoreInstance } from '../../../core/organization/stores/organization.store';

@Component({
  selector: 'app-delete-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './delete-organization.component.html',
  styleUrls: ['./delete-organization.component.scss']
})
export class DeleteOrganizationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<OrganizationStoreInstance>(OrganizationStore);

  deleteForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Organization
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Organization delete error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.deleteForm.valid) {
      // TODO: Implement delete Organization logic
      console.log('delete Organization:', this.deleteForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
