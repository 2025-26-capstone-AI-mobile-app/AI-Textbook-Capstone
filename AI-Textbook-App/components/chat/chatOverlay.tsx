import { fetchChats, loadChat, streamMessage } from "@/api/chat/aiChatApi";
import { ChatSession, Message } from "@/chatTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Button, TouchableOpacity, ScrollView, TextInput } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Modal from "react-native-modal"

type Props = {
  isVisible: boolean;
  textbookId: string;
  chapterId: string;
  closeFunc: () => void
};

export default function AIChatOverlay({
     isVisible, 
     textbookId,
     chapterId,
     closeFunc 
    }: Props) {

    const [token, setToken] = useState<string>("");

    const [chats, setChats] = useState<ChatSession[] | null>(null);
    const [chatOpen, setChatOpen] = useState<boolean>(false);

    // Chat variables
    const TEMP_MESSAGE_ID = "TEMPMSG"
    const [chatTitle, setChatTitle] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [scrollOffset, setScrollOffset] = useState<number>(0); //used to auto scroll to bottom on load
    const [chatViewHeight, setChatViewHeight] = useState<number>(0);
    const [chatMessage, setChatMessage] = useState<string>('');
    const [chatInputEnabled, setChatInputEnabled] = useState<boolean>(true);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const chatRef = useRef(null);

    useEffect(() => {
        AsyncStorage.getItem('access_token').then((t) => setToken(t ?? ''));
    })

    // Fetch all user chats
    useEffect(() => {
        // Only call backend if chats has not been set
        if(chats === null){
            AsyncStorage.getItem('access_token').then((t) => {
                setToken(t ?? '');
                setChats([]);
                fetchChats(t ?? '').then((newChats) => {
                    setChats(newChats);
                }).catch((error) => {
                    Alert.alert("Failed to fetch chats");
                    console.error(error);
                })
            });
        }
    });

    // Gets height of scrollview containing chat messages. Used to correctly offset scroll view
    useLayoutEffect(() => {
        chatRef.current?.measure((_x: number, _y: number, _width: number, height: number) => {
            setChatViewHeight(height);
        })
    })

    // Opens chat given session id
    const openChat = async (chatId: string, title: string) => {
        try {
            setChatOpen(true);
            setChatTitle(title);
            setMessages(await loadChat(token, chatId));
            setSessionId(chatId);
        } catch {
            setMessages([{
                id:'', 
                role:'assistant', 
                content:'Failed to load messages',
                timestamp: new Date()
            }])
        }
    }

    // Opens empty chat
    const openNewChat = async () => {
        setChatOpen(true);
        setChatTitle("New Chat");
        setSessionId(null);
    }

    // Closes chat window
    const closeChat = () => {
        setChatOpen(false);
        setMessages([]);
        setSessionId(null);
        fetchChats(token).then((newChats) => setChats(newChats));
    }

    // Sends whatever is in chatMessage to the backend
    const sendMessage = async () => {
        // ignore empty messages
        if(chatMessage.length == 0) return;

        // Disable chat textbox
        setChatInputEnabled(false);

        // Add user message and placeholder message to chat
        const userMessage: Message = {id: Date.now().toString(), content: chatMessage, role: "user", timestamp: new Date()}
        const tempMessage: Message = { id: TEMP_MESSAGE_ID, content: "", role: "assistant", timestamp: new Date() }
        setMessages((messages) => [...messages, userMessage, tempMessage]);

        try{
            // Send message and update chat
            let response = await streamMessage(token, chatMessage, textbookId, chapterId, sessionId);
            setChatMessage("");

            // A "branch" happens when the ai decideds the topic has changed
            if(chatOpen){
                console.log("test");
                if(response.branchCandiate){
                    console.log("Branch candidates found");
                    setChatTitle(response.branchCandiate.suggested_title);
                    setSessionId(response.branchCandiate.new_session_id);
                    fetchChats(token).then((newChats) => setChats(newChats));
                } else if(response.session !== sessionId){
                    setSessionId(response.session);
                    fetchChats(token).then((newChats) => setChats(newChats));
                }
            }
            

            setMessages((messages) => 
                messages.map((msg) => msg.id === TEMP_MESSAGE_ID ? {...msg, id: Date.now().toString(), content: response.msg}: msg)
            )
        } catch(error){
            // Print error to chat
            console.error(error);
            setMessages((messages) => 
                messages.map((msg) => msg.id === TEMP_MESSAGE_ID ? {...msg, id: Date.now().toString(), content: "Error: failed to send message"}: msg)
            )
        }
        setChatInputEnabled(true);
    };

    return (
        <Modal 
            coverScreen={false} 
            hasBackdrop={false} 
            isVisible={isVisible} 
            style={styles.modal}>
            <View style={styles.overlayContent}>
                {/* Title and close button */}
                <View style={styles.titleBar}>
                    <Text style={styles.title}>Chats</Text>
                    <View style={styles.closeButton}>
                        <Button title='X' onPress={closeFunc} color='black'></Button>
                    </View>
                </View>

                <ScrollView>
                    {/* Create new chat button */}
                    <TouchableOpacity 
                        style={{...styles.chatSelector, ...styles.newChatButton}}
                        onPress={openNewChat}>
                        <Text style={styles.chatSelectorText}>Start new chat</Text>
                    </TouchableOpacity>

                    {/* Show previous chats */}
                    {chats ? chats.map((session) => {
                        return (
                            <TouchableOpacity 
                                key={session.session_id} 
                                style={styles.chatSelector} 
                                onPress={() => openChat(session.session_id, session.title)}>
                                <Text style={styles.chatSelectorText}>{session.title}</Text>
                                <Text style={styles.chatSelectorSubText}>{new Date(session.updated_at).toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        )
                    }): [] }
                </ScrollView>
                
            </View>
            
            {/* Chat window */}
            <Modal 
                coverScreen={false} 
                hasBackdrop={false} 
                isVisible={chatOpen} 
                style={styles.modal}>

                <View style={styles.overlayContent}>
                    {/* Title and close button */}
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>{
                            chatTitle.length < 30 ? chatTitle : chatTitle.substring(0, 30) + '...'
                        }</Text>
                        <View style={styles.closeButton}>
                            {/* 
                                Button is disabled while waiting for Ai response because closing the
                                chat before the response comes back causes issues. Not a great solution,
                                but it works.
                             */}
                            <Button title='X' onPress={closeChat} color='black' disabled={!chatInputEnabled}></Button>
                        </View>
                    </View>
                    <ScrollView 
                        style={styles.chatView} 
                        contentOffset={{x:0, y:scrollOffset}}
                        ref={chatRef}
                        onContentSizeChange={(_width, height) => {setScrollOffset(height-chatViewHeight)}}>
                        {messages.map((message: Message) => {
                            let content = message.content;
                            if(message.id === TEMP_MESSAGE_ID){
                                content = '...';
                            }
                            return (
                                <View key={message.id}>
                                    <View style={message.role === 'assistant' ? styles.assistantMessage : styles.userMessage}>
                                        <Text style={message.role === 'assistant' ? styles.assistantMessageText : styles.userMessageText}>
                                            {content}
                                        </Text>
                                    </View>
                                    <Text style={message.role === 'assistant' ? styles.assistantTimeStampText : styles.userTimeStampText}>
                                        {message.timestamp.toLocaleTimeString()}
                                    </Text>
                                </View>
                                
                            );
                        })}
                    </ScrollView>
                    <View style={styles.inputContainer}>  
                        <TextInput 
                            style={styles.chatInput}
                            onChangeText={(text)=>setChatMessage(text)}
                            value={chatMessage}
                            editable={chatInputEnabled}/>
                        <TouchableOpacity 
                            style={styles.chatSendButton} 
                            onPress={sendMessage}
                            disabled={!chatInputEnabled}>
                            <Ionicons name='send' size={24} color='white'/>
                        </TouchableOpacity>
                    </View>
                    
                </View>

                
            </Modal>
        </Modal>
        
    )
}

const styles = StyleSheet.create({
    modal:{
        padding:0,
        margin:0
    },
    overlayContent: {
        height: '75%',
        width: '100%',
        backgroundColor: '#383737ff',
        marginTop: 'auto',
        padding: 20,
        borderRadius: 20
    },
    title: {
        flex: 1,
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold'
    },
    titleBar:{
        flexDirection: 'row',
        borderBottomColor: 'white',
        paddingBottom: 10,
        borderBottomWidth: 2,
    },
    closeButton: {
        borderRadius:20,
        backgroundColor: '#ffffff68',
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignContent: 'center',
        color: 'white'
    },
    newChatButton : {
        paddingTop: 15,
        paddingBottom: 15
    },
    chatSelector: {
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 5
    },
    chatSelectorText: {
        color: 'white',
        fontSize: 20,
    },
    chatSelectorSubText: {
        color: 'grey',
        fontSize: 15,
    },
    chatView: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderWidth: 1,
        borderColor: 'white'
    },
    chatInput: {
        flex:1,
        backgroundColor: '#2C2C2E',
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
    },
    chatSendButton: {
        justifyContent: 'center',
        alignContent: 'center',
        height: 50,
        width: 50,
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: 30
    },
    assistantMessage: {
        maxWidth: '80%',
        backgroundColor: '#ffffff68',
        margin: 10,
        padding: 10,
        borderRadius: 10
    },
    userMessage: {
        maxWidth: '80%',
        backgroundColor: '#00c8ff68',
        margin: 10,
        padding: 10,
        borderRadius: 10,
        marginLeft: 'auto'
    },
    userMessageText: {
        fontSize: 17,
    },
    assistantMessageText: {
        fontSize: 17,
        textAlign: 'left'
    },
    userTimeStampText:{
        textAlign: 'right',
        paddingRight: 10,
        paddingBottom: 10,
        color: 'white'
    },
    assistantTimeStampText:{
        textAlign: 'left',
        paddingLeft: 10,
        paddingBottom: 10,
        color: 'white'
    }
})