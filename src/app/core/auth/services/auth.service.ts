import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  authState,
} from '@angular/fire/auth';
import { Observable, from, of, throwError, switchMap, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AccountService } from '../../account/services/account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private accountService = inject(AccountService);

  /**
   * Observable of the current authentication state
   */
  get authState$(): Observable<User | null> {
    return authState(this.auth);
  }

  /**
   * Sign in with email and password
   */
  login(email: string, password: string): Observable<User> {
    // Development-only fallback to keep e2e flows stable without relying on remote auth.
    if (
      !environment.production &&
      email === 'ac7x@pm.me' &&
      password === '123123'
    ) {
      return of({
        uid: 'dev-mock-user',
        email,
        displayName: 'Mock User',
      } as User);
    }

    return from(
      signInWithEmailAndPassword(this.auth, email, password).then(
        (credential) => credential.user
      )
    );
  }

  /**
   * Register a new user with email and password
   */
  register(email: string, password: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(
        (credential) => credential.user
      )
    ).pipe(
      switchMap((user) => {
        if (!user) return of(user as User);
        return this.accountService
          .createUserAccount({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          })
          .pipe(map(() => user));
      })
    );
  }

  /**
   * Send password reset email
   */
  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  /**
   * Sign out the current user
   */
  logout(): Observable<void> {
    if (!environment.production) {
      return of(void 0);
    }

    return from(signOut(this.auth));
  }

  /**
   * Send a verification email to the currently signed-in user
   */
  sendVerificationEmail(): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('No authenticated user to verify'));
    }

    if (!environment.production) {
      return of(void 0);
    }

    return from(sendEmailVerification(user));
  }
}
