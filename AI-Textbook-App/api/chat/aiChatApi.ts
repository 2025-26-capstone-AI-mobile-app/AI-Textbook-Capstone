import { ChatSession, Message } from "@/chatTypes"
import AsyncStorage from "@react-native-async-storage/async-storage"


const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL
export async function fetchChats(): Promise<ChatSession[]>{
    try {
        const token = await AsyncStorage.getItem('access_token')
        const res = await fetch(`${backendUrl}/chat/history`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const data = await res.json()
        return data.chats || []
    } catch (e) {
        console.error("Failed to load chats", e)
        return [];
    }
}

export async function loadChat(sessionId: string): Promise<Message[]>{
    try {
        const token = await AsyncStorage.getItem("access_token")
        const res = await fetch(`${backendUrl}/chat/history?session_id=${sessionId}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const data = await res.json()

        // Backend now returns: { session_id, title, summary, messages }
        const messages = data.messages || []
        const loadedMessages: Message[] = messages.map(
            (msg: { content: string; role: string; timestamp: string }, index: number) => ({
            id: `${sessionId}-${index}`,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.timestamp),
        }))

        if (data.summary && data.summary.trim()) {
            const summaryMessage: Message = {
                id: `${sessionId}-summary`,
                content: `**Conversation Summary:**\n\n${data.summary}`,
                role: "assistant",
                timestamp: new Date(),
            }
            loadedMessages.push(summaryMessage)
        }

        return loadedMessages;
    } catch (e) {
      console.error("Failed to load chat", e)
      return [];
    }
}