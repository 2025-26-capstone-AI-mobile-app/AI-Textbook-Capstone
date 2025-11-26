import { Text, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  // On load, check for access token and log in if it's present.
  useEffect(() => {
    AsyncStorage.getItem('access_token').then((token) => {
      if (token) {
        //signed in
        router.replace('/home');
      } else {
        // not signed in
        router.replace('/login');
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});
