import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContextStore, ContextStoreInstance} from '../../../../core/context/stores/context.store';

@Component({
  selector: 'app-delete-partner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './delete-partner.component.html',
  styleUrls: ['./delete-partner.component.scss']
})
export class DeletePartnerComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<ContextStoreInstance>(ContextStore);

  deleteForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Partner
  });

  // constructor() {
    // Reactive effects for store updates - ContextStore does not have error property
  // }

  onSubmit(): void {
    if (this.deleteForm.valid) {
      // TODO: Implement delete Partner logic
      console.log('delete Partner:', this.deleteForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
