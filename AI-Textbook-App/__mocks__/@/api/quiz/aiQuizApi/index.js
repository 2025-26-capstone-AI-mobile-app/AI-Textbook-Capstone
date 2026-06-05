export async function fetchQuizzes(token) {
  return [
    {
      _id: '13d639f4-ec87-49f5-9f86-75af7e74d8e7',
      user: '062fb5df-5e10-489d-ab69-b9cdf667f039',
      quiz: [
        {
          question: 'Which of the following best describes science?',
          choices: [
            'A system for understanding the natural world through observation and experimentation',
            'A belief system based only on traditions',
            'A method for creating new technology without testing',
            'A collection of personal opinions',
          ],
          answer: 0,
        },
        {
          question: 'What is the main purpose of developing a hypothesis in scientific inquiry?',
          choices: [
            'To predict the outcome of an experiment',
            'To memorize facts about science',
            'To repeat what others have said',
            'To avoid making mistakes',
          ],
          answer: 0,
        },
        {
          question: 'Which of the following is a characteristic of a scientific explanation?',
          choices: [
            'It is based on evidence from observations and experiments',
            'It never changes, even with new information',
            'It ignores any data that doesn’t fit the theory',
            'It relies on the opinion of one scientist',
          ],
          answer: 0,
        },
        {
          question: 'Why is it important for scientists to communicate their results?',
          choices: [
            'So others can verify and build upon their work',
            'So they can keep their discoveries secret',
            'So they can skip conducting experiments',
            'So they can ignore feedback from others',
          ],
          answer: 0,
        },
        {
          question:
            'What distinguishes scientific inquiry from other ways of understanding the world?',
          choices: [
            'It relies on systematic observation and experimentation',
            'It is based on guesswork alone',
            'It excludes the use of any tools or technology',
            'It never changes with new evidence',
          ],
          answer: 1,
        },
      ],
      created_time: 1763351344,
      hint: 'Understanding Science',
      quiz_result: {},
      textbook_id: '852f0488-7903-4555-bf5e-a7618f2552ff',
      chapter: '1',
    },
  ];
}

export async function generateQuiz(
  token,
  context,
  hint,
  numQuestions,
  selectedChapterId,
  textbookId,
) {
  return [
    {
      question: 'Which of the following best describes science?',
      choices: [
        'A system for understanding the natural world through observation and experimentation',
        'A belief system based only on traditions',
        'A method for creating new technology without testing',
        'A collection of personal opinions',
      ],
      answer: 0,
    },
    {
      question: 'What is the main purpose of developing a hypothesis in scientific inquiry?',
      choices: [
        'To predict the outcome of an experiment',
        'To memorize facts about science',
        'To repeat what others have said',
        'To avoid making mistakes',
      ],
      answer: 0,
    },
    {
      question: 'Which of the following is a characteristic of a scientific explanation?',
      choices: [
        'It is based on evidence from observations and experiments',
        'It never changes, even with new information',
        'It ignores any data that doesn’t fit the theory',
        'It relies on the opinion of one scientist',
      ],
      answer: 0,
    },
    {
      question: 'Why is it important for scientists to communicate their results?',
      choices: [
        'So others can verify and build upon their work',
        'So they can keep their discoveries secret',
        'So they can skip conducting experiments',
        'So they can ignore feedback from others',
      ],
      answer: 0,
    },
    {
      question: 'What distinguishes scientific inquiry from other ways of understanding the world?',
      choices: [
        'It relies on systematic observation and experimentation',
        'It is based on guesswork alone',
        'It excludes the use of any tools or technology',
        'It never changes with new evidence',
      ],
      answer: 1,
    },
  ];
}
