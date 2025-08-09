/**
 * Test setup configuration for Vitest
 * Sets up testing environment with jsdom and required globals
 */

import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (required for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver (used by some components)
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
  length: 0,
  key: (index: number) => localStorage.key(index),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5000',
    origin: 'http://localhost:5000',
    reload: () => {},
  },
  writable: true,
});

// Mock console methods for testing (prevent spam)
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: () => {}, // Suppress console.log in tests
  warn: () => {}, // Suppress console.warn in tests
  error: originalConsole.error, // Keep error for debugging
};