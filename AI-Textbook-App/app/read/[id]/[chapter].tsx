// AI-Textbook-App/add/read/[id]/[chapter].tsx

import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Text,
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIFeatureMenu from '@/components/aiFeatureMenu/aiFeatureMenu';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useScrollIdleTime } from '@/hooks/useScrollIdleTime';

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
  const [idleModalVisible, setIdleModalVisible] = useState(false);
  const { idleTime, isIdle, resetIdle } = useScrollIdleTime(4000);
  const [stopAskingEnabled, setStopAskingEnabled] = useState(false);

  // Existing effect — fetches PDF
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

  // shows idle modal
  useEffect(() => {
    if (isIdle && !aiOverlayVisible && !stopAskingEnabled) {
      setIdleModalVisible(true);
    }
  }, [isIdle]);

  if (!pdfUrl)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading PDF…</Text>
      </View>
    );

  if (Platform.OS === 'web') {
    return <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />;
  }

  return (
    <TouchableWithoutFeedback onPress={resetIdle}>
      <View style={styles.pageContent} onTouchStart={resetIdle} onTouchMove={resetIdle}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: pdfUrl }}
            style={{ flex: 1 }}
            injectedJavaScript={`
              document.addEventListener('scroll', () => {
                window.ReactNativeWebView.postMessage('scroll');
              });
              true;
            `}
            onMessage={() => resetIdle()}
          />
        </View>

        <View style={styles.idleOverlay}>
          <Text style={{ color: 'white' }}>Idle time: {(idleTime / 1000).toFixed(1)}s</Text>
          <Text style={{ color: isIdle ? 'red' : 'green' }}>
            {isIdle ? 'User idle' : 'User active'}
          </Text>
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

        {/* Idle Modal */}
        <Modal
          transparent
          visible={idleModalVisible}
          animationType="fade"
          onRequestClose={() => setIdleModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity
                style={styles.modalCloseX}
                onPress={() => setIdleModalVisible(false)}>
                <Text style={styles.modalCloseXText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Need a hand?</Text>
              <Text style={styles.modalBody}>
                You&apos;ve been on this page for a while. Would you like help understanding it?
              </Text>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIdleModalVisible(false);
                  setAiOverlayVisible(true);
                }}>
                <Text style={styles.modalOptionTitle}>Ask the AI</Text>
                <Text style={styles.modalOptionSub}>Chat about this chapter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIdleModalVisible(false);
                  setAiOverlayVisible(true);
                  // navigate to flashcards
                }}>
                <Text style={styles.modalOptionTitle}>Flashcards</Text>
                <Text style={styles.modalOptionSub}>Review key concepts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIdleModalVisible(false);
                  setAiOverlayVisible(true);
                  // navigate to quiz
                }}>
                <Text style={styles.modalOptionTitle}>Take a quiz</Text>
                <Text style={styles.modalOptionSub}>Test your understanding</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalKeepReading}
                onPress={() => {
                  setIdleModalVisible(false);
                  resetIdle();
                }}>
                <Text style={styles.modalKeepReadingText}>Keep reading</Text>
              </TouchableOpacity>

              {/* stop asking button */}
              <TouchableOpacity
                style={styles.modalStopAsking}
                onPress={() => {
                  setStopAskingEnabled(true);
                  setIdleModalVisible(false);
                }}>
                <Text style={styles.modalStopAskingText}>Stop asking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
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
  idleOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalOption: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOptionSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  modalCloseX: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalCloseXText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  modalKeepReading: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalKeepReadingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalStopAsking: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalStopAskingText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
});
