import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isVisible: boolean;
  flashcards: any[];
  closeFunc: () => void;
};

export default function FlashcardStudyOverlay({ isVisible, flashcards, closeFunc }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (wasCorrect: boolean) => {
    if (wasCorrect) {
      setCorrectCount(correctCount + 1);
    } else {
      setIncorrectCount(incorrectCount + 1);
    }

    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const isComplete = correctCount + incorrectCount === flashcards.length;

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.title}>Flashcards</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeFunc} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={32} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {flashcards.length}
          </Text>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSecondary, currentIndex === 0 && styles.navButtonDisabled]}
            activeOpacity={0.7}
            onPress={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === 0}>
            <Ionicons name="chevron-back" size={18} color={currentIndex === 0 ? '#48484A' : '#FFFFFF'} />
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              currentIndex === flashcards.length - 1 && styles.navButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={() => {
              if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === flashcards.length - 1}>
            <Text style={[styles.navButtonText, currentIndex === flashcards.length - 1 && styles.navButtonTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={currentIndex === flashcards.length - 1 ? '#48484A' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" style={{ marginBottom: 4 }} />
            <Text style={styles.scoreNumberCorrect}>{correctCount}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreItem}>
            <Ionicons name="close-circle" size={24} color="#FF453A" style={{ marginBottom: 4 }} />
            <Text style={styles.scoreNumberIncorrect}>{incorrectCount}</Text>
            <Text style={styles.scoreLabel}>Incorrect</Text>
          </View>
        </View>

        {!isComplete ? (
          <View style={styles.cardAndAnswerContainer}>
            <View style={styles.cardContainer}>
              <View style={[styles.card, isFlipped && styles.cardFlipped]}>
                <ScrollView
                  contentContainerStyle={styles.cardContent}
                  showsVerticalScrollIndicator={true}>
                  <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
                    <Text style={styles.cardLabel}>{isFlipped ? 'Answer' : 'Question'}</Text>
                    <Text style={styles.cardText}>
                      {isFlipped ? currentCard.answer : currentCard.question}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {isFlipped && (
              <View style={styles.answerSection}>
                <Text style={styles.answerPrompt}>Did you get it right?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.incorrectButton]}
                    activeOpacity={0.8}
                    onPress={() => handleNext(false)}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                    <Text style={styles.answerButtonText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.correctButton]}
                    activeOpacity={0.8}
                    onPress={() => handleNext(true)}>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.answerButtonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.completionContainer}>
            <View style={styles.completionEmojiContainer}>
              <Text style={styles.completionEmoji}>🎉</Text>
            </View>
            <Text style={styles.completionTitle}>Complete!</Text>
            <Text style={styles.completionText}>
              You got {correctCount} out of {flashcards.length} correct
            </Text>
            <Text style={styles.completionPercentage}>
              {Math.round((correctCount / flashcards.length) * 100)}%
            </Text>
            <View style={styles.completionButtons}>
              <TouchableOpacity style={styles.restartButton} activeOpacity={0.8} onPress={handleRestart}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.restartButtonText}>Study Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneButton} activeOpacity={0.8} onPress={closeFunc}>
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    height: '92%',
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
  progressContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  navButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  navButtonSecondary: {
    backgroundColor: '#2C2C2E',
  },
  navButtonDisabled: {
    backgroundColor: '#2C2C2E',
    opacity: 0.5,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#48484A',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#3A3A3C',
  },
  scoreNumberCorrect: {
    color: '#34C759',
    fontSize: 28,
    fontWeight: '700',
  },
  scoreNumberIncorrect: {
    color: '#FF453A',
    fontSize: 28,
    fontWeight: '700',
  },
  scoreLabel: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  cardAndAnswerContainer: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#3A3A3C',
  },
  cardFlipped: {
    borderColor: '#007AFF',
  },
  cardContent: {
    paddingVertical: 16,
  },
  cardLabel: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 19,
    textAlign: 'center',
    lineHeight: 28,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  answerSection: {
    marginTop: 4,
  },
  answerPrompt: {
    color: '#FFFFFF',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '600',
  },
  answerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  correctButton: {
    backgroundColor: '#34C759',
  },
  incorrectButton: {
    backgroundColor: '#FF453A',
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionEmojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completionEmoji: {
    fontSize: 40,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  completionText: {
    color: '#8E8E93',
    fontSize: 17,
    marginBottom: 8,
  },
  completionPercentage: {
    color: '#007AFF',
    fontSize: 64,
    fontWeight: '700',
    marginBottom: 32,
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 14,
  },
  restartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
