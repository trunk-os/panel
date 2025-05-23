// Mock fetch globally
import { beforeAll, afterEach, afterAll } from 'bun:test';

// Store original fetch
const originalFetch = globalThis.fetch;

// Mock implementation for fetch that we'll use in tests
const mockedFetch = (
  input: URL | RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  throw new Error(
    'fetch is not mocked for this test/call. Please add a specific mock implementation.'
  );
};

beforeAll(() => {
  // Replace global fetch with our mock
  globalThis.fetch = mockedFetch as typeof fetch;
});

afterEach(() => {
  // Clear any mocks between tests
});

afterAll(() => {
  // Restore original fetch
  globalThis.fetch = originalFetch;
});

// Mock for import.meta.env
Object.defineProperty(globalThis, 'process', {
  value: {
    env: {
      BUN_PUBLIC_API_URL: 'http://test-api.example.com',
    },
  },
});

// Mock the import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        BUN_PUBLIC_API_URL: 'http://test-api.example.com',
      },
    },
  },
});