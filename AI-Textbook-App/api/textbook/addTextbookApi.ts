// Calls backend to attempt to add a textbook with a given code
// to the currently logged in user. Returns a number between
// 0 and 3. Meanings described below

export const ADD_TEXTBOOK_SUCCESS = 0;
export const ADD_TEXTBOOK_INVALID_CODE = 1;
export const ADD_TEXTBOOK_INVALID_AUTHORIZATION = 2;
export const ADD_TEXTBOOK_NETWORK_ERROR = 3;
export const ADD_TEXTBOOK_INTERNAL_ERROR = 4;

export async function addTextbookToLibrary(textbookCode: string, token: string): Promise<number> {
    try {
        const code: string = textbookCode.toUpperCase().trim()

        if (!code || code.length !== 6) {
            console.error("Invalid code: Should be 6 characters");
            return ADD_TEXTBOOK_INVALID_CODE;
        }

        const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL

        // Get auth token
        if(!token){
            console.error("Invalid token");
            return ADD_TEXTBOOK_INVALID_AUTHORIZATION;
        }

        // Make request to backend
        const upstream = await fetch(`${BACKEND_URL}/textbooks/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ code }),
            cache: "no-store",
        })

        const text = await upstream.text()
        let data: any = {}
        try {
            data = text ? JSON.parse(text) : {}
        } catch (e) {
            console.error("Invalid response from backend");
            return ADD_TEXTBOOK_NETWORK_ERROR;
        }

        if (!upstream.ok) {
            const error = data?.detail || data?.error || "Backend error"
            const status = upstream.status === 404 ? 200 : upstream.status
            // If backend says not found, we treat as graceful invalid code with 200
            if (upstream.status === 404) {
                console.error("Invalid Code");
                return ADD_TEXTBOOK_INVALID_CODE;
            }

            // Unauthorized access
            if (upstream.status === 401) {
                console.error("Error: Unauthorized access. Trying logging out and logging back in.");
                return ADD_TEXTBOOK_INVALID_AUTHORIZATION;
            }

            // Call all other errors "network errors"
            return ADD_TEXTBOOK_NETWORK_ERROR;
        }

        return ADD_TEXTBOOK_SUCCESS;
  } catch (e: any) {
    console.error(e?.message || "Unexpected error");
    return ADD_TEXTBOOK_INTERNAL_ERROR;
  }
}


