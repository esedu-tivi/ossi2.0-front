import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Polyfill window.matchMedia for jsdom (used by useIsMobile / SidebarProvider)
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
    dispatchEvent: () => false,
  }),
});

// Polyfill ResizeObserver for jsdom (used by cmdk / Radix primitives)
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Polyfill Element.scrollIntoView for jsdom (used by cmdk)
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function () {};

// Polyfill HTMLElement.hasPointerCapture for jsdom (used by Radix primitives)
HTMLElement.prototype.hasPointerCapture =
  HTMLElement.prototype.hasPointerCapture || function () { return false; };

// Polyfill HTMLElement.setPointerCapture for jsdom (used by Radix primitives)
HTMLElement.prototype.setPointerCapture =
  HTMLElement.prototype.setPointerCapture || function () {};

// Polyfill HTMLElement.releasePointerCapture for jsdom (used by Radix primitives)
HTMLElement.prototype.releasePointerCapture =
  HTMLElement.prototype.releasePointerCapture || function () {};

// Polyfill window.getSelection for jsdom (used by Slate/Plate)
if (!window.getSelection) {
  window.getSelection = (() => ({
    addRange: () => {},
    removeAllRanges: () => {},
    getRangeAt: () => ({} as Range),
    rangeCount: 0,
    anchorNode: null,
    anchorOffset: 0,
    focusNode: null,
    focusOffset: 0,
    isCollapsed: true,
    type: 'None',
    collapse: () => {},
    collapseToEnd: () => {},
    collapseToStart: () => {},
    containsNode: () => false,
    deleteFromDocument: () => {},
    empty: () => {},
    extend: () => {},
    modify: () => {},
    setBaseAndExtent: () => {},
    setPosition: () => {},
    toString: () => '',
  })) as unknown as typeof window.getSelection;
}
