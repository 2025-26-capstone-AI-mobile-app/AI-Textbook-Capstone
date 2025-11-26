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
import { Modal, View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';

type Props = {
  isVisible: boolean;
  onClose: (updated: boolean) => void;
};

export default function AddTextbookOverlay({ isVisible, onClose }: Props) {
  const [textbookCode, setTextbookCode] = useState('');

  const submit = async () => {
    // get access token
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
        <View style={styles.modal_content}>
          <View style={styles.form}>
            <Text style={styles.form_label}>Add Textbook</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Textbook Code(6 digits)"
              placeholderTextColor="#777"
              value={textbookCode}
              onChangeText={setTextbookCode}
              autoCapitalize="none"
              maxLength={6}
              id="textbook-code"
            />
            <View style={styles.button_bar}>
              <Button title="Submit" onPress={submit}></Button>
              <Button title="Cancel" onPress={cancel}></Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    paddingRight: 50,
  },
  modal_content: {
    height: '100%',
    width: '100%',
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12121266',
  },
  form: {
    backgroundColor: '#121212',
    padding: 25,
    borderRadius: 10,
  },
  form_label: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    width: '50%',
  },
  button_bar: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
});
