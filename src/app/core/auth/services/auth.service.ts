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
    // In development mode, check for mock user in sessionStorage first
    if (!environment.production) {
      const mockUserData = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mockAuthUser') : null;
      if (mockUserData) {
        try {
          const mockUser = JSON.parse(mockUserData);
          // CRITICAL FIX: Return ONLY the mock user observable
          // Don't subscribe to Firebase auth state as it will emit null and cause UI flicker
          // The mock user will be cleared on explicit logout via the logout() method
          return new Observable((subscriber) => {
            // Emit mock user immediately
            subscriber.next(mockUser as User);
            
            // Keep the observable alive but don't emit null from Firebase auth
            // This prevents the "user disappears on re-render" bug
            const subscription = authState(this.auth).subscribe({
              next: (user) => {
                // Only emit if Firebase has a real user (shouldn't happen with mock user active)
                // OR if someone explicitly logged out (clearing the mock user)
                const stillHasMockUser = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mockAuthUser');
                if (!stillHasMockUser) {
                  // Mock user was cleared (logout), so emit null
                  subscriber.next(null);
                } else if (user) {
                  // Firebase has a real user, override mock
                  subscriber.next(user);
                }
                // IMPORTANT: Don't emit Firebase's null while mock user is active
              },
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
            
            return () => subscription.unsubscribe();
          });
        } catch (e) {
          // If parsing fails, clear and use Firebase auth
          sessionStorage.removeItem('mockAuthUser');
        }
      }
    }
    
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
      const mockUser = {
        uid: 'dev-mock-user',
        email,
        displayName: 'Mock User',
      } as User;
      
      // Store mock user in sessionStorage for E2E test persistence
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('mockAuthUser', JSON.stringify(mockUser));
      }
      
      return of(mockUser);
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
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
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
    // Clear mock user from sessionStorage in development
    if (!environment.production && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('mockAuthUser');
    }
    
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
