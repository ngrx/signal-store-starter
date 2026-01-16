import { User } from '@angular/fire/auth';

export type AuthStatus = 'initializing' | 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  initialized: boolean; // Track if auth state has been determined at least once
}

export const initialAuthState: AuthState = {
  user: null,
  status: 'initializing', // Start in initializing state, not idle
  error: null,
  initialized: false, // Not initialized until first auth state check completes
};
