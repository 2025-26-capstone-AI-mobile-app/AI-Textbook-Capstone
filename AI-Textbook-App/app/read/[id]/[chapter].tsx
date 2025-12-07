import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, Platform, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech'; // 1. Import Speech
import { Ionicons } from '@expo/vector-icons'; // 2. Import Icons

export default function ChapterReader() {
  const { id, chapter, pageOffset } = useLocalSearchParams();
  const [pdfUrl, setPdfUrl] = useState('');
  
  // State for Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chapterText, setChapterText] = useState("This is placeholder text. To read the real chapter, your backend API needs to return the text content along with the PDF URL.");

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (id && chapter && token) {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/textbooks/${id}/chapters/${chapter}/pdf`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await response.json();

        let url = data.pdf_url;
        if (pageOffset) {
          url = `${url}#page=${pageOffset}`;
        }
        setPdfUrl(url);
        if (data.text_content) {
        setChapterText(data.text_content);
        }
        // TODO: If your API returns text, set it here:
        // if (data.text_content) setChapterText(data.text_content);
      }
    })();
    
    // Cleanup: Stop speaking if user leaves screen
    return () => {
      Speech.stop();
    };
  }, [id, chapter, pageOffset]);

  // TTS Toggle Function
  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(chapterText, {
        rate: 0.9, // Adjust speed (0.1 to 2.0)
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    }
  };

  if (!pdfUrl) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading Chapter...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* PDF Viewer */}
      {Platform.OS === 'web' ? (
        <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
      ) : (
        <WebView source={{ uri: pdfUrl }} style={{ flex: 1 }} />
      )}

      {/* Floating Audio Button */}
      <TouchableOpacity 
        style={[
          styles.fab, 
          { backgroundColor: isSpeaking ? '#FF3B30' : '#007AFF' }
        ]} 
        onPress={toggleSpeech}
      >
        <Ionicons 
          name={isSpeaking ? "stop" : "volume-high"} 
          size={24} 
          color="#FFF" 
        />
        {/* Optional: Add text label if you want */}
        {/* <Text style={styles.fabText}>{isSpeaking ? "Stop" : "Read"}</Text> */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // Floating Action Button Styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});