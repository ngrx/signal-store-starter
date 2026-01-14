import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getDataConnect, provideDataConnect } from '@angular/fire/data-connect';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';

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
    provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({ projectId: "elite-chiller-455712-c4", appId: "1:7807661688:web:2864a76608f64ac61d1f8d", databaseURL: "https://elite-chiller-455712-c4-default-rtdb.asia-southeast1.firebasedatabase.app", storageBucket: "elite-chiller-455712-c4.firebasestorage.app", apiKey: "AIzaSyCJ-eayGjJwBKsNIh3oEAG2GjbfTrvAMEI", authDomain: "elite-chiller-455712-c4.firebaseapp.com", messagingSenderId: "7807661688", measurementId: "G-46E86BNYM7", projectNumber: "7807661688", version: "2" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideAppCheck(() => {
  // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
  const provider = new ReCaptchaEnterpriseProvider(/* reCAPTCHA Enterprise site key */);
  return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
}), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideDataConnect(() => getDataConnect({connector: "example",location: "northamerica-northeast1",service: "signal-store-starter"})), provideFunctions(() => getFunctions()), provideMessaging(() => getMessaging()), providePerformance(() => getPerformance()), provideStorage(() => getStorage()), provideRemoteConfig(() => getRemoteConfig()), provideVertexAI(() => getVertexAI()),
  ],
});
