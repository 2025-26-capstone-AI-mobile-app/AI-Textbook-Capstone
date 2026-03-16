// AI-Textbook-App/add/read/[id].tsx
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function ReadTextbookScreen() {
  const { id } = useLocalSearchParams();
  const [textbook, setTextbook] = useState<any>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (id && token) {
        const data = await fetchTextbookContent(id as string, token);
        setTextbook(data);
      }
    })();
  }, [id]);

  const title = textbook?.title ?? 'Loading…';

  return (
    <>
      <Stack.Screen options={{ title, headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        {!textbook ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading textbook…</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#007AFF" />
              <Text style={styles.backText}>Library</Text>
            </Pressable>

            <View style={styles.headerSection}>
              <View style={styles.titleIconRow}>
                <View style={styles.bookIconContainer}>
                  <Ionicons name="book" size={28} color="#007AFF" />
                </View>
                <View style={styles.titleTextContainer}>
                  <Text style={styles.title} numberOfLines={2}>
                    {textbook.title}
                  </Text>
                  <Text style={styles.author}>By {textbook.author}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Table of Contents</Text>
              <Text style={styles.chapterCount}>{textbook.chapters?.length ?? 0} chapters</Text>
            </View>

            <View style={styles.chapterList}>
              {textbook.chapters.map((chapter: any, index: number) => (
                <View key={chapter.id} style={styles.chapterCard}>
                  <View style={styles.chapterHeaderRow}>
                    <Pressable
                      onPress={() =>
                        setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)
                      }
                      style={({ pressed }) => [
                        styles.chapterArrow,
                        { backgroundColor: pressed ? '#2C2C2E' : 'transparent' },
                      ]}>
                      <Ionicons
                        name={expandedChapter === chapter.id ? 'chevron-down' : 'chevron-forward'}
                        size={18}
                        color="#8E8E93"
                      />
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '../read/[id]/[chapter]',
                          params: {
                            id: textbook.id,
                            chapter: chapter.id,
                            chapterTitle: chapter.title,
                            textbookTitle: textbook.title,
                            pageOffset: 1,
                          },
                        })
                      }
                      style={({ pressed }) => [
                        styles.chapterTitleWrapper,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}>
                      <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    </Pressable>

                    <Ionicons name="arrow-forward-circle-outline" size={22} color="#48484A" />
                  </View>

                  {expandedChapter === chapter.id && chapter.sub_chapters?.length > 0 && (
                    <View style={styles.subChapterList}>
                      {chapter.sub_chapters.map((sub: any, index: number) => (
                        <Pressable
                          key={index}
                          style={({ pressed }) => [
                            styles.subChapterCard,
                            { backgroundColor: pressed ? '#2C2C2E' : '#1C1C1E' },
                          ]}
                          onPress={() =>
                            router.push({
                              pathname: '../read/[id]/[chapter]',
                              params: {
                                id: textbook.id,
                                chapter: chapter.id,
                                chapterTitle: chapter.title,
                                textbookTitle: textbook.title,
                                subchapter: sub.title,
                                pageOffset: sub.pageOffset + 1,
                              },
                            })
                          }>
                          <View style={styles.subChapterDot} />
                          <Text style={styles.subChapterTitle}>{sub.title}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chapterCount: {
    fontSize: 13,
    color: '#8E8E93',
  },
  chapterList: {
    gap: 10,
  },
  chapterCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  chapterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chapterTitleWrapper: {
    flex: 1,
    paddingVertical: 4,
  },
  chapterNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  subChapterList: {
    marginTop: 10,
    marginLeft: 46,
    borderLeftWidth: 1,
    borderLeftColor: '#2C2C2E',
    paddingLeft: 12,
    gap: 2,
  },
  subChapterCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subChapterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginRight: 10,
  },
  subChapterTitle: {
    color: '#A0A0A0',
    fontSize: 14,
    flex: 1,
  },
});
