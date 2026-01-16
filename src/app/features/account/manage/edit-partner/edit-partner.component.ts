import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PartnerStore, PartnerStoreInstance } from '../../../core/partner/stores/partner.store';

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
  protected store = inject<PartnerStoreInstance>(PartnerStore);

  editForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Partner
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Partner edit error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

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
