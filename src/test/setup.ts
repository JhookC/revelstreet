import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrollIntoView; stub it so auto-scroll hooks don't throw.
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  localStorage.clear();
});
