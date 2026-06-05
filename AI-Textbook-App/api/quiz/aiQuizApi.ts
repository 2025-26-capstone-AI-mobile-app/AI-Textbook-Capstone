import { Question, Quiz } from '@/types/quizTypes';

const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// Get list of previous quizzes generated
export async function fetchQuizzes(token: string): Promise<Quiz[]> {
  try {
    const res = await fetch(`${backendUrl}/quiz/list`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json();
    return data || [];
  } catch (e) {
    console.error('Failed to load chats', e);
    return [];
  }
}

// Get list of previous quizzes generated
export async function generateQuiz(
  token: string,
  context: string,
  hint: string,
  numQuestions: number,
  selectedChapterId: string,
  textbookId: string,
): Promise<Question[]> {
  try {
    console.log(
      JSON.stringify({
        context: context,
        hint: hint,
        num_questions: numQuestions,
        chapter: selectedChapterId,
        textbook_id: textbookId,
      }),
    );
    const res = await fetch(`${backendUrl}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        context: context,
        hint: hint,
        num_questions: numQuestions,
        chapter: selectedChapterId,
        textbook_id: textbookId,
      }),
    });
    const data = await res.json();
    return data || [];
  } catch (e) {
    console.error('Failed to load chats', e);
    return [];
  }
}
