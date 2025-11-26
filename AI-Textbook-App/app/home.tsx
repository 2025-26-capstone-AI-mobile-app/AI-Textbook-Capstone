import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TouchableHighlight,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserName, logout } from '@/api/login/loginApi';
import React, { useEffect, useState } from 'react';
import { loadTextbooks } from '@/api/textbook/textbookApi';
import AddTextbookOverlay from '@/components/addTextbookOverlay';

interface Textbook {
  id: string;
  title: string;
  author: string;
  subject: string;
  cover: string;
  progress?: number;
  lastAccessed?: string;
  starred?: boolean;
}

export default function HomeScreen() {
  const [username, setUsername] = useState('');
  const [textbooks, setTextbooks] = useState([]);
  const [hasTextbooks, setHasTextbooks] = useState(false);
  const [addTextbookOverlayVisibile, setAddTextbookOverlayVisibile] = useState(false);

  useEffect(() => {
    // get username if we don't already have it
    if (username === '') {
      getUserName().then((newUsername) => {
        setUsername(newUsername);
        console.log(username);
      });
    } else if (!hasTextbooks) {
      AsyncStorage.getItem('access_token')
        .then((token) => {
          if (!token) {
            Alert.alert('failed to retrieve access token');
          } else {
            loadTextbooks(token).then((data: any) => {
              let textbooksList = data.textbooks.map((x: any) => {
                let textbookOut: Textbook = {
                  id: x.id ?? '',
                  title: x.title ?? '',
                  author: x.author ?? '',
                  subject: x.subject ?? '',
                  cover: x.cover,
                };
                return textbookOut;
              });

              setTextbooks(textbooksList);
              setHasTextbooks(true);
              console.log(textbooksList);
              console.log(token);
            });
          }
        })
        .catch((error) => {
          Alert.alert('failed to retrieve access token');
          console.log(error.message);
        });
    }
  });

  const addTextbook = () => {
    setAddTextbookOverlayVisibile(true);
  };

  const onAddTextbookSubmit = (updated: boolean) => {
    // update textbooks if necesary
    if (updated) {
      setHasTextbooks(false);
    }

    setAddTextbookOverlayVisibile(false);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <Text style={styles.title}>Welcome {username}!</Text>
          <Text style={styles.subtitle}>You are successfully logged in.</Text>
        </View>
        <View style={styles.textbookContainer}>
          {textbooks.map((textbook: Textbook) => {
            return (
              <View style={styles.textbook} key={textbook.id}>
                <Text style={styles.title}>{textbook.title}</Text>

                <Text style={styles.subtitle}>{textbook.subject}</Text>
                <Text style={styles.subtitle}>By {textbook.author}</Text>
              </View>
            );
          })}

          <TouchableHighlight onPress={addTextbook} underlayColor="#4a4a4aff">
            <View style={styles.addTextbook}>
              <Text style={styles.title}>Add new textbook</Text>
            </View>
          </TouchableHighlight>
          <AddTextbookOverlay
            isVisible={addTextbookOverlayVisibile}
            onClose={onAddTextbookSubmit}
          />
        </View>
        <Button title="Test persistence" onPress={() => router.navigate('/')}></Button>
        <Button title="Log out" onPress={logout}></Button>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    padding: 24,
  },
  textbookContainer: {
    padding: 24,
    backgroundColor: '#4a4a4aff',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  textbook: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#2a2a2aff',
    width: 350,
    height: 200,
    borderRadius: 20,
    margin: 10,
  },
  addTextbook: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: '#2a2a2aff',
    backgroundColor: '#383737ff',
    borderWidth: 4,
    width: 350,
    height: 200,
    borderRadius: 20,
    margin: 10,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0A0',
  },
  scrollView: {
    backgroundColor: '#121212',
  },
});
