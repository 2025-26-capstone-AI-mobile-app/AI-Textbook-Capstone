// AI-Textbook-App/add/read/[id]/[chapter].tsx

import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, Platform, View, StyleSheet, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIFeatureMenu from '@/components/aiFeatureMenu/aiFeatureMenu';

export default function ChapterReader() {
  const { id, chapter, chapterTitle, pageOffset } = useLocalSearchParams<{
    id: string;
    chapter: string;
    chapterTitle?: string;
    pageOffset: string;
  }>();
  const [pdfUrl, setPdfUrl] = useState('');
  const [aiOverlayVisible, setAiOverlayVisible] = useState(false);

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
      }
    })();
  }, [id, chapter, pageOffset]);

  if (!pdfUrl) return <Text>Loading PDF...</Text>;

  // Platform-specific rendering
  if (Platform.OS === 'web') {
    <Stack.Screen options={{ title: chapterTitle || `Chapter ${chapter}` }} />
    return <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: chapterTitle || `Chapter ${chapter}` }} />
      <View style={styles.pageContent}>
        <View style={styles.webviewContainer}>
          <WebView source={{ uri: pdfUrl }} style={{ flex: 1 }} />
        </View>
        <View style={styles.aiButton}>
          <Button title="AI" onPress={() => setAiOverlayVisible(true)}></Button>
        </View>
        <AIFeatureMenu
          isVisible={aiOverlayVisible}
          textbookId={id}
          chapterId={chapter}
          closeFunc={() => setAiOverlayVisible(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    height: '100%',
  },
  webviewContainer: {
    flex: 1,
  },
  aiButton: {
    width: 100,
    borderRadius: 20,
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#383737ff',
  },
});
