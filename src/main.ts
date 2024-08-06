import { Component, inject } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import "zone.js";
import { QuizStore } from "./quiz.store";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h1>NgRx Signal Store Seed</h1>
    <p>Use this as a template to file any issues with the NgRx Signal Store.</p>
    <h2>{{ quizStore.title() }}</h2>
    @for (question of quizStore.questions(); track question) {
      <div class="max-w-lg my-4">
        <h3>{{ question.question }}</h3>
        <div
          class="grid gap-4 w-full my-4"
          [ngClass]="
            question.choices.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          "
        >
          @for (choice of question.choices; track choice) {
            <button
              mat-raised-button
              (click)="quizStore.answer(question.id, choice.id)"
            >
              {{ choice.text }}
            </button>
          }
        </div>

        @if (question.status !== "unanswered") {
          <div
            class="my-2 border-2 p-1"
            [ngClass]="
              question.status === 'correct'
                ? 'border-green-500'
                : 'border-red-500'
            "
          >
            @switch (question.status) {
              @case ("correct") {
                <p class="text-green-500 font-bold">Right Answer</p>
              }
              @case ("incorrect") {
                <p class="text-red-500 font-bold">Wrong Answer</p>
              }
            }

            <p class="italic">{{ question.explanation }}</p>
          </div>
        }
      </div>
    }
  `,
  imports: [NgClass],
  providers: [QuizStore],
})
export class App {
  protected quizStore = inject(QuizStore);
}

bootstrapApplication(App);
