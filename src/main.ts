import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'elite-chiller-455712-c4',
        appId: '1:7807661688:web:2864a76608f64ac61d1f8d',
        databaseURL:
          'https://elite-chiller-455712-c4-default-rtdb.asia-southeast1.firebasedatabase.app',
        storageBucket: 'elite-chiller-455712-c4.firebasestorage.app',
        apiKey: 'AIzaSyCJ-eayGjJwBKsNIh3oEAG2GjbfTrvAMEI',
        authDomain: 'elite-chiller-455712-c4.firebaseapp.com',
        messagingSenderId: '7807661688',
        measurementId: 'G-46E86BNYM7',
      })
    ),
    provideAuth(() => getAuth()),
  ],
});
