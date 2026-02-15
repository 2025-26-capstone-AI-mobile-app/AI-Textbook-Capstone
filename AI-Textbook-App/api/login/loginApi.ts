import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

export async function login(username: string, password: string) {
  try {
    if (!username || !password) {
      Alert.alert('Login Failed', "Username and password are required");
      return;
    }

    const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const upstream = await fetch(`${backendUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!upstream.ok) {
      let detail = 'Login failed';
      try {
        const data = await upstream.json();
        detail = data?.detail || data?.message || detail;
      } catch {
        // ignore
      }
      Alert.alert('Login failed', detail);
      return; //NextResponse.json({ detail }, { status: upstream.status });
    }

    const data = await upstream.json();
    const accessToken: string | undefined = data?.access_token;

    if (!accessToken) {
      Alert.alert('No access token returned');
      return;
    }

    return { token: accessToken };
  } catch (error: any) {
    Alert.alert('Unexpected error', error.message);
    return;
  }
}


export async function register(username: string, email: string, password: string) {
  try {

    if (!username || !email || !password) {
      Alert.alert('Username, email, and password are required')
      return;
    }

    const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const upstream = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!upstream.ok) {
      let detail = "Registration failed";
      try {
        const data = await upstream.json();
        detail = data?.detail || data?.message || detail;
      } catch {
        // ignore
      }
      Alert.alert("Registration failed", detail);
      return;
    }

    const data = await upstream.json();
    return data;
  } catch (error: any) {
    Alert.alert("Unexpected error", error.message);
    return;
  }
}

// Logs user out
export async function logout(){
  try {
    // Remove name and token from storage
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('username');
    router.replace('/login');
  } catch(error: any) {
    Alert.alert("Logout failed", error.message);
  }

}

export async function getUserName(): Promise<string>{
  let username: string | null = await AsyncStorage.getItem('username');
  if(username){
    return username;
  }
  
  throw Error("Failed to retrieve username")
}


