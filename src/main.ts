import { bootstrapApplication } from '@angular/platform-browser';
import { Component, inject } from '@angular/core';
import { QuizStore } from './quiz.store';

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

bootstrapApplication(App);
