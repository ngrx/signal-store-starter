import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore, AuthStoreInstance } from '../../../core/auth/stores/auth.store';
import { AccountService } from '../../../core/account/services/account.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Account Settings</h1>
      <form [formGroup]="form" (ngSubmit)="save()">
        <label>
          Display name
          <input type="text" formControlName="displayName" placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" formControlName="email" [disabled]="true" />
        </label>
        <button type="submit" [disabled]="form.invalid || saving()">
          @if (saving()) { Saving... } @else { Save changes }
        </button>
        @if (message()) {
          <p class="success">{{ message() }}</p>
        }
      </form>
    </div>
  `,
  styles: [`
    .page { padding:24px; max-width:640px; margin:0 auto; display:flex; flex-direction:column; gap:16px; }
    h1 { margin:0; }
    form { display:flex; flex-direction:column; gap:12px; }
    label { display:flex; flex-direction:column; gap:6px; font-weight:600; }
    input { padding:10px; border-radius:8px; border:1px solid #ddd; }
    button { width:160px; padding:10px; border:none; border-radius:8px; background:#4f46e5; color:white; font-weight:700; cursor:pointer; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .success { color:#166534; margin:0; }
  `],
})
export class SettingsComponent {
  protected authStore = inject<AuthStoreInstance>(AuthStore);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  protected saving = signal(false);
  protected message = signal('');

  form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
  });

  // Reactive save method using rxMethod
  private saveEffect = rxMethod<{ uid: string; displayName: string }>(
    pipe(
      tap(() => {
        this.saving.set(true);
        this.message.set('');
      }),
      switchMap(({ uid, displayName }) =>
        this.accountService.updateAccount(uid, {
          displayName,
          updatedAt: new Date(),
        })
      ),
      tapResponse({
        next: () => {
          this.message.set('Settings saved');
          this.saving.set(false);
        },
        error: (err) => {
          console.error(err);
          this.message.set('Failed to save settings');
          this.saving.set(false);
        },
      })
    )
  );

  constructor() {
    // Initialize form with user data
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.form.patchValue({
          displayName: user.displayName ?? '',
          email: user.email ?? '',
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const user = this.authStore.user();
    if (!user) return;

    const displayName = this.form.getRawValue().displayName;
    this.saveEffect({ uid: user.uid, displayName });
  }
}
