const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

interface GenerateFlashcardsResponse {
    setId: string | null;
    cards: Array<{ question: string; answer: string; id: string }>;
    msg: string;
}

// Generate flashcards using AI based on textbook content
export async function generateFlashcards(
    token: string,
    textbook_id: string,
    chapter_id: string,
    num_cards: number = 10,
    hint?: string,
    subchapter_title?: string,
    subchapter_page_offset?: number
): Promise<GenerateFlashcardsResponse> {
    try {
        const url = `${backendUrl}/flashcards/generate`;
        
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
        
        const body = {
            textbook_id,
            chapter: chapter_id,
            num_flashcards: num_cards,
            context: "",  // Empty context since we're using the chapter text
            hint: hint || "",
            subchapter_title,
            subchapter_page_offset
        };
        
        const backendResponse = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });
        
        const data = await backendResponse.json();
        console.log("FLASHCARD RESPONSE:", data);

        
        if (!backendResponse.ok || !data) {
            return { 
                setId: null, 
                cards: [], 
                msg: data?.detail || "Failed to generate flashcards" 
            };
        }
        
        // Backend returns { front: string[], back: string[] }
        // Convert to our format
        const cards = data.flashcards_front.map((question: string, index: number) => ({
            id: `flashcard-${index}`,
            question: question,
            answer: data.flashcards_back[index]
        }));
        
        return {
            setId: `${textbook_id}_${chapter_id}`,
            cards: cards,
            msg: "",
        };
    } catch (error) {
        console.error("Error generating flashcards:", error);
        return { setId: null, cards: [], msg: String(error) };
    }
}