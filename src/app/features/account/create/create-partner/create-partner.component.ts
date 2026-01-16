import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PartnerStore, PartnerStoreInstance } from '../../../core/partner/stores/partner.store';

@Component({
  selector: 'app-create-partner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-partner.component.html',
  styleUrls: ['./create-partner.component.scss']
})
export class CreatePartnerComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<PartnerStoreInstance>(PartnerStore);

  createForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Partner
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Partner create error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      // TODO: Implement create Partner logic
      console.log('create Partner:', this.createForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
