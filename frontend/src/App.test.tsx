import React from 'react';
import * as TestingLibrary from '@testing-library/react';
import { App } from './App';

test('Rendering framework name', () => {
  const node = TestingLibrary.render(<App />);
  const text = node.getByText(/React/);
  expect(text).toBeInTheDocument();
});
