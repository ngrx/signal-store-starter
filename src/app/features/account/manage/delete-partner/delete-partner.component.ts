import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PartnerStore, PartnerStoreInstance } from '../../../core/partner/stores/partner.store';

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
  protected store = inject<PartnerStoreInstance>(PartnerStore);

  deleteForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Partner
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Partner delete error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

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
