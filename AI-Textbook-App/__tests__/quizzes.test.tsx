import React from 'react';
import { ScrollView, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import AIQuizOverlay from '../components/quiz/quizOverlay';

beforeAll(() => { 
  jest.mock('@react-native-async-storage/async-storage');
  jest.mock('@/api/quiz/aiQuizApi');
})

describe('Quiz Overlay', () => {
  it("renders default correctly", () => {
    let isOpen = true
    const { getByText } = render(<ScrollView></ScrollView>);
    expect(getByText("Create New Quiz")).toBeOnTheScreen();
  });
});