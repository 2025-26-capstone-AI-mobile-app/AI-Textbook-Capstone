// components/flashcards/flashcardConfigOverlay.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
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

      // Find the current chapter
      const currentChapter = textbookData.chapters.find(
        (ch: any) => ch.id.toString() === chapterId,
      );

      if (!currentChapter) {
        setError('Chapter not found');
        return;
      }

      // Set subchapters or use whole chapter option
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

    // console.log(""selected?.pageOffset)
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
        {/* Title and close button */}
        <View style={styles.titleBar}>
          <Text style={styles.title}>Generate Flashcards</Text>
          <View style={styles.closeButton}>
            <Button title="X" onPress={closeFunc} color="black" />
          </View>
        </View>

        <ScrollView style={styles.scrollContent}>
          {loading && !showStudyView ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>
                {subChapters.length === 0 ? 'Loading sections...' : 'Generating flashcards...'}
              </Text>
            </View>
          ) : (
            <>
              {/* Error message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Section selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Section:</Text>
                {subChapters.map((subChapter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedSubChapter === subChapter.title && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedSubChapter(subChapter.title)}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedSubChapter === subChapter.title && styles.optionTextSelected,
                      ]}>
                      {subChapter.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card count selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Number of Cards:</Text>
                <View style={styles.cardCountContainer}>
                  {cardCountOptions.map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.cardCountButton,
                        cardCount === count && styles.cardCountButtonSelected,
                      ]}
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

              {/* Generate button */}
              <View style={styles.generateButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    !selectedSubChapter && styles.generateButtonDisabled,
                  ]}
                  onPress={handleGenerateFlashcards}
                  disabled={!selectedSubChapter || loading}>
                  <Text style={styles.generateButtonText}>Generate Flashcards</Text>
                </TouchableOpacity>
              </View>
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
    height: '75%',
    width: '100%',
    backgroundColor: '#383737ff',
    marginTop: 'auto',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    flex: 1,
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  titleBar: {
    flexDirection: 'row',
    borderBottomColor: 'white',
    paddingBottom: 10,
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  closeButton: {
    borderRadius: 20,
    backgroundColor: '#ffffff68',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#2a2a2aff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#2a2a2aff',
  },
  optionButtonSelected: {
    backgroundColor: '#4a4a4aff',
    borderColor: '#ffffff',
  },
  optionText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardCountButton: {
    backgroundColor: '#2a2a2aff',
    padding: 15,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2aff',
  },
  cardCountButtonSelected: {
    backgroundColor: '#4a4a4aff',
    borderColor: '#ffffff',
  },
  cardCountText: {
    color: '#a0a0a0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardCountTextSelected: {
    color: '#ffffff',
  },
  generateButtonContainer: {
    marginTop: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#555555',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
