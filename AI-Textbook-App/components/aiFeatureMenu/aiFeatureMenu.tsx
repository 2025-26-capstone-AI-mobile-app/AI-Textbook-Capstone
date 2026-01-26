import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import AIChatOverlay from '../chat/chatOverlay';

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void;
};

export default function AIFeatureMenu({ isVisible, textbookId, chapterId, closeFunc }: Props) {
  //feature list
  const FEATURE_NONE = 0;
  const FEATURE_CHAT = 1;

  const [token, setToken] = useState<string>('');
  const [featureSelected, setFeatureSelected] = useState<number>(FEATURE_NONE);

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  });

  const openChat = () => {
    setFeatureSelected(FEATURE_CHAT);
  };

  const closeChat = () => {
    setFeatureSelected(FEATURE_NONE);
  };

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        {/* Title and close button */}
        <View style={styles.titleBar}>
          <Text style={styles.title}>AI Features</Text>
          <View style={styles.closeButton}>
            <Button title="X" onPress={closeFunc} color="black"></Button>
          </View>
        </View>

        <ScrollView>
          {/* Feature selectors */}
          <TouchableOpacity style={styles.featureSelector} onPress={openChat}>
            <Text style={styles.featureSelectorText}>AI Chat</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <AIChatOverlay
        isVisible={featureSelected === FEATURE_CHAT}
        textbookId={textbookId}
        chapterId={chapterId}
        closeFunc={closeChat}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 0,
    margin: 0,
  },
  overlayContent: {
    height: '75%',
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
  featureSelector: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  featureSelectorText: {
    color: 'white',
    fontSize: 20,
  },
  featureSelectorSubText: {
    color: 'grey',
    fontSize: 15,
  },
});
