import {
  ADD_TEXTBOOK_INTERNAL_ERROR,
  ADD_TEXTBOOK_INVALID_AUTHORIZATION,
  ADD_TEXTBOOK_INVALID_CODE,
  ADD_TEXTBOOK_NETWORK_ERROR,
  ADD_TEXTBOOK_SUCCESS,
  addTextbookToLibrary,
} from '@/api/textbook/addTextbookApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Modal, View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isVisible: boolean;
  onClose: (updated: boolean) => void;
};

export default function AddTextbookOverlay({ isVisible, onClose }: Props) {
  const [textbookCode, setTextbookCode] = useState('');

  const submit = async () => {
    let token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert('Failed to retrieve access token');
      return;
    }

    let ret = await addTextbookToLibrary(textbookCode, token);
    console.log(ret);
    switch (ret) {
      case ADD_TEXTBOOK_SUCCESS:
        onClose(true);
        break;
      case ADD_TEXTBOOK_INVALID_AUTHORIZATION:
        Alert.alert('Failed to Add Textbook: Invalid Authorization');
        break;
      case ADD_TEXTBOOK_NETWORK_ERROR:
        Alert.alert('Failed to Add Textbook: Network Error');
        break;
      case ADD_TEXTBOOK_INVALID_CODE:
        Alert.alert('Textbook Code Invalid. Please enter a valid 6 digit code');
        break;
      case ADD_TEXTBOOK_INTERNAL_ERROR:
        Alert.alert('Failed to Add Textbook: Internal Error');
        break;
    }
    if (ret === ADD_TEXTBOOK_SUCCESS) {
      onClose(true);
    }
  };

  const cancel = () => onClose(false);

  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
              </View>
              <Text style={styles.cardTitle}>Add Textbook</Text>
              <Text style={styles.cardSubtitle}>Enter your 6-digit textbook code</Text>
            </View>

            <Text style={styles.label}>Textbook Code</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#48484A"
                value={textbookCode}
                onChangeText={setTextbookCode}
                autoCapitalize="none"
                maxLength={6}
                id="textbook-code"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={submit}>
              <Text style={styles.submitButtonText}>Add to Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={cancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0A0A0',
    marginBottom: 8,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
