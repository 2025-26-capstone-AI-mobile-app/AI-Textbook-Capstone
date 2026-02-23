import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserName, logout } from '@/api/login/loginApi';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { loadTextbooks } from '@/api/textbook/textbookApi';
import AddTextbookOverlay from '@/components/addTextbookOverlay';
import { fetchChats, loadChat } from '@/api/chat/aiChatApi';
import { ChatSession, Message } from '@/chatTypes';

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
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('');
  const [textbooks, setTextbooks] = useState([]);
  const [hasTextbooks, setHasTextbooks] = useState(false);
  const [addTextbookOverlayVisibile, setAddTextbookOverlayVisibile] = useState(false);
  const [showTextbooks, setShowTextbooks] = useState(false);


  const [showChats, setShowChats] = useState(false)
  const [chats, setChats] = useState<ChatSession[] | null>(null)
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [scrollOffset, setScrollOffset] = useState<number>(0); //used to auto scroll to bottom on load
  const [chatViewHeight, setChatViewHeight] = useState<number>(0);
  const chatRef = useRef(null);
  const TEMP_MESSAGE_ID = 'TEMPMSG';

  useEffect(() => {
    // get username if we don't already have it
    if (username === '') {
      getUserName().then((newUsername) => {
        setUsername(newUsername);
        console.log(username);
      });
    } else if (!hasTextbooks || !token) {
      AsyncStorage.getItem('access_token')
        .then((token) => {
          if (!token) {
            Alert.alert('failed to retrieve access token');
          } else {
            setToken(token);
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

            fetchChats(token).then((data: ChatSession[]) => {
              setChats(data)
            })
          }
        })
        .catch((error) => {
          Alert.alert('failed to retrieve access token');
          console.log(error.message);
        });
    }
  });

  useLayoutEffect(() => {
    chatRef.current?.measure((_x: number, _y: number, _width: number, height: number) => {
      setChatViewHeight(height);
    });
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

  // Opens chat given session id
  const openChat = async (chatId: string, title: string) => {
    try {
      setChatOpen(true);
      setChatTitle(title);
      setMessages(await loadChat(token, chatId));
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

  // Closes chat window
  const closeChat = () => {
    setChatOpen(false);
    setMessages([]);
    setSessionId(null);
    fetchChats(token).then((newChats) => setChats(newChats));
  };

  const ExpandableView = ({children, expanded = false, style }) => {
    const [height] = useState(new Animated.Value(0));
    const [targetHeight, setTargetHeight] = useState(10);
    const contentRef = React.useRef(null)

    useEffect(() => {
      Animated.timing(height, {
        toValue: expanded ? targetHeight : 0,
        duration: 150,
        useNativeDriver: false
      }).start();
    });

    const onLayout = () => {
      contentRef.current?.measure((_x: number, _y: number, _width: number, h: number) => {
        if(h != 0){
          setTargetHeight(h);
        }
      });
    };

    return (
      <Animated.View
        style={{height, overflow: 'hidden'}}>
        <View onLayout={onLayout} style={style} ref={contentRef}>
          {children}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{height: "100%"}}>
      <ScrollView style={styles.scrollView}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <View style={styles.container}>
            <Text style={styles.title}>Welcome {username}!</Text>
            <Text style={styles.subtitle}>You are successfully logged in.</Text>
          </View>

          {/* Textbooks */}
          <TouchableOpacity style={styles.expandableTitle} onPress={() => setShowTextbooks(!showTextbooks)}>
            <Text style={{...styles.title, marginBottom:0}}>
              Textbooks
            </Text>
          </TouchableOpacity>
          <ExpandableView expanded={showTextbooks} style={styles.expandable}>
            <View style={styles.textbookContainer}>
              {textbooks.map((textbook: Textbook) => {
                return (
                  <TouchableOpacity
                    key={textbook.id}
                    style={styles.textbook}
                    onPress={() =>
                      router.push({
                        pathname: '/read/[id]',
                        params: { id: textbook.id, title: textbook.title },
                      })
                    }>
                    <Text style={styles.title}>{textbook.title}</Text>
                    <Text style={styles.subtitle}>{textbook.subject}</Text>
                    <Text style={styles.subtitle}>By {textbook.author}</Text>
                  </TouchableOpacity>
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
          </ExpandableView>

          {/* AI chat */}
          <TouchableOpacity style={styles.expandableTitle} onPress={() => setShowChats(!showChats)}>
            <Text style={{...styles.title, marginBottom:0}}>
              Chat
            </Text>
          </TouchableOpacity>
          <ExpandableView expanded={showChats} style={styles.expandable}>
              <View style={styles.textbookContainer}>
              {/* {textbooks.map((textbook: Textbook) => {
                  return (
                    <View>
                      <TouchableOpacity key={textbook.id} style={styles.expandableTitle}>
                        <Text style={{...styles.title, marginBottom:0}}>
                          {textbook.title}
                        </Text>
                      </TouchableOpacity>

                      {chats
                        ? chats.filter((chat) => chat.).map((session) => {
                            return (
                              <TouchableOpacity
                                key={session.session_id}
                                style={styles.chatSelector}
                                onPress={() => null /*openChat(session.session_id, session.title)}>
                                <Text style={styles.chatSelectorText}>{session.title}</Text>
                                <Text style={styles.chatSelectorSubText}>
                                  {new Date(session.updated_at).toLocaleDateString()}
                                </Text>
                              </TouchableOpacity>
                            );
                          })
                        : []}
                    </View>
                  )
                })}*/}
                
                {chats
                  ? chats.map((session) => {
                      return (
                        <TouchableOpacity
                          key={session.session_id}
                          style={styles.chatSelector}
                          onPress={() => openChat(session.session_id, session.title)}>
                          <Text style={styles.chatSelectorText}>{session.title}</Text>
                          <Text style={styles.chatSelectorSubText}>
                            {new Date(session.updated_at).toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  : []}
              </View>
          </ExpandableView>
          
          
          <Button title="Log out" onPress={logout}></Button>
        </SafeAreaView>
      </ScrollView>

      {/* Chat window */}
      <Modal coverScreen={false} hasBackdrop={false} isVisible={chatOpen} style={styles.modal}>
        <View style={styles.overlayContent}>
          {/* Title and close button */}
          <View style={styles.titleBar}>
            <Text style={styles.chatTitle}>
              {chatTitle.length < 30 ? chatTitle : chatTitle.substring(0, 30) + '...'}
            </Text>
            <View style={styles.closeButton}>
              {/* 
                Button is disabled while waiting for Ai response because closing the
                chat before the response comes back causes issues. Not a great solution,
                but it works.
              */}
              <Button
                title="X"
                onPress={closeChat}
                color="black"></Button>
            </View>
          </View>
          <ScrollView
            style={styles.chatView}
            contentOffset={{ x: 0, y: scrollOffset }}
            ref={chatRef}
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
        </View>
      </Modal>
    </View>
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
  chatTitle: {
    flex: 1,
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0A0',
  },
  scrollView: {
    backgroundColor: '#121212',
  },
  expandable: {
  },
  expandableTitle: {
    padding: 16,
    backgroundColor: '#4a4a4aff',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  chatSelector: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    width: '100%'
  },
  chatSelectorText: {
    color: 'white',
    fontSize: 20,
  },
  chatSelectorSubText: {
    color: 'grey',
    fontSize: 15,
  },
  overlayContent: {
    height: '100%',
    width: '100%',
    backgroundColor: '#383737ff',
    marginTop: 'auto',
    padding: 20,
    borderRadius: 20,
  },
  titleBar: {
    flexDirection: 'row',
    borderBottomColor: 'white',
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  modal: {
    padding: 0,
    margin: 0,
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
  chatView: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
assistantMessage: {
    maxWidth: '80%',
    backgroundColor: '#ffffff68',
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    maxWidth: '80%',
    backgroundColor: '#00c8ff68',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  userMessageText: {
    fontSize: 17,
  },
  assistantMessageText: {
    fontSize: 17,
    textAlign: 'left',
  },
  userTimeStampText: {
    textAlign: 'right',
    paddingRight: 10,
    paddingBottom: 10,
    color: 'white',
  },
  assistantTimeStampText: {
    textAlign: 'left',
    paddingLeft: 10,
    paddingBottom: 10,
    color: 'white',
  },
});
