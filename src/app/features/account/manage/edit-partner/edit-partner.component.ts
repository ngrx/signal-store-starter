import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContextStore, ContextStoreInstance} from '../../../../core/context/stores/context.store';

@Component({
  selector: 'app-edit-partner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-partner.component.html',
  styleUrls: ['./edit-partner.component.scss']
})
export class EditPartnerComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<ContextStoreInstance>(ContextStore);

  editForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Partner
  });

  // constructor() {
    // Reactive effects for store updates - ContextStore does not have error property
  // }

  onSubmit(): void {
    if (this.editForm.valid) {
      // TODO: Implement edit Partner logic
      console.log('edit Partner:', this.editForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
