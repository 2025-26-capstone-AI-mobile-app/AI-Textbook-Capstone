// AI-Textbook-App/add/read/[id]/[chapter].tsx

import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIFeatureMenu from '@/components/aiFeatureMenu/aiFeatureMenu';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ChapterReader() {
  const { id, chapter, chapterTitle, textbookTitle, pageOffset } = useLocalSearchParams<{
    id: string;
    chapter: string;
    chapterTitle?: string;
    textbookTitle?: string;
    pageOffset: string;
  }>();

  /* Switch here for textbook title + chapter title*/
  const title = textbookTitle && chapterTitle ? `${textbookTitle}: ${chapterTitle}` : 'Loading…';

  /* Switch here for only chapter title*/
  // const title = chapterTitle ?? "Loading…";

  return (
    <>
      {/* Switch here for textbook title + chapter title*/}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#00000' }}>
                {textbookTitle ?? 'Loading…'}
              </Text>
              <Text style={{ fontSize: 14, color: '#000000ff' }}>
                {chapter ? `Chapter ${chapter}: ${chapterTitle ?? ''}` : (chapterTitle ?? '')}
              </Text>
            </View>
          ),
        }}
      />
      {/* Switch here for only chapter title*/}
      {/* <Stack.Screen options={{ title }} /> */}
      <ChapterContent
        id={id}
        chapter={chapter}
        chapterTitle={chapterTitle}
        pageOffset={pageOffset}
      />
    </>
  );
}

function ChapterContent({
  id,
  chapter,
  chapterTitle,
  pageOffset,
}: {
  id: string;
  chapter: string;
  chapterTitle?: string;
  pageOffset: string;
}) {
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

  // Web
  if (Platform.OS === 'web') {
    return (
      <>
        <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
      </>
    );
  }

  // Mobile
  return (
    <View style={styles.pageContent}>
      <View style={styles.webviewContainer}>
        <WebView source={{ uri: pdfUrl }} style={{ flex: 1 }} />
      </View>
      <TouchableOpacity style={styles.aiButton} onPress={() => setAiOverlayVisible(true)}>
        <AntDesign name="up" size={24} color="white" />
        <Text style={styles.aiButtonText}>AI</Text>
      </TouchableOpacity>
      <AIFeatureMenu
        isVisible={aiOverlayVisible}
        textbookId={id}
        chapterId={chapter}
        closeFunc={() => setAiOverlayVisible(false)}
      />
    </View>
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
    width: '100%',
    height: 70,
    marginTop: -15,
    borderRadius: 20,
    backgroundColor: '#383737ff',
    alignItems: 'center',
  },
  aiButtonText: {
    color: 'white',
    fontSize: 20,
  },
});
