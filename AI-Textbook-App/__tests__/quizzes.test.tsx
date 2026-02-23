import React from 'react';
import { render } from '@testing-library/react-native';
import AIQuizOverlay from '../components/quiz/quizOverlay';
import { ActivityIndicator } from 'react-native';

beforeAll(() => { 
  jest.mock('@react-native-async-storage/async-storage');
  jest.mock('@/api/quiz/aiQuizApi');
})

describe('Quiz Overlay', () => {
  it("renders default correctly", () => {

    let isOpen = true
    const { getByText } = render(<AIQuizOverlay isVisible={true} textbookId='0' chapterId='0' closeFunc={() => null}></AIQuizOverlay>);
    expect(getByText("Create New Quiz")).toBeOnTheScreen();
  });
});