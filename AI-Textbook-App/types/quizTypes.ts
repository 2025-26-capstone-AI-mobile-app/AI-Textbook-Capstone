export interface Question{
    question: string,
    answer: number,
    choices: string[]
}

export interface Quiz{
    _id: string,
    chapter: string,
    created_time: number,
    hint: string,
    quiz: Question[],
    quiz_result: any, // I don't know what this is
    textbook_id: string,
    user: string
}

export interface QuizResult{
    correctAnswers: number, 
    totalQuestions: number, 
    grade: number
}