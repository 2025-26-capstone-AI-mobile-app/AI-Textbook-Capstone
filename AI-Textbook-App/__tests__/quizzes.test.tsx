import React from 'react';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react-native';
import AIQuizOverlay from '../components/quiz/quizOverlay';
import { ActivityIndicator } from 'react-native';
import { fetchQuizzes } from '@/api/quiz/aiQuizApi';
import { fetchTextbookContent } from '@/api/textbook/textbookApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

let quizAPI;
beforeAll(() => { 
  jest.mock('@react-native-async-storage/async-storage');
  quizAPI = jest.mock('@/api/quiz/aiQuizApi');
  quizAPI = jest.mock('@/api/textbook/textbookApi');
})

describe('Quiz Overlay', () => {
  it("renders default correctly", () => {
    const { getByText } = render(<AIQuizOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIQuizOverlay>);
    expect(getByText("Create New Quiz")).toBeOnTheScreen();
  });

  it("renders quiz list correctly", async () => {
    const { getByTestId } = render(<AIQuizOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIQuizOverlay>);
    
    await waitForElementToBeRemoved(() => screen.queryByText("No Quizzes"))
    let button = await screen.findByText("Understanding Science")
  });

  it("test quiz functionality", async () => {
    const { getByTestId } = render(<AIQuizOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIQuizOverlay>);
    
    await waitForElementToBeRemoved(() => screen.queryByText("No Quizzes"))
    let button = await screen.findByText("Understanding Science")
    fireEvent.press(button);

    // Quiz open
    await waitFor(() => {
      expect(getByTestId('openQuiz').toBeOnTheScreen)
    })

    // Questions on screen
    await waitFor(() => {
      for(let i = 0; i < 5; i++){
        expect(getByTestId('Q' + (i+1)).toBeOnTheScreen)
        for(let j = 0; j < 4; j++){
          expect(getByTestId('Q' + (i+1) + 'C' + j).toBeOnTheScreen)
        }
      }
    })

    // Answer questions
    for(let i = 0; i < 5; i++){
      // All the answers are 0 except the last one
      let choiceButton = getByTestId('Q' + (i+1) + 'C' + 0)
      fireEvent.press(choiceButton);
    }

    let submitButton = getByTestId('SubmitButton');
    fireEvent.press(submitButton);

    // Results show up correctly
    await waitFor(() => {
      expect(getByTestId('testResults:4/5').toBeOnTheScreen)
    })
    for(let i = 0; i < 5; i++){
      // All the answers are 0 except the last one
      expect(getByTestId('Q' + (i+1) + (i == 4 ? 'F' : 'T')).toBeOnTheScreen)
    }

    let retryButton = getByTestId('resetButton');
    fireEvent.press(retryButton);

    // Wait for results to go away
    await waitFor(() => {
      expect(retryButton.waitForElementToBeRemoved)
    })

    // Answer questions
    for(let i = 0; i < 5; i++){
      let choiceButton = getByTestId('Q' + (i+1) + 'C' + (i % 4))
      fireEvent.press(choiceButton);
    }
    fireEvent.press(submitButton);

    // Check results
    await waitFor(() => {
      expect(getByTestId('testResults:1/5').toBeOnTheScreen)
    })
  });

  it("generates quiz correctly", async () => {
    AsyncStorage.setItem('access_token', "0")
    const { getByTestId, getByText } = render(<AIQuizOverlay isVisible={true} textbookId='0' chapterId='1' closeFunc={() => null}></AIQuizOverlay>);
    await waitForElementToBeRemoved(() => screen.queryByText("No Quizzes"))

    await waitFor(() => {
      expect(screen.getByTestId('testText').toBeOnTheScreen)
    })

    let dropDown = screen.getByText('Select option');
    fireEvent(dropDown, 'press');

    await waitFor(() => {
      expect(getByText('Methods of Knowing').toBeOnTheScreen)
    })

    let itemButton = getByText('Methods of Knowing');
    let searchIcon = getByTestId('searchIcon');
    fireEvent(itemButton, 'press');

    await waitFor(() => {
      expect(searchIcon.waitForElementToBeRemoved)
    })

    let generateButton = getByTestId('GenerateButton');
    fireEvent.press(generateButton);

    // Questions on screen
    await waitFor(() => {
      for(let i = 0; i < 5; i++){
        expect(getByTestId('Q' + (i+1)).toBeOnTheScreen)
        for(let j = 0; j < 4; j++){
          expect(getByTestId('Q' + (i+1) + 'C' + j).toBeOnTheScreen)
        }
      }
    })
  })

});