import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountStore, AccountStoreInstance } from '../../../core/account/stores/account.store';

@Component({
  selector: 'app-create-bot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-bot.component.html',
  styleUrls: ['./create-bot.component.scss']
})
export class CreateBotComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<AccountStoreInstance>(AccountStore);

  createForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Bot
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Bot create error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      // TODO: Implement create Bot logic
      console.log('create Bot:', this.createForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
