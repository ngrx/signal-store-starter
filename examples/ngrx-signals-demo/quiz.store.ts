import {
  deepComputed,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AnswerStatus, initialState } from './quiz.state';

export const QuizStore = signalStore(
  withState(initialState),
  withComputed(({ questions }) => {
    return {
      score: deepComputed(() =>
        questions().reduce(
          (score, question) => ({
            ...score,
            [question.status]: score[question.status] + 1,
          }),
          { unanswered: 0, correct: 0, incorrect: 0 },
        ),
      ),
    };
  }),
  withMethods((store) => {
    return {
      answer(questionId: number, choiceId: number): void {
        patchState(store, ({ questions }) => ({
          questions: questions.map((question) => {
            if (question.id === questionId) {
              const status: AnswerStatus =
                question.answer === choiceId ? 'correct' : 'incorrect';
              return { ...question, status };
            }

            return question;
          }),
        }));
      },
      restart(): void {
        patchState(store, initialState);
      },
    };
  }),
  withHooks({
    onInit(store) {
      console.log(`${store.title()} has been initialized.`);
    },
  }),
);
