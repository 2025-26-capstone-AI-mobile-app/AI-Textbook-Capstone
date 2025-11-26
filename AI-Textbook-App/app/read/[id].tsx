// import { useLocalSearchParams, router } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { fetchTextbookContent } from '@/api/textbook/textbookApi';

// export default function ReadTextbookScreen() {
//   const { id } = useLocalSearchParams();
//   const [textbook, setTextbook] = useState<any>(null);

//     useEffect(() => {
//         (async () => {
//             const token = await AsyncStorage.getItem('access_token');
//             if (id && token) {
//             const textbook = await fetchTextbookContent(id as string, token);
//             setTextbook(textbook); // ← no .textbook
//             }
//         })();
//     }, [id]);

//   if (!textbook) return <Text>Loading...</Text>;

//   return <Text>{textbook.title}</Text>;
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212',
//     padding: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 16,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#A0A0A0',
//   },
//   chapterList: {
//     marginTop: 20,
//   },
//   chapterCard: {
//     padding: 12,
//     marginBottom: 10,
//     backgroundColor: '#1E1E1E',
//     borderRadius: 8,
//   },
//   chapterTitle: {
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
// });

// const [textbook, setTextbook] = useState<any>(null);


// <ScrollView style={styles.chapterList}>
//   {textbook.chapters.map((chapter: any) => (
//     <TouchableOpacity
//       key={chapter.id}
//       style={styles.chapterCard}
//       onPress={() =>
//         router.push({
//           pathname: '/read/[id]/[chapter]',
//           params: { id: textbook._id, chapter: chapter.id },
//         })
//       }
//     >
//       <Text style={styles.chapterTitle}>{chapter.title}</Text>
//     </TouchableOpacity>
//   ))}
// </ScrollView>

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';
import { router } from 'expo-router';

export default function ReadTextbookScreen() {
  const { id } = useLocalSearchParams();
  const [textbook, setTextbook] = useState<any>(null);

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
        {textbook.chapters.map((chapter: any) => (
          <TouchableOpacity
            key={chapter.id}
            style={styles.chapterCard}
            onPress={() =>
              router.push({
                pathname: '../read/[id]/[chapter]',
                params: { id: textbook._id, chapter: chapter.id },
              })
            }
          >
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
          </TouchableOpacity>
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
});
