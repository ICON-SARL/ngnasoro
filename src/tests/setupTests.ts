
// Jest setup file
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Global mocks
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

// Mock console.error and console.warn to make tests fail on react warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Check if this is a React-specific warning/error
  const message = args.join(' ');
  if (
    message.includes('Warning: ') || 
    message.includes('Error: ') && 
    (message.includes('React') || message.includes('Component'))
  ) {
    throw new Error(message);
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Check if this is a React-specific warning
  const message = args.join(' ');
  if (message.includes('Warning: ') && message.includes('React')) {
    throw new Error(message);
  }
  originalConsoleWarn(...args);
};
