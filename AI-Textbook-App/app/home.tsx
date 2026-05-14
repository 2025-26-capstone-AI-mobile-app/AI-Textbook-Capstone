import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserName, logout } from '@/api/login/loginApi';
import React, { useEffect, useState } from 'react';
import { loadTextbooks } from '@/api/textbook/textbookApi';
import AddTextbookOverlay from '@/components/addTextbookOverlay';
import { Ionicons } from '@expo/vector-icons';

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
              if (!data) {
                Alert.alert('Failed to fetch textbooks');
                return;
              }
              if (data.is_authenticated !== true) {
                Alert.alert('Your login has expired');
                logout();
                return;
              }
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.headerSubtitle}>Your personal textbook library</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Textbooks</Text>
          <Text style={styles.sectionCount}>{textbooks.length}</Text>
        </View>

        <View style={styles.listContainer}>
          {textbooks.map((textbook: Textbook) => {
            return (
              <TouchableOpacity
                key={textbook.id}
                style={styles.textbookCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/read/[id]',
                    params: { id: textbook.id, title: textbook.title },
                  })
                }>
                <View style={styles.textbookIcon}>
                  <Ionicons name="book" size={24} color="#007AFF" />
                </View>
                <View style={styles.textbookInfo}>
                  <Text style={styles.textbookTitle} numberOfLines={1}>
                    {textbook.title}
                  </Text>
                  <Text style={styles.textbookSubject}>{textbook.subject}</Text>
                  <Text style={styles.textbookAuthor}>By {textbook.author}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#48484A" />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addTextbookCard}
            activeOpacity={0.7}
            onPress={addTextbook}>
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={28} color="#007AFF" />
            </View>
            <Text style={styles.addTextbookText}>Add New Textbook</Text>
          </TouchableOpacity>

          <AddTextbookOverlay
            isVisible={addTextbookOverlayVisibile}
            onClose={onAddTextbookSubmit}
          />
        </View>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() => router.navigate('/')}>
          <Text style={styles.testButtonText}>Test persistence</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  headerSection: {
    marginBottom: 32,
    marginTop: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 10,
  },
  listContainer: {
    gap: 12,
  },
  textbookCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  textbookIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textbookInfo: {
    flex: 1,
  },
  textbookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  textbookSubject: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 2,
  },
  textbookAuthor: {
    fontSize: 13,
    color: '#8E8E93',
  },
  addTextbookCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderStyle: 'dashed',
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  addTextbookText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  testButton: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: -20,
  },
  testButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 32,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
