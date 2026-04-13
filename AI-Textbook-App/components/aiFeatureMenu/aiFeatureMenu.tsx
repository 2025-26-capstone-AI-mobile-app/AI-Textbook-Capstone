import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import AIChatOverlay from '../chat/chatOverlay';
import FlashcardConfigOverlay from '../flashcards/flashcardConfigOverlay';
import AIQuizOverlay from '../quiz/quizOverlay';

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void;
};

export default function AIFeatureMenu({ isVisible, textbookId, chapterId, closeFunc }: Props) {
  //feature list
  const FEATURE_NONE = 0;
  const FEATURE_CHAT = 1;
  const FEATURE_FLASHCARDS = 2;
  const FEATURE_QUIZ = 3;

  const [, setToken] = useState<string>('');
  const [featureSelected, setFeatureSelected] = useState<number>(FEATURE_NONE);

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  });

  const closeOverlay = () => {
    setFeatureSelected(FEATURE_NONE);
  };

  const openFlashcards = () => {
    setFeatureSelected(FEATURE_FLASHCARDS);
  };

  const closeFlashcards = () => {
    setFeatureSelected(FEATURE_NONE);
  };

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.title}>AI Features</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeFunc} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={32} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.featureRow}
            activeOpacity={0.6}
            onPress={() => setFeatureSelected(FEATURE_CHAT)}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="chatbubbles" size={22} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>AI Chat</Text>
              <Text style={styles.featureSubtitle}>Ask questions about this chapter</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#48484A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureRow}
            activeOpacity={0.6}
            onPress={openFlashcards}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="albums" size={22} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>AI Flashcards</Text>
              <Text style={styles.featureSubtitle}>Generate study flashcards</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#48484A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.6}
            onPress={() => setFeatureSelected(FEATURE_QUIZ)}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Quiz</Text>
              <Text style={styles.featureSubtitle}>Test your knowledge</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#48484A" />
          </TouchableOpacity>
        </ScrollView>
      </View>
      <AIChatOverlay
        isVisible={featureSelected === FEATURE_CHAT}
        textbookId={textbookId}
        chapterId={chapterId}
        closeFunc={closeOverlay}
      />
      <AIQuizOverlay
        isVisible={featureSelected === FEATURE_QUIZ}
        textbookId={textbookId}
        chapterId={chapterId}
        closeFunc={closeOverlay}
      />

      <FlashcardConfigOverlay
        isVisible={featureSelected === FEATURE_FLASHCARDS}
        textbookId={textbookId}
        chapterId={chapterId}
        closeFunc={closeFlashcards}
      />
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
  menuList: {
    flex: 1,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  featureSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
});
