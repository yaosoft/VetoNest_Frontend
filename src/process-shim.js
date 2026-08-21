// src/process-shim.js
// Must be the FIRST import in src/index.js:
//   import './process-shim';
//
// CRA's production build does not polyfill Node's `process` object in the
// browser. Libraries like SimplePeer reference process.env.NODE_ENV and
// process.nextTick at module evaluation time. If this shim isn't in place
// before those modules are parsed, the app crashes with either:
//   "ReferenceError: process is not defined"
//   "TypeError: process.nextTick is not a function"

if (typeof window !== 'undefined') {
  if (typeof process === 'undefined') {
    window.process = {
      env: { NODE_ENV: 'production' },
      nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
      browser: true,
    };
  } else {
    if (!process.env) {
      process.env = { NODE_ENV: 'production' };
    }
    if (typeof process.nextTick !== 'function') {
      process.nextTick = (fn, ...args) => setTimeout(() => fn(...args), 0);
    }
    if (typeof process.browser === 'undefined') {
      process.browser = true;
    }
  }
}
