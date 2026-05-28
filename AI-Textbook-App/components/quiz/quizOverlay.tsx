import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { fetchQuizzes, generateQuiz } from '@/api/quiz/aiQuizApi';
import { Question, Quiz, QuizResult } from '@/types/quizTypes';
import { SelectList } from 'react-native-dropdown-select-list';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';
import { logout } from '@/api/login/loginApi';

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

  // Get Token
  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  });

  // Get old quizzes
  useEffect(() => {
    if (quizzes === null) {
      updateQuizzes();
    }
  });

  // Get subchapters
  useEffect(() => {
    if (subChapters.length === 0 && token.length > 0) {
      updateQuizList();
    }
  });

  // Gets list of quizzes from the backend
  const updateQuizList = () => {
    fetchTextbookContent(textbookId, token).then((data: any) => {
      if (data) {
        const newSubChapters = data.chapters.find((c: any) => '' + c.id === chapterId).sub_chapters;
        setSubChapters(newSubChapters.map((subChapter: any) => ({ title: subChapter.title })));
      }
    });
  };

  // Generate new quiz
  const createQuiz = () => {
    if (selectedSubChapter) {
      setLoading(true);
      generateQuiz(token, '', selectedSubChapter, selectedQuestionCount, chapterId, textbookId)
        .then((quiz) => {
          if (!Array.isArray(quiz)) {
            //Error
            if (quiz.detail === 'Invalid token') {
              Alert.alert('Login expired', 'Please log back in', [
                {
                  text: 'Ok',
                  onPress: () => logout(),
                },
              ]);
            }
            setLoading(false);
            return;
          }

          if (quiz.length > 0) {
            openQuiz(quiz, selectedSubChapter);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      Alert.alert('Please choose a subchapter');
    }
  };

  // Open Quiz overlay
  const openQuiz = (quiz: Question[], title: string) => {
    setQuizTitle(title);
    setShowCorrectAnswers(false);
    setCurrentQuiz(quiz);
    setQuizChoices(new Array(quiz.length).fill(-1));
    setQuizOpen(true);
  };

  // Close quiz overlay
  const closeQuiz = () => {
    setQuizOpen(false);
    setShowCorrectAnswers(false);
    setCurrentQuiz(null);
    setQuizChoices([]);
    setQuizTitle('');
    setLoading(false);
  };

  // Grade the currently openned quiz
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

  // Given the index of the question and the index of the choice, returns a color
  const setQuizOptionColor = (qIndex: number, cIndex: number) => {
    if (!currentQuiz) return {};

    if (showCorrectAnswers) {
      if (quizChoices[qIndex] === cIndex) {
        //this option has been selected by the user
        if (cIndex === currentQuiz[qIndex].answer) {
          // user selected correct answer
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'orange' };
        }
      } else if (cIndex === currentQuiz[qIndex].answer) {
        return { backgroundColor: 'green' };
      }
    } else if (quizChoices[qIndex] === cIndex) {
      //this option has been selected by the user
      return { backgroundColor: '#007AFF' };
    }

    return {};
  };

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        {/* Title and close button */}
        <View style={styles.titleBar}>
          <Text style={styles.title}>Create New Quiz</Text>
          <View style={styles.closeButton}>
            <Button title="X" onPress={closeFunc} color="black"></Button>
          </View>
        </View>

        {/* Quiz form */}
        <View>
          <Text style={styles.subTitle}>Subchapter </Text>
          {subChapters.length > 0 ? <Text testID="testText"></Text> : []}
          <SelectList
            setSelected={(val) => setSelectedSubChapter(val)}
            data={subChapters.map((c) => ({ key: c.title, value: c.title }))}
            save="value"
            boxStyles={styles.selectorButton}
            inputStyles={styles.selectorButtonText}
            dropdownTextStyles={styles.selectorButtonText}
            arrowicon={<></>}
            searchicon={<View testID="searchIcon" />} // Should change this later. Test id is required though
          />

          {/**  <SelectDropdown
          //   testID='subChapterDropDown'
          //   ref={selectorRef}
          //   data={subChapters}
          //   onSelect={(selectedItem) => {
          //     setSelectedSubChapter(selectedItem.title);
          //   }}
          //   renderButton={(selectedItem: { title: string }) => (
          //     <View style={styles.selectorButton} testID='subChapterDropDownButton'>
          //       <Text style={styles.selectorButtonText}>
          //         {selectedItem ? selectedItem.title : 'Select a subchapter to focus on'}
          //       </Text>
          //     </View>
          //   )}
          //   renderItem={(item: { title: string }, index: number, isSelected: boolean) => (
          //     <View testID={'dropDownItem:' + index} style={{ ...styles.selectorItem, ...(isSelected && styles.selectedItem) }}>
          //       <Text style={styles.selectorButtonText}>{item ? item.title : ''}</Text>
          //     </View>
          //   )}></SelectDropdown> */}

          <Text style={styles.subTitle}>Number of Questions</Text>
          <SelectList
            setSelected={(val) => setSelectedQuestionCount(val)}
            data={allowedQuestionCounts.map((c) => ({ key: c, value: c + '' }))}
            save="key"
            boxStyles={styles.selectorButton}
            inputStyles={styles.selectorButtonText}
            dropdownTextStyles={styles.selectorButtonText}
            arrowicon={<></>}
            searchicon={<View testID="searchIcon" />}
            defaultOption={{ key: 5, value: '5' }}
          />

          {/*<SelectDropdown
            ref={selectorRef}
            data={allowedQuestionCounts}
            defaultValue={5}
            onSelect={(selectedItem) => {
              setSelectedQuestionCount(selectedItem);
            }}
            renderButton={(selectedItem) => (
              <View style={styles.selectorButton}>
                <Text style={styles.selectorButtonText}>{selectedItem}</Text>
              </View>
            )}
            renderItem={(item, index, isSelected) => (
              <View style={{ ...styles.selectorItem, ...(isSelected && styles.selectedItem) }}>
                <Text style={styles.selectorButtonText}>{item}</Text>
              </View>
            )}></SelectDropdown>*/}

          <View style={styles.submitButton}>
            <Button
              testID="GenerateButton"
              color="white"
              background-color="#007AFF"
              title="Generate"
              onPress={createQuiz}></Button>
          </View>
        </View>

        {/* Previous quizzes */}
        <View style={styles.flexBox}>
          <Text style={{ ...styles.subTitle, ...styles.titleBar }}>View Previous Quizzes</Text>
          <ScrollView>
            {quizzes && quizzes.map ? ( // I don't know why, but this doesn't work without quizzes.map
              quizzes.map((quiz) => {
                return (
                  <TouchableOpacity
                    key={quiz._id}
                    style={styles.quizSelector}
                    onPress={() => openQuiz(quiz.quiz, quiz.hint)}>
                    <Text style={styles.quizSelectorText}>{quiz.hint}</Text>
                    <Text style={styles.quizSelectorSubText}>
                      {new Date(quiz.created_time * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text>No Quizzes</Text>
            )}
          </ScrollView>
        </View>
      </View>

      <Modal coverScreen={false} hasBackdrop={false} isVisible={loading} style={styles.modal}>
        <View style={{ ...styles.overlayContent, ...styles.loadingView }}>
          <ActivityIndicator style={{ paddingRight: 20 }} size="large" color="#007AFF" />
          <Text style={{ ...styles.loadingText }}>Loading...</Text>
        </View>
      </Modal>

      {/* Actual quiz */}
      <Modal coverScreen={false} hasBackdrop={false} isVisible={quizOpen} style={styles.modal}>
        <View testID="openQuiz" style={styles.overlayContent}>
          {/* Title and close button */}
          <View style={styles.titleBar}>
            <Text style={styles.title}>{quizTitle}</Text>
            <View style={styles.closeButton}>
              <Button title="X" onPress={closeQuiz} color="black"></Button>
            </View>
          </View>
          {showCorrectAnswers ? (
            <Text
              style={styles.subTitle}
              testID={
                'testResults:' + quizResult?.correctAnswers + '/' + quizResult?.totalQuestions
              }>
              Score {quizResult?.correctAnswers}/{quizResult?.totalQuestions}
            </Text>
          ) : (
            []
          )}

          {/* Questions */}
          <ScrollView ref={quizScrollRef}>
            {currentQuiz
              ? currentQuiz.map((question, index) => (
                  <View key={index} style={styles.questionView}>
                    <Text testID={'Q' + (index + 1)} style={styles.subTitle}>
                      {index + 1}. {question.question}
                    </Text>
                    {showCorrectAnswers && currentQuiz[index].answer === quizChoices[index] ? (
                      <Text testID={'Q' + (index + 1) + 'T'} style={styles.correct}>
                        Correct
                      </Text>
                    ) : showCorrectAnswers ? (
                      <Text testID={'Q' + (index + 1) + 'F'} style={styles.incorrect}>
                        Incorrect
                      </Text>
                    ) : (
                      []
                    )}

                    {/* Options */}
                    {question.choices.map((choice, cIndex) => (
                      <TouchableOpacity
                        style={{ ...styles.quizChoice, ...setQuizOptionColor(index, cIndex) }}
                        key={cIndex}
                        onPress={() => {
                          quizChoices[index] = cIndex;
                          setQuizChoices([...quizChoices]);
                        }}
                        disabled={showCorrectAnswers}
                        testID={'Q' + (index + 1) + 'C' + cIndex}>
                        <Text style={styles.quizChoiceText}>{choice}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              : []}
            <View style={styles.submitButton}>
              <Button
                color="white"
                background-color="#007AFF"
                title="Submit"
                onPress={submitQuiz}
                disabled={quizChoices.filter((val) => val === -1).length > 0 || showCorrectAnswers}
                testID="SubmitButton"></Button>
            </View>
            {showCorrectAnswers ? (
              <View style={styles.submitButton}>
                <Button
                  color="white"
                  background-color="#007AFF"
                  title="Try again"
                  onPress={resetQuiz}
                  testID="resetButton"></Button>
              </View>
            ) : (
              []
            )}

            {quizChoices.filter((val) => val === -1).length > 0 ? (
              <Text style={styles.warning}>Please answer all questions</Text>
            ) : (
              []
            )}

            {/* This is just a spacer at the bottom */}
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
    display: 'flex',
    height: '100%',
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
  subTitle: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  titleBar: {
    flexDirection: 'row',
    borderBottomColor: 'white',
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  closeButton: {
    borderRadius: 20,
    backgroundColor: '#ffffff68',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignContent: 'center',
    color: 'white',
  },
  newChatButton: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  quizSelector: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  quizSelectorText: {
    color: 'white',
    fontSize: 20,
  },
  quizSelectorSubText: {
    color: 'grey',
    fontSize: 15,
  },
  chatView: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  chatSendButton: {
    justifyContent: 'center',
    alignContent: 'center',
    height: 50,
    width: 50,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 30,
  },
  assistantMessage: {
    maxWidth: '80%',
    backgroundColor: '#ffffff68',
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    maxWidth: '80%',
    backgroundColor: '#00c8ff68',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  userMessageText: {
    fontSize: 17,
  },
  assistantMessageText: {
    fontSize: 17,
    textAlign: 'left',
  },
  userTimeStampText: {
    textAlign: 'right',
    paddingRight: 10,
    paddingBottom: 10,
    color: 'white',
  },
  assistantTimeStampText: {
    textAlign: 'left',
    paddingLeft: 10,
    paddingBottom: 10,
    color: 'white',
  },
  selectorButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    paddingRight: 50,
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  },
  selectorButtonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  selectorItem: {
    backgroundColor: '#2C2C2E',
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    paddingRight: 50,
    justifyContent: 'center',
  },
  selectedItem: {
    backgroundColor: '#38383a',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: 10,
  },
  questionView: {
    backgroundColor: '#2C2C2E',
    padding: 20,
    paddingTop: 10,
    margin: 5,
    borderRadius: 10,
    borderColor: '#4e4e52',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  quizChoice: {
    backgroundColor: '#383737ff',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    borderColor: '#4e4e52',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  quizChoiceText: {
    color: 'white',
    fontSize: 20,
  },
  quizSelectedChoice: {
    backgroundColor: '#007AFF',
  },
  warning: {
    color: 'red',
    textAlign: 'center',
  },
  correct: {
    color: 'green',
    fontSize: 20,
  },
  incorrect: {
    color: 'red',
    fontSize: 20,
  },
  flexBox: {
    flex: 1,
  },
  loadingView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
});
