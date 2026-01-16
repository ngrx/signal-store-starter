import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContextStore, ContextStoreInstance } from '../../../../core/context/stores/context.store';

@Component({
  selector: 'app-create-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss']
})
export class CreateOrganizationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<ContextStoreInstance>(ContextStore);

  createForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Organization
  });

  // constructor() {
    // Reactive effects for store updates - ContextStore does not have error property
  // }

  onSubmit(): void {
    if (this.createForm.valid) {
      // TODO: Implement create Organization logic
      console.log('create Organization:', this.createForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
