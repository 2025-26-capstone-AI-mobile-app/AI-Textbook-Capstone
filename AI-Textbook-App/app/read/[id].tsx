import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';
import { router } from 'expo-router';

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

  if (!textbook) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{textbook.title}</Text>
      <Text style={styles.subtitle}>By {textbook.author}</Text>

      <ScrollView style={styles.chapterList}>
        {textbook.chapters.map((chapter: any, index: number) => (
        <View key={chapter.id} style={styles.chapterCard}>
          <View style={styles.chapterHeaderRow}>
            {/* Expand/collapse toggle */}
            <Pressable
              onPress={() =>
                setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)
              }
              style={({ pressed }) => [
                styles.chapterArrow,
                { backgroundColor: pressed ? '#2A2A2A' : 'transparent' },
              ]}
            >
              <Text style={styles.arrowText}>
                {expandedChapter === chapter.id ? '▼' : '▶'}
              </Text>
            </Pressable>

            {/* Chapter title opens the chapter */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '../read/[id]/[chapter]',
                  params: {
                    id: textbook._id,
                    chapter: chapter.id,
                    pageOffset: 1, // open first page of chapter
                  },
                })
              }
              style={({ pressed }) => [
                styles.chapterTitleWrapper,
                { backgroundColor: pressed ? '#2A2A2A' : 'transparent' },
              ]}
            >
              <Text style={styles.chapterTitle}>
                Chapter {index + 1}: {chapter.title}
              </Text>
            </Pressable>
          </View>

          {/* Subchapters dropdown */}
          {expandedChapter === chapter.id && chapter.sub_chapters?.length > 0 && (
            <View style={styles.subChapterList}>
              {chapter.sub_chapters.map((sub: any, index: number) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.subChapterCard,
                    { backgroundColor: pressed ? '#333333' : '#1E1E1E' },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '../read/[id]/[chapter]',
                      params: {
                        id: textbook._id,
                        chapter: chapter.id,
                        subchapter: sub.title,
                        pageOffset: sub.pageOffset + 1,
                      },
                    })
                  }
                >
                  <Text style={styles.subChapterTitle}>• {sub.title}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#A0A0A0' },
  chapterList: { marginTop: 20 },
  chapterCard: { padding: 12, marginBottom: 10, backgroundColor: '#1E1E1E', borderRadius: 8 },
  chapterTitle: { color: '#FFFFFF', fontSize: 16 },
  chapterHeader: {
    padding: 12,
    borderRadius: 8,
  },
  subChapterList: {
    marginTop: 8,
    marginLeft: 12,
  },
  subChapterCard: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 2,
  },
  subChapterTitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  chapterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterArrow: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  chapterTitleWrapper: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
  },

});
