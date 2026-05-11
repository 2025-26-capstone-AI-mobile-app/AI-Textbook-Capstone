import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { fetchQuizzes, generateQuiz } from '@/api/quiz/aiQuizApi';
import { Question, Quiz, QuizResult } from '@/types/quizTypes';
import { SelectList } from 'react-native-dropdown-select-list';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void;
};

export default function AIQuizOverlay({ isVisible, textbookId, chapterId, closeFunc }: Props) {
  const [token, setToken] = useState<string>('');

  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [subChapters, setSubChapters] = useState<{ title: string }[]>([]);
  const [selectedSubChapter, setSelectedSubChapter] = useState<string>('');

  const allowedQuestionCounts = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);

  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);
  const [quizChoices, setQuizChoices] = useState<number[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult>();
  const [loading, setLoading] = useState<boolean>(false);

  let quizScrollRef = createRef<ScrollView>();

  const updateQuizzes = () => {
    fetchQuizzes(token)
      .then((newQuizzes) => {
        setQuizzes(newQuizzes);
      })
      .catch((reason) => {
        console.log(`Failed to fetch quizzes: ${reason}`);
        Alert.alert('Failed to fetch quizzes');
        closeFunc();
      });
  };

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  });

  useEffect(() => {
    if (quizzes === null) {
      updateQuizzes();
    }
  });

  useEffect(() => {
    if (subChapters.length === 0 && token.length > 0) {
      updateQuizList();
    }
  });

  const updateQuizList = () => {
    fetchTextbookContent(textbookId, token).then((data: any) => {
      if (data) {
        const newSubChapters = data.chapters.find((c: any) => '' + c.id === chapterId).sub_chapters;
        setSubChapters(newSubChapters.map((subChapter: any) => ({ title: subChapter.title })));
      }
    });
  };

  const createQuiz = () => {
    if (selectedSubChapter) {
      setLoading(true);
      generateQuiz(token, '', selectedSubChapter, selectedQuestionCount, chapterId, textbookId)
        .then((quiz) => {
          openQuiz(quiz, selectedSubChapter);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      Alert.alert('Please choose a subchapter');
    }
  };

  const openQuiz = (quiz: Question[], title: string) => {
    setQuizTitle(title);
    setShowCorrectAnswers(false);
    setCurrentQuiz(quiz);
    setQuizChoices(new Array(quiz.length).fill(-1));
    setQuizOpen(true);
  };

  const closeQuiz = () => {
    setQuizOpen(false);
    setShowCorrectAnswers(false);
    setCurrentQuiz(null);
    setQuizChoices([]);
    setQuizTitle('');
    setLoading(false);
  };

  const gradeQuiz = (): QuizResult => {
    if (!currentQuiz || quizChoices.length === 0)
      return { correctAnswers: 0, totalQuestions: 0, grade: -1 };

    let numQuestions = quizChoices.length;
    let correct = 0;
    for (let i = 0; i < numQuestions; i++) {
      if (quizChoices[i] === currentQuiz[i].answer) {
        correct++;
      }
    }

    return { correctAnswers: correct, totalQuestions: numQuestions, grade: correct / numQuestions };
  };

  const submitQuiz = () => {
    quizScrollRef.current?.scrollTo({ y: 0 });
    setShowCorrectAnswers(true);
    setQuizResult(gradeQuiz());
  };

  const resetQuiz = () => {
    quizScrollRef.current?.scrollTo({ y: 0 });
    if (!currentQuiz) return;
    setShowCorrectAnswers(false);
    setQuizChoices(new Array(currentQuiz.length).fill(-1));
  };

  const setQuizOptionColor = (qIndex: number, cIndex: number) => {
    if (!currentQuiz) return {};

    if (showCorrectAnswers) {
      if (quizChoices[qIndex] === cIndex) {
        if (cIndex === currentQuiz[qIndex].answer) {
          return { backgroundColor: '#34C759', borderColor: '#34C759' };
        } else {
          return { backgroundColor: '#FF9500', borderColor: '#FF9500' };
        }
      } else if (cIndex === currentQuiz[qIndex].answer) {
        return { backgroundColor: '#34C759', borderColor: '#34C759' };
      }
    } else if (quizChoices[qIndex] === cIndex) {
      return { backgroundColor: '#007AFF', borderColor: '#007AFF' };
    }

    return {};
  };

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.title}>Create New Quiz</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeFunc} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={32} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Subchapter</Text>
            {subChapters.length > 0 ? <Text testID="testText"></Text> : []}
            <SelectList
              setSelected={(val: string) => setSelectedSubChapter(val)}
              data={subChapters.map((c) => ({ key: c.title, value: c.title }))}
              save="value"
              boxStyles={styles.selectorButton}
              inputStyles={styles.selectorButtonText}
              dropdownTextStyles={styles.selectorDropdownText}
              dropdownStyles={styles.selectorDropdown}
              arrowicon={<Ionicons name="chevron-down" size={18} color="#8E8E93" />}
              searchicon={<View testID="searchIcon" />}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Number of Questions</Text>
            <SelectList
              setSelected={(val: number) => setSelectedQuestionCount(val)}
              data={allowedQuestionCounts.map((c) => ({ key: c, value: c + '' }))}
              save="key"
              boxStyles={styles.selectorButton}
              inputStyles={styles.selectorButtonText}
              dropdownTextStyles={styles.selectorDropdownText}
              dropdownStyles={styles.selectorDropdown}
              arrowicon={<Ionicons name="chevron-down" size={18} color="#8E8E93" />}
              searchicon={<View testID="searchIcon" />}
              defaultOption={{ key: 5, value: '5' }}
            />
          </View>

          <TouchableOpacity
            testID="GenerateButton"
            style={styles.generateButton}
            activeOpacity={0.8}
            onPress={createQuiz}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>

          <View style={styles.previousSection}>
            <Text style={styles.previousTitle}>Previous Quizzes</Text>
            {quizzes && quizzes.map ? (
              quizzes.map((quiz) => {
                return (
                  <TouchableOpacity
                    key={quiz._id}
                    style={styles.quizRow}
                    activeOpacity={0.6}
                    onPress={() => openQuiz(quiz.quiz, quiz.hint)}>
                    <View style={styles.quizRowIconContainer}>
                      <Ionicons name="document-text" size={18} color="#8E8E93" />
                    </View>
                    <View style={styles.quizRowTextContainer}>
                      <Text style={styles.quizRowTitle}>{quiz.hint}</Text>
                      <Text style={styles.quizRowDate}>
                        {new Date(quiz.created_time * 1000).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#48484A" />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No Quizzes</Text>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal coverScreen={false} hasBackdrop={false} isVisible={loading} style={styles.modal}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Generating quiz...</Text>
          </View>
        </View>
      </Modal>

      <Modal coverScreen={false} hasBackdrop={false} isVisible={quizOpen} style={styles.modal}>
        <View testID="openQuiz" style={styles.overlayContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.titleBar}>
            <Text style={styles.title} numberOfLines={1}>{quizTitle}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeQuiz} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={32} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {showCorrectAnswers ? (
            <View style={styles.scoreBar}>
              <Ionicons
                name={quizResult && quizResult.grade >= 0.7 ? 'trophy' : 'analytics'}
                size={24}
                color={quizResult && quizResult.grade >= 0.7 ? '#FFD60A' : '#007AFF'}
              />
              <Text
                style={styles.scoreText}
                testID={
                  'testResults:' + quizResult?.correctAnswers + '/' + quizResult?.totalQuestions
                }>
                Score: {quizResult?.correctAnswers}/{quizResult?.totalQuestions}
              </Text>
              <Text style={styles.scorePercentage}>
                {quizResult ? Math.round(quizResult.grade * 100) : 0}%
              </Text>
            </View>
          ) : (
            []
          )}

          <ScrollView ref={quizScrollRef} showsVerticalScrollIndicator={false}>
            {currentQuiz
              ? currentQuiz.map((question, index) => (
                <View key={index} style={styles.questionCard}>
                  <Text testID={'Q' + (index + 1)} style={styles.questionText}>
                    {index + 1}. {question.question}
                  </Text>
                  {showCorrectAnswers && currentQuiz[index].answer === quizChoices[index] ? (
                    <View style={styles.resultBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                      <Text testID={'Q' + (index + 1) + 'T'} style={styles.correctText}>
                        Correct
                      </Text>
                    </View>
                  ) : showCorrectAnswers ? (
                    <View style={styles.resultBadge}>
                      <Ionicons name="close-circle" size={16} color="#FF453A" />
                      <Text testID={'Q' + (index + 1) + 'F'} style={styles.incorrectText}>
                        Incorrect
                      </Text>
                    </View>
                  ) : (
                    []
                  )}

                  {question.choices.map((choice, cIndex) => (
                    <TouchableOpacity
                      style={[styles.choiceButton, setQuizOptionColor(index, cIndex)]}
                      key={cIndex}
                      activeOpacity={0.7}
                      onPress={() => {
                        quizChoices[index] = cIndex;
                        setQuizChoices([...quizChoices]);
                      }}
                      disabled={showCorrectAnswers}
                      testID={'Q' + (index + 1) + 'C' + cIndex}>
                      <Text style={styles.choiceText}>{choice}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
              : []}

            <TouchableOpacity
              style={[
                styles.actionButton,
                (quizChoices.filter((val) => val === -1).length > 0 || showCorrectAnswers) &&
                styles.actionButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={submitQuiz}
              disabled={quizChoices.filter((val) => val === -1).length > 0 || showCorrectAnswers}
              testID="SubmitButton">
              <Text style={styles.actionButtonText}>Submit</Text>
            </TouchableOpacity>

            {showCorrectAnswers ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={resetQuiz}
                testID="resetButton">
                <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>Try Again</Text>
              </TouchableOpacity>
            ) : (
              []
            )}

            {quizChoices.filter((val) => val === -1).length > 0 ? (
              <Text style={styles.warningText}>Please answer all questions</Text>
            ) : (
              []
            )}

            <View style={{ height: 60 }}></View>
          </ScrollView>
        </View>
      </Modal>
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
  formScroll: {
    flex: 1,
    marginTop: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  selectorButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    alignItems: 'center',
  },
  selectorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectorDropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectorDropdown: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
    borderRadius: 12,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 28,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  previousSection: {
    marginTop: 4,
  },
  previousTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    marginBottom: 4,
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  quizRowIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quizRowTextContainer: {
    flex: 1,
  },
  quizRowTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  quizRowDate: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 24,
  },
  loadingOverlay: {
    height: '100%',
    width: '100%',
    backgroundColor: '#1C1C1E',
    marginTop: 'auto',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  scorePercentage: {
    color: '#007AFF',
    fontSize: 22,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: '#2C2C2E',
    padding: 20,
    paddingTop: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderColor: '#3A3A3C',
    borderWidth: 1,
  },
  questionText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  correctText: {
    color: '#34C759',
    fontSize: 15,
    fontWeight: '600',
  },
  incorrectText: {
    color: '#FF453A',
    fontSize: 15,
    fontWeight: '600',
  },
  choiceButton: {
    backgroundColor: '#1C1C1E',
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderColor: '#3A3A3C',
    borderWidth: 1,
  },
  choiceText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  warningText: {
    color: '#FF453A',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
  },
});
