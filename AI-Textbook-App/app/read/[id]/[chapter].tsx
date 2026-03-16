// AI-Textbook-App/add/read/[id]/[chapter].tsx

import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Text,
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIFeatureMenu from '@/components/aiFeatureMenu/aiFeatureMenu';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function ChapterReader() {
  const { id, chapter, chapterTitle, textbookTitle, pageOffset } = useLocalSearchParams<{
    id: string;
    chapter: string;
    chapterTitle?: string;
    textbookTitle?: string;
    pageOffset: string;
  }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {textbookTitle ?? 'Loading…'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {chapter ? `Chapter ${chapter}: ${chapterTitle ?? ''}` : (chapterTitle ?? '')}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <ChapterContent
          id={id}
          chapter={chapter}
          chapterTitle={chapterTitle}
          pageOffset={pageOffset}
        />
      </SafeAreaView>
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

  if (!pdfUrl)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading PDF…</Text>
      </View>
    );

  if (Platform.OS === 'web') {
    return (
      <>
        <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
      </>
    );
  }

  return (
    <View style={styles.pageContent}>
      <View style={styles.webviewContainer}>
        <WebView source={{ uri: pdfUrl }} style={{ flex: 1 }} />
      </View>
      <TouchableOpacity style={styles.aiButton} onPress={() => setAiOverlayVisible(true)}>
        <View style={styles.aiButtonInner}>
          <AntDesign name="up" size={16} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>AI Assistant</Text>
        </View>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 1,
  },
  headerSpacer: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#0F0F0F',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  pageContent: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
  },
  aiButton: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  aiButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
