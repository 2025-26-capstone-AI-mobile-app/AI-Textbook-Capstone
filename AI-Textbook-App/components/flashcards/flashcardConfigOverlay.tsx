import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';
import { generateFlashcards } from '@/api/flashcards/aiFlashcardApi';
import FlashcardStudyOverlay from './flashcardStudyOverlay';

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void;
};

interface SubChapter {
  title: string;
  pageOffset?: number;
}

export default function FlashcardConfigOverlay({
  isVisible,
  textbookId,
  chapterId,
  closeFunc,
}: Props) {
  const [token, setToken] = useState<string>('');
  const [subChapters, setSubChapters] = useState<SubChapter[]>([]);
  const [selectedSubChapter, setSelectedSubChapter] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [showStudyView, setShowStudyView] = useState<boolean>(false);

  const cardCountOptions = [5, 10, 15, 20];

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  }, []);

  const loadSubChapters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const textbookData: any = await fetchTextbookContent(textbookId, token);
      if (!textbookData || !textbookData.chapters) {
        setError('Failed to load textbook data');
        return;
      }

      const currentChapter = textbookData.chapters.find(
        (ch: any) => ch.id.toString() === chapterId,
      );

      if (!currentChapter) {
        setError('Chapter not found');
        return;
      }

      if (currentChapter.sub_chapters && currentChapter.sub_chapters.length > 0) {
        setSubChapters([
          { title: 'Entire Chapter', pageOffset: undefined },
          ...currentChapter.sub_chapters,
        ]);
      } else {
        setSubChapters([{ title: 'Entire Chapter', pageOffset: undefined }]);
      }
    } catch (err) {
      console.error('Error loading subchapters:', err);
      setError('Failed to load chapter information');
    } finally {
      setLoading(false);
    }
  }, [textbookId, token, chapterId]);

  useEffect(() => {
    if (isVisible && token && textbookId) {
      loadSubChapters();
    }
  }, [isVisible, token, textbookId, loadSubChapters]);

  const handleGenerateFlashcards = async () => {
    if (!selectedSubChapter) {
      setError('Please select a section');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selected = subChapters.find((s) => s.title === selectedSubChapter);
      const response = await generateFlashcards(
        token,
        textbookId,
        chapterId,
        cardCount,
        undefined,
        selected?.title,
        selected?.pageOffset,
      );

      if (!response.cards || response.cards.length === 0) {
        setError(response.msg || 'Failed to generate flashcards');
        return;
      }

      setGeneratedCards(response.cards);
      setShowStudyView(true);
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseStudyView = () => {
    setShowStudyView(false);
    setGeneratedCards([]);
    setSelectedSubChapter(null);
    closeFunc();
  };

  if (showStudyView) {
    return (
      <FlashcardStudyOverlay
        isVisible={isVisible}
        flashcards={generatedCards}
        closeFunc={handleCloseStudyView}
      />
    );
  }

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.title}>Generate Flashcards</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeFunc} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={32} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading && !showStudyView ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {subChapters.length === 0 ? 'Loading sections...' : 'Generating flashcards...'}
              </Text>
            </View>
          ) : (
            <>
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Section</Text>
                {subChapters.map((subChapter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedSubChapter === subChapter.title && styles.optionButtonSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedSubChapter(subChapter.title)}>
                    <View style={styles.optionRow}>
                      <View
                        style={[
                          styles.radioOuter,
                          selectedSubChapter === subChapter.title && styles.radioOuterSelected,
                        ]}>
                        {selectedSubChapter === subChapter.title && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          selectedSubChapter === subChapter.title && styles.optionTextSelected,
                        ]}>
                        {subChapter.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Number of Cards</Text>
                <View style={styles.cardCountContainer}>
                  {cardCountOptions.map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.cardCountButton,
                        cardCount === count && styles.cardCountButtonSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setCardCount(count)}>
                      <Text
                        style={[
                          styles.cardCountText,
                          cardCount === count && styles.cardCountTextSelected,
                        ]}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  !selectedSubChapter && styles.generateButtonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleGenerateFlashcards}
                disabled={!selectedSubChapter || loading}>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>Generate Flashcards</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 0,
    margin: 0,
  },
  overlayContent: {
    height: '100%',
    width: '100%',
    backgroundColor: '#1C1C1E',
    marginTop: 'auto',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A3A3C',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 15,
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  optionButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderColor: '#007AFF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#48484A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#8E8E93',
    fontSize: 16,
    flex: 1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardCountContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cardCountButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
  },
  cardCountButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderColor: '#007AFF',
  },
  cardCountText: {
    color: '#8E8E93',
    fontSize: 17,
    fontWeight: '600',
  },
  cardCountTextSelected: {
    color: '#FFFFFF',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
