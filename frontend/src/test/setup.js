import '@testing-library/jest-dom'

// jsdom may throw for scrollTo; override to noop
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
})
