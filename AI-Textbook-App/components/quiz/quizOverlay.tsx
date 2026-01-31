import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { fetchQuizzes } from '@/api/quiz/aiQuizApi';
import { Quiz } from '@/types/quizTypes';

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void;
};

export default function AIQuizOverlay({ isVisible, textbookId, chapterId, closeFunc }: Props) {
  const [token, setToken] = useState<string>('');

  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);

  const updateQuizzes = () => {
    fetchQuizzes(token).then((newQuizzes) => {
      setQuizzes(newQuizzes);
    }).catch((reason) => {
      console.log(`Failed to fetch quizzes: ${reason}`);
      Alert.alert('Failed to fetch quizzes');
    })
  }

  // Get Token
  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  });

  // Get old quizzes
  useEffect(() => {
    if(quizzes === null){
      updateQuizzes();
    } 
  })

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        {/* Title and close button */}
        <View style={styles.titleBar}>
          <Text style={styles.title}>Quiz</Text>
          <View style={styles.closeButton}>
            <Button title="X" onPress={closeFunc} color="black"></Button>
          </View>
        </View>

        {/* Quiz form */}
        <View>
          <Text style={{...styles.subTitle}}>Generate New Quiz</Text>
        </View>

        {/* Previous quizzes */}
        <View>
          <Text style={{...styles.subTitle,...styles.titleBar}}>Previous Quizzes</Text>
          <ScrollView>
            {quizzes && quizzes.map // I don't know why, but this doesn't work without quizzes.map
              ? quizzes.map((quiz) => {
                return (
                  <TouchableOpacity key={quiz._id} style={styles.quizSelector}>
                    <Text style={styles.quizSelectorText}>{quiz.hint}</Text>
                    <Text style={styles.quizSelectorSubText}>{new Date(quiz.created_time * 1000).toLocaleString("en-US",{year:'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                );
              }) : <Text>No Quizzes</Text>}
          </ScrollView>
        </View>
        
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
  chatInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
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
});
