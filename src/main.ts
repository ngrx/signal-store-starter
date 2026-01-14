import { bootstrapApplication } from '@angular/platform-browser';
import { Component, inject } from '@angular/core';
import { QuizStore } from './quiz.store';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getDataConnect, provideDataConnect } from '@angular/fire/data-connect';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';

@Component({
  selector: 'app-root',
  template: `
    <h1>NgRx Signal Store Seed</h1>
    <p>Use this as a template to file any issues with the NgRx Signal Store.</p>
    <h2>{{ quizStore.title() }}</h2>
    <button (click)="quizStore.restart()">Restart</button>

    <p><b>Unanswered:</b> {{ quizStore.score.unanswered() }}</p>
    <p><b>Correct:</b> {{ quizStore.score.correct() }}</p>
    <p><b>Incorrect:</b> {{ quizStore.score.incorrect() }}</p>

    <hr />

    @for (question of quizStore.questions(); track question) {
      <div>
        <h3>{{ question.question }}</h3>
        <div>
          @for (choice of question.choices; track choice) {
            <button (click)="quizStore.answer(question.id, choice.id)">
              {{ choice.text }}
            </button>
          }
        </div>

        @if (question.status !== 'unanswered') {
          <div>
            @switch (question.status) {
              @case ('correct') {
                <p>Right Answer</p>
              }
              @case ('incorrect') {
                <p>Wrong Answer</p>
              }
            }

            <i>{{ question.explanation }}</i>
          </div>
        }
      </div>
    }
  `,
  providers: [QuizStore],
})
export class App {
  readonly quizStore = inject(QuizStore);
}

bootstrapApplication(App, {
  providers: [provideFirebaseApp(() => initializeApp({ projectId: "elite-chiller-455712-c4", appId: "1:7807661688:web:2864a76608f64ac61d1f8d", databaseURL: "https://elite-chiller-455712-c4-default-rtdb.asia-southeast1.firebasedatabase.app", storageBucket: "elite-chiller-455712-c4.firebasestorage.app", apiKey: "AIzaSyCJ-eayGjJwBKsNIh3oEAG2GjbfTrvAMEI", authDomain: "elite-chiller-455712-c4.firebaseapp.com", messagingSenderId: "7807661688", measurementId: "G-46E86BNYM7", 
  })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideAppCheck(() => {
  // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
  const provider = new ReCaptchaEnterpriseProvider('6LeEPkksAAAAACnwP_vo-8h5KOWZCSvIeM0C2_xB');
  return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
}), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideDataConnect(() => getDataConnect({connector: "example",location: "northamerica-northeast1",service: "signal-store-starter"})), provideFunctions(() => getFunctions()), provideMessaging(() => getMessaging()), providePerformance(() => getPerformance()), provideStorage(() => getStorage()), provideRemoteConfig(() => getRemoteConfig()), provideVertexAI(() => getVertexAI())]
});
