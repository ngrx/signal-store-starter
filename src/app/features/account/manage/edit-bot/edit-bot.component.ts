import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountStore, AccountStoreInstance } from '../../../core/account/stores/account.store';

@Component({
  selector: 'app-edit-bot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-bot.component.html',
  styleUrls: ['./edit-bot.component.scss']
})
export class EditBotComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<AccountStoreInstance>(AccountStore);

  editForm: FormGroup = this.fb.group({
    // TODO: Add form controls for Bot
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('Bot edit error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      // TODO: Implement edit Bot logic
      console.log('edit Bot:', this.editForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
