import { BranchCandidate, ChatSession, Message } from "@/chatTypes"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { fetch as expoFetch} from 'expo/fetch' ;


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

interface ChatResponse{
	session: string | null,
	branchCandiate: BranchCandidate | null, 
	msg: string
}

// Sends message to LLM
// Message: message to send
// Textbook_id: id of the textbook being discussed
// chapter_id: id of chapter being discussed
// session_id: id of current conversation. If null, starts new conversation
// returns response message
export async function streamMessage(message: string, textbook_id: string, chapter_id: string, session_id: string| null): Promise<ChatResponse>{
  try {
    const token = await AsyncStorage.getItem("access_token");
    const streamUrl = `${backendUrl}/chat/stream`

    // Pass through auth header if present

    const headers: Record<string, string> = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

	// For some reason the native react fetch doesn't support streaming
	// so we have to use expo's fetch instead.
    const backendResponse = await expoFetch(streamUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({message: message, textbook_id: textbook_id, chapter_id: chapter_id, session_id: session_id}),
    })

	console.log("Stream request completed");
	console.log(backendResponse);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend stream error:", backendResponse.status, errorText)

      return {session: session_id,branchCandiate: null, msg: `Network error: ${errorText}`};
    }

	console.log(backendResponse.body);
	if(backendResponse.body){
		return await parseStream(backendResponse.body, session_id);
	} else{
		console.error("Failed to parse body")
		return {session: session_id, branchCandiate: null, msg: "Network error: Failed to parse body"};
	}
  } catch (error) {
    console.error("Error in stream proxy:", error)
    return {session: session_id, branchCandiate: null, msg: `Network error: ${error}`};
  }
}

// The following is copied from the web app frontend and modified to work here
type StreamTextData = {
  text: string
  session_id: string
}

type StreamBranchData = {
  start_new_chat: boolean
  new_session_id: string
  suggested_title: string
}

type StreamDoneData = {
  done: boolean
  session_id: string
}

type StreamErrorData = {
  error: string
}
type StreamData = StreamTextData | StreamBranchData | StreamDoneData | StreamErrorData

// Helper type guards
const isStreamTextData = (data: StreamData): data is StreamTextData => "text" in data
const isStreamBranchData = (data: StreamData): data is StreamBranchData => "start_new_chat" in data
const isStreamDoneData = (data: StreamData): data is StreamDoneData => "done" in data
const isStreamErrorData = (data: StreamData): data is StreamErrorData => "error" in data

async function parseStream(streamRes: ReadableStream<Uint8Array<ArrayBuffer>>, session_id: string | null) : Promise<ChatResponse>{
	const reader = streamRes.getReader()
	const decoder = new TextDecoder()
	let buffer = ""
	const chunks: string[] = []
	const rawDataReceived: string[] = []
	let branchCandidate: BranchCandidate | null = null; 

	
	while (true) {
		const { done, value } = await reader.read()
		if (done) {
			console.log("[v0] 🔚 Stream ended. Total chunks received:", chunks.length)
			console.log("[v0] 🔚 All raw data received:", rawDataReceived) // Log all raw data
			//console.log("[v0] 🔚 Final branch candidates state:", branchCandidates)
			break
		}

		const rawChunk = decoder.decode(value, { stream: true })
		rawDataReceived.push(rawChunk) // Store raw chunk
		console.log("[v0] 🔍 Raw chunk received:", JSON.stringify(rawChunk)) // Log raw chunk with escaping

		buffer += rawChunk
		const lines = buffer.split("\n")
		buffer = lines.pop() || ""

		for (const line of lines) {
			console.log("[v0] 📥 Processing line:", JSON.stringify(line)) // Log with escaping

			if (line.includes("start_new_chat")) {
				console.log("[v0] 🌟 FOUND LINE WITH start_new_chat:", JSON.stringify(line))

				// Try to parse as direct JSON
				try {
					const directData = JSON.parse(line)
					console.log("[v0] 🌟 Direct JSON parse successful:", directData)
					if (directData.start_new_chat) {
						console.log("[v0] 🌟 BRANCH SIGNAL IN DIRECT JSON!")
					}
				} catch (e) {
					console.log("[v0] ⚠️ Direct JSON parse failed:", e)
				}
			}

			if (!line.startsWith("data: ")) {
				console.log("[v0] ⚠️ Skipping non-data line:", JSON.stringify(line))
				continue
			}

			const jsonStr = line.slice(6).trim()
			if (!jsonStr) {
				console.log("[v0] ⚠️ Empty JSON string after 'data: '")
				continue
			}

			console.log("[v0] 🔍 Raw JSON string:", jsonStr)
			let data: StreamData
			try {
				data = JSON.parse(jsonStr) as StreamData
				console.log("[v0] ✅ Parsed stream data:", data)
				console.log("[v0] 🔍 Data keys:", Object.keys(data))

				if (isStreamTextData(data)) {
					if (!session_id && data.session_id) {
						session_id = data.session_id
						console.log("[v0] 🆔 Set session ID:", data.session_id)
					}
					chunks.push(data.text)
				}

				if (isStreamBranchData(data)) {
					console.log("[v0] 🌟 BRANCH SIGNAL DETECTED! Full data object:", JSON.stringify(data, null, 2))

					const branchData = {
						new_session_id: data.new_session_id,
						suggested_title: data.suggested_title || "New Chat",
					}

					console.log("[v0] 🌿 Creating branch candidate:", branchData)
					branchCandidate = branchData;
					// setBranchCandidates((prev) => {
					// 	const updated = { ...prev, [tempMessage.id]: branchData }
					// 	console.log("[v0] 🌿 Updated branch candidates:", updated)
					// 	return updated
					// })
				}

				if (isStreamDoneData(data)) {
					console.log("[v0] ✅ Stream marked as done")
				}

				if (isStreamErrorData(data)) {
					let error = data as StreamErrorData
					console.log("[v0] ❌ Error in stream:", data.error)
					return {session: session_id,branchCandiate: branchCandidate, msg: `⚠️ ${error}`};
				}
			} catch (parseError) {
				console.error("[v0] 💥 Failed to parse stream data:", parseError, "Raw line:", line)
				console.error("[v0] 💥 JSON string that failed:", jsonStr)
			}
		}
	}

	return {session: session_id, branchCandiate: branchCandidate, msg: chunks.join("")};
}