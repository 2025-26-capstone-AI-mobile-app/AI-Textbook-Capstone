import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChapterReader() {
  const { id, chapter, pageOffset } = useLocalSearchParams();
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (id && chapter && token) {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/textbooks/${id}/chapters/${chapter}/pdf`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        let url = data.pdf_url;
        if (pageOffset) {
          url = `${url}#page=${pageOffset}`;
        }
        setPdfUrl(url);
      }
    })();
  }, [id, chapter, pageOffset]);

  if (!pdfUrl) return <Text>Loading PDF...</Text>;

  // Platform-specific rendering
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={pdfUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    );
  }

  return <WebView source={{ uri: pdfUrl }} style={{ flex: 1 }} />;
}
