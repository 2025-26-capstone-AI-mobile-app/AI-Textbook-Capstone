import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChapterReader() {
  const { id, chapter } = useLocalSearchParams();
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
        setPdfUrl(data.pdf_url);
      }
    })();
  }, [id, chapter]);

  if (!pdfUrl) return <Text>Loading PDF...</Text>;

  return <WebView source={{ uri: pdfUrl }} style={{ flex: 1 }} />;
}
