import { fetchChats, loadChat, streamMessage, updateChatSummary } from '@/api/chat/aiChatApi';
import { ChatSession, Message } from '@/types/chatTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { logout } from '@/api/login/loginApi';

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void;
};

export default function AIChatOverlay({ isVisible, textbookId, chapterId, closeFunc }: Props) {
  const [token, setToken] = useState<string>('');

  const [chats, setChats] = useState<ChatSession[] | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Chat variables
  const TEMP_MESSAGE_ID = 'TEMPMSG';
  const [chatTitle, setChatTitle] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [scrollOffset, setScrollOffset] = useState<number>(0); //used to auto scroll to bottom on load
  const [chatViewHeight, setChatViewHeight] = useState<number>(0);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatInputEnabled, setChatInputEnabled] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
  });

  const updateChats = (t?: string) => {
    if (!t) t = token;
    fetchChats(t ?? '')
      .then((newChats) => {
        if (typeof newChats === 'string') {
          if (newChats === 'Invalid Token') {
            Alert.alert('Login expired', 'Please log back in', [
              {
                text: 'Ok',
                onPress: () => logout(),
              },
            ]);
          } else {
            Alert.alert('Failed to fetch chats');
            console.log(newChats);
          }
        } else {
          setChats(newChats);
        }
      })
      .catch((error) => {
        Alert.alert('Failed to fetch chats');
        console.error(error);
      });
  };

  // Fetch all user chats
  useEffect(() => {
    // Only call backend if chats has not been set
    if (chats === null) {
      AsyncStorage.getItem('access_token').then((t) => {
        setToken(t ?? '');
        setChats([]);
        updateChats(t ?? '');
      });
    }
  });

  // Gets height of scrollview containing chat messages. Used to correctly offset scroll view
  useLayoutEffect(() => {
    chatRef.current?.measure((_x: number, _y: number, _width: number, height: number) => {
      setChatViewHeight(height);
    });
  });

  // Opens chat given session id
  const openChat = async (chatId: string, title: string) => {
    try {
      setChatOpen(true);
      setChatTitle(title);
      const resp = await loadChat(token, chatId);
      if (typeof resp === 'string') {
        Alert.alert('Login expired', 'Please log back in', [
          {
            text: 'Ok',
            onPress: () => logout(),
          },
        ]);
      } else {
        setMessages(resp);
      }
      setSessionId(chatId);
    } catch {
      setMessages([
        {
          id: '',
          role: 'assistant',
          content: 'Failed to load messages',
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Opens empty chat
  const openNewChat = async () => {
    setChatOpen(true);
    setChatTitle('New Chat');
    setSessionId(null);
  };

  // Closes chat window
  const closeChat = () => {
    setChatOpen(false);
    setMessages([]);
    if (sessionId) updateChatSummary(token, sessionId);
    setSessionId(null);
    updateChats();
  };

  // Sends whatever is in chatMessage to the backend
  const sendMessage = async () => {
    // ignore empty messages
    if (chatMessage.length === 0) return;

    // Disable chat textbox
    setChatInputEnabled(false);

    // Add user message and placeholder message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: chatMessage,
      role: 'user',
      timestamp: new Date(),
    };
    const tempMessage: Message = {
      id: TEMP_MESSAGE_ID,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((messages) => [...messages, userMessage, tempMessage]);

    try {
      // Send message and update chat
      let response = await streamMessage(token, chatMessage, textbookId, chapterId, sessionId);
      setChatMessage('');

      // A "branch" happens when the ai decideds the topic has changed
      if (chatOpen) {
        if (response.branchCandiate) {
          console.log('Branch candidates found');
          setChatTitle(response.branchCandiate.suggested_title);
          setSessionId(response.branchCandiate.new_session_id);
          updateChats();
        } else if (response.session !== sessionId) {
          setSessionId(response.session);
          updateChats();
        }
      }

      if (response.session == null && response.msg === 'Invalid Token') {
        Alert.alert('Login expired', 'Please log back in', [
          {
            text: 'Ok',
            onPress: () => logout(),
          },
        ]);
        return;
      }

      setMessages((messages) =>
        messages.map((msg) =>
          msg.id === TEMP_MESSAGE_ID
            ? { ...msg, id: Date.now().toString(), content: response.msg }
            : msg,
        ),
      );
    } catch (error) {
      // Print error to chat
      console.error(error);
      setMessages((messages) =>
        messages.map((msg) =>
          msg.id === TEMP_MESSAGE_ID
            ? { ...msg, id: Date.now().toString(), content: 'Error: failed to send message' }
            : msg,
        ),
      );
    }
    setChatInputEnabled(true);
  };

  return (
    <Modal coverScreen={false} hasBackdrop={false} isVisible={isVisible} style={styles.modal}>
      <View style={styles.overlayContent}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.title}>Chats</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeFunc} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={32} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.chatListScroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.newChatRow}
            activeOpacity={0.6}
            onPress={openNewChat}>
            <View style={styles.newChatIconContainer}>
              <Ionicons name="add" size={22} color="#007AFF" />
            </View>
            <Text style={styles.newChatText}>Start new chat</Text>
            <Ionicons name="chevron-forward" size={20} color="#48484A" />
          </TouchableOpacity>

          {chats
            ? chats.map((session) => {
              return (
                <TouchableOpacity
                  key={session.session_id}
                  style={styles.chatRow}
                  activeOpacity={0.6}
                  onPress={() => openChat(session.session_id, session.title)}>
                  <View style={styles.chatRowIconContainer}>
                    <Ionicons name="chatbubble" size={18} color="#8E8E93" />
                  </View>
                  <View style={styles.chatRowTextContainer}>
                    <Text style={styles.chatRowTitle}>{session.title}</Text>
                    <Text style={styles.chatRowDate}>
                      {new Date(session.updated_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#48484A" />
                </TouchableOpacity>
              );
            })
            : []}
        </ScrollView>
      </View>

      {/* Chat window */}
      <Modal coverScreen={false} hasBackdrop={false} isVisible={chatOpen} style={styles.modal}>
        <View style={styles.overlayContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.titleBar}>
            <Text style={styles.title} numberOfLines={1}>
              {chatTitle.length < 30 ? chatTitle : chatTitle.substring(0, 30) + '...'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeChat}
              activeOpacity={0.7}
              disabled={!chatInputEnabled}>
              <Ionicons name="close-circle" size={32} color={chatInputEnabled ? '#8E8E93' : '#3A3A3C'} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.chatView}
            contentOffset={{ x: 0, y: scrollOffset }}
            ref={chatRef}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(_width, height) => {
              setScrollOffset(height - chatViewHeight);
            }}>
            {messages.map((message: Message) => {
              let content = message.content;
              if (message.id === TEMP_MESSAGE_ID) {
                content = '...';
              }
              return (
                <View key={message.id}>
                  <View
                    style={
                      message.role === 'assistant' ? styles.assistantMessage : styles.userMessage
                    }>
                    <Text
                      style={
                        message.role === 'assistant'
                          ? styles.assistantMessageText
                          : styles.userMessageText
                      }>
                      {content}
                    </Text>
                  </View>
                  <Text
                    style={
                      message.role === 'assistant'
                        ? styles.assistantTimeStampText
                        : styles.userTimeStampText
                    }>
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              onChangeText={(text) => setChatMessage(text)}
              value={chatMessage}
              editable={chatInputEnabled}
              placeholder="Type a message..."
              placeholderTextColor="#48484A"
            />
            <TouchableOpacity
              style={styles.chatSendButton}
              onPress={sendMessage}
              activeOpacity={0.7}
              disabled={!chatInputEnabled}>
              <View style={styles.sendIconContainer}>
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#1C1C1E',
    marginTop: 'auto',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A3A3C',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  chatListScroll: {
    flex: 1,
    marginTop: 8,
  },
  newChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  newChatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  newChatText: {
    flex: 1,
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  chatRowIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chatRowTextContainer: {
    flex: 1,
  },
  chatRowTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  chatRowDate: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  chatView: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    height: 44,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 16,
  },
  chatSendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  assistantMessage: {
    maxWidth: '80%',
    backgroundColor: '#2C2C2E',
    marginTop: 6,
    marginBottom: 2,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  userMessage: {
    maxWidth: '80%',
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginBottom: 2,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderTopRightRadius: 4,
    marginLeft: 'auto',
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  assistantMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  userTimeStampText: {
    textAlign: 'right',
    paddingRight: 8,
    paddingBottom: 6,
    color: '#8E8E93',
    fontSize: 11,
  },
  assistantTimeStampText: {
    textAlign: 'left',
    paddingLeft: 8,
    paddingBottom: 6,
    color: '#8E8E93',
    fontSize: 11,
  },
});
