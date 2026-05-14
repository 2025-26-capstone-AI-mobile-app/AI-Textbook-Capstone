// There is a problem with expofetch and jest so testing doesn't work right now
//const chatApi = require('../api/chat/aiChatApi')
import React from 'react';
import AIChatOverlay from '../components/chat/chatOverlay';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


beforeAll(() => {
    jest.mock('@react-native-async-storage/async-storage');
    jest.mock('@/api/chat/aiChatApi');
    jest.mock('@/api/login/loginApi');
    jest.mock('@/api/textbook/textbookApi');
})


async function openPreviousChat(getByTestId){
    // Look for the title, new chat button, and two previous chats
    await waitFor(() => {
        expect(getByTestId("previousChat1").toBeOnTheScreen);
    })

    // Open previous chat
    chatButton = getByTestId("previousChat1");
    fireEvent.press(chatButton);

    // Find first message
    await waitFor(() => {
        expect(getByTestId("message_user1").toBeOnTheScreen);
        expect(getByTestId("message_assistant1").toBeOnTheScreen);
    })
}

async function openNewChat(getByTestId){
    // Look for the title, new chat button, and two previous chats
    await waitFor(() => {
        expect(getByTestId("newChatButton").toBeOnTheScreen);
    })

    // Open previous chat
    chatButton = getByTestId("newChatButton");
    fireEvent.press(chatButton);

    // Find first message
    await waitFor(() => {
        expect(getByTestId("chatInput").toBeOnTheScreen);
    })
}

async function sendMessage(getByTestId, getByText, message, expectedMessage=null, expectedId=null){
    chatInput = getByTestId('chatInput')
    sendButton = getByTestId('sendButton')

    fireEvent.changeText(chatInput, message)
    fireEvent.press(sendButton)
    await waitFor(() => {
        expect(getByText(message).toBeOnTheScreen);

        if(!expectedMessage && !expectedId){
            expect(getByText("Response message").toBeOnTheScreen); // this is the default message sent by mocked api
        }
        if(expectedId){
            expect(getByTestId(expectedId).toBeOnTheScreen)
        }
        if(expectedMessage){
            expect(getByText(expectedMessage).toBeOnTheScreen);
        }
        
    })
}



describe('Test ai chat api calls', () => {
    it("renders default correctly", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        // Look for the title, new chat button, and two previous chats
        await waitFor(() => {
            expect(getByTestId('overlayTitle').toBeOnTheScreen);
            expect(getByTestId("newChatButton").toBeOnTheScreen);
            expect(getByTestId("previousChat1").toBeOnTheScreen);
            expect(getByTestId("previousChat2").toBeOnTheScreen);
        })
    });

    it("Renders previous chat correctly", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId, getByText } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        await openPreviousChat(getByTestId);

        // Try sending a message
        
    });

    it("401 error on send message", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId, getByText } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        await openPreviousChat(getByTestId);

        // Try sending a message
        await sendMessage(getByTestId, getByText, 'stream401', null, 'loggedOut');
    });

    it("Stream error on send message", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId, getByText } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        await openPreviousChat(getByTestId);
        await sendMessage(getByTestId, getByText, 'streamError', 'Error: failed to send message');
    });


    it("Create new chat", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId, getByText } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        await openNewChat(getByTestId);

        // Try sending a message
        await sendMessage(getByTestId, getByText, "New message")
    });

    it("New Chat 401 error", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId, getByText } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        await openNewChat(getByTestId);

        // Try sending a message
        await sendMessage(getByTestId, getByText, "stream401", null, 'loggedOut')
    });

    it("New Chat stream error", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId, getByText } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        await openNewChat(getByTestId);

        // Try sending a message
        await sendMessage(getByTestId, getByText, "streamError", 'Error: failed to send message')
    });
})