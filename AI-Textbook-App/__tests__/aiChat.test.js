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

    it("Renders chat correctly", async () => {
        AsyncStorage.setItem('access_token', "0")
        const { getByTestId } = render(<AIChatOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIChatOverlay>);

        // Look for the title, new chat button, and two previous chats
        await waitFor(() => {
            expect(getByTestId("previousChat1").toBeOnTheScreen);
        })

        chatButton = getByTestId("previousChat1");
        fireEvent.press(chatButton);

        await waitFor(() => {
            expect(getByTestId("message_user1").toBeOnTheScreen);
        })
    });
})