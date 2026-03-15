// components/flashcards/flashcardStudyOverlay.tsx

import { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';

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
        {/* Title and close button */}
        <View style={styles.titleBar}>
          <Text style={styles.title}>Flashcards</Text>
          <View style={styles.closeButton}>
            <Button title="X" onPress={closeFunc} color="black" />
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {flashcards.length}
          </Text>
        </View>

        {/* Navigation buttons between flashcards*/}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === 0}>
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === flashcards.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={() => {
              if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === flashcards.length - 1}>
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>

        {/* Score display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreNumber}>{correctCount}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreNumber, styles.incorrectColor]}>{incorrectCount}</Text>
            <Text style={styles.scoreLabel}>Incorrect</Text>
          </View>
        </View>

        {!isComplete ? (
          <>
            {/* Flashcard */}
            <TouchableOpacity
              style={styles.cardContainer}
              onPress={handleFlip}
              activeOpacity={0.9}>
              <View style={styles.card}>
                <ScrollView contentContainerStyle={styles.cardContent}>
                  <Text style={styles.cardLabel}>{isFlipped ? 'Answer' : 'Question'}</Text>
                  <Text style={styles.cardText}>
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </Text>
                </ScrollView>
                <Text style={styles.tapToFlip}>
                  {isFlipped ? 'Tap to see question' : 'Tap to see answer'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Answer buttons (only show after flipping) */}
            {isFlipped && (
              <View style={styles.answerSection}>
                <Text style={styles.answerPrompt}>Did you get it right?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.incorrectButton]}
                    onPress={() => handleNext(false)}>
                    <Text style={styles.answerButtonText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.correctButton]}
                    onPress={() => handleNext(true)}>
                    <Text style={styles.answerButtonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        ) : (
          /* Completion screen */
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>🎉 Complete!</Text>
            <Text style={styles.completionText}>
              You got {correctCount} out of {flashcards.length} correct
            </Text>
            <Text style={styles.completionPercentage}>
              {Math.round((correctCount / flashcards.length) * 100)}%
            </Text>
            <View style={styles.completionButtons}>
              <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <Text style={styles.restartButtonText}>Study Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneButton} onPress={closeFunc}>
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
    height: '90%',
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
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a2aff',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#555555',
    opacity: 0.5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2aff',
    borderRadius: 10,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreNumber: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
  },
  incorrectColor: {
    color: '#ff4444',
  },
  scoreLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 5,
  },
  cardContainer: {
    flex: 1,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#2a2a2aff',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4a4a4aff',
  },
  cardContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardLabel: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  tapToFlip: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  answerSection: {
    marginTop: 10,
  },
  answerPrompt: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  answerButton: {
    flex: 1,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#ff4444',
  },
  answerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 48,
    marginBottom: 20,
  },
  completionText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
  completionPercentage: {
    color: '#007AFF',
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  restartButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});