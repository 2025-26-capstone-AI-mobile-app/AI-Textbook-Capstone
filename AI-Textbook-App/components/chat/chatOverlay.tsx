import { fetchChats, loadChat } from "@/api/chat/aiChatApi";
import { ChatSession, Message } from "@/chatTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Button, TouchableOpacity, ScrollView, TextInput } from "react-native";
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

    const [chats, setChats] = useState<ChatSession[] | null>(null);
    const [chatOpen, setChatOpen] = useState<boolean>(false);

    // Chat variables
    const [chatTitle, setChatTitle] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [scrollOffset, setScrollOffset] = useState<number>(0); //used to auto scroll to bottom on load
    const [chatViewHeight, setChatViewHeight] = useState<number>(0);
    const chatRef = useRef(null);



    // Fetch all user chats
    useEffect(() => {
        // Only call backend if chats has not been set
        if(chats === null){
            setChats([]);
            fetchChats().then((newChats) => {
                setChats(newChats);
            }).catch((error) => {
                Alert.alert("Failed to fetch chats");
                console.error(error);
            })
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
            setMessages(await loadChat(chatId));
        } catch {
            setMessages([{
                id:'', 
                role:'assistant', 
                content:'Failed to load messages',
                timestamp: new Date()
            }])
        }
    }

    // Closes chat window
    const closeChat = () => {
        setChatOpen(false);
    }

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

                    <TouchableOpacity style={styles.chatSelector}>
                        <Text style={styles.chatSelectorText}>Start new chat</Text>
                    </TouchableOpacity>
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
                        <Text style={styles.title}>{chatTitle}</Text>
                        <View style={styles.closeButton}>
                            <Button title='X' onPress={closeChat} color='black'></Button>
                        </View>
                    </View>
                    <ScrollView 
                        style={styles.chatView} 
                        contentOffset={{x:0, y:scrollOffset}}
                        ref={chatRef}
                        onContentSizeChange={(_width, height) => {setScrollOffset(height-chatViewHeight)}}>
                        {messages.map((message: Message) => {
                            return (
                                <View key={message.id}>
                                    <View style={message.role === 'assistant' ? styles.assistantMessage : styles.userMessage}>
                                        <Text style={message.role === 'assistant' ? styles.assistantMessageText : styles.userMessageText}>
                                            {message.content}
                                        </Text>
                                    </View>
                                    <Text style={message.role === 'assistant' ? styles.assistantTimeStampText : styles.userTimeStampText}>
                                        {message.timestamp.toLocaleTimeString()}
                                    </Text>
                                </View>
                                
                            );
                        })}
                    </ScrollView>
                    <TextInput></TextInput>
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
    chatSelector: {
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        height: 50,
        justifyContent: 'center'
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