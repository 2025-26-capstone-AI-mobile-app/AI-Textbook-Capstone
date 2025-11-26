const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL

// Requests textbooks from api. Returns null if error occurs
export async function loadTextbooks(authorization: string) {
  if(!authorization || authorization === ''){
    return null;
  }
  try {
    const upstream = `${BACKEND_URL}/api/textbooks`;
    const token = authorization;
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    })
    const text = await response.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : []
    } catch (e) {
      console.error("Failed to parse upstream JSON:", e, "body:", text?.slice(0, 500))
      return null;
    }

    if (!response.ok) {
      console.error("Upstream error body:", data)
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching textbooks:", error)
    return null;
  }
}

export async function fetchTextbookContent(id: string, authorization: string) {
  if (!authorization || authorization === '') return null;

  try {
    const upstream = `${BACKEND_URL}/api/textbooks/${id}`;
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorization}`,
      },
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse upstream JSON:", e, "body:", text?.slice(0, 500));
      return null;
    }

    if (!response.ok) {
      console.error("Upstream error body:", data);
      return null;
    }

    return data; // ← textbook object directly
  } catch (error) {
    console.error(`Error fetching textbook ${id}:`, error);
    return null;
  }
}
