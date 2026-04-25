import '@testing-library/jest-dom/vitest';
import { server } from '@/mocks/server';
import { resetStore } from '@/mocks/handlers';

// jsdom doesn't implement scrollIntoView; stub it so auto-scroll hooks don't throw.
Element.prototype.scrollIntoView = vi.fn();

// jsdom doesn't implement matchMedia; stub it for ThemeProvider system-preference detection.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  resetStore();
  localStorage.clear();
});
afterAll(() => server.close());
