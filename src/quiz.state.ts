export type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

export type Question = {
  id: number;
  question: string;
  answer: number;
  choices: { id: number; text: string }[];
  explanation: string;
  status: AnswerStatus;
};

export type QuizState = {
  title: string;
  questions: Question[];
};

export const initialState: QuizState = {
  title: 'NgRx Quiz',
  questions: [
    {
      id: 1,
      question: 'NgRx is a library for which Framework?',
      answer: 1,
      status: 'unanswered',
      explanation: 'Ng stands for Angular',
      choices: [
        {
          id: 1,
          text: 'Angular',
        },
        {
          id: 2,
          text: 'Vue',
        },
        {
          id: 3,
          text: 'React',
        },
      ],
    },
    {
      id: 2,
      question: 'Which library uses the Redux pattern?',
      answer: 1,
      status: 'unanswered',
      explanation: 'Only NgRx Global Store (was also the first one)',
      choices: [
        {
          id: 1,
          text: 'Global Store',
        },
        {
          id: 2,
          text: 'Signal Store',
        },
        {
          id: 3,
          text: 'Component Store',
        },
      ],
    },
    {
      id: 3,
      question: 'Which library is not based on RxJs?',
      answer: 2,
      status: 'unanswered',
      explanation: 'Signal Store is, as the name says, built on top of Signals',
      choices: [
        {
          id: 1,
          text: 'Global Store',
        },
        {
          id: 2,
          text: 'Signal Store',
        },
        {
          id: 3,
          text: 'Component Store',
        },
      ],
    },
  ],
};
