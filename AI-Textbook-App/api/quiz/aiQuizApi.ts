import { Quiz } from "@/types/quizTypes"

const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL

// Get list of previous quizzes generated
export async function fetchQuizzes(token: string): Promise<Quiz[]>{
    try {
        const res = await fetch(`${backendUrl}/quiz/list`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const data = await res.json()
        return data || []
    } catch (e) {
        console.error("Failed to load chats", e)
        return [];
    }
}