// Single source of truth for the backend API location. Every context/component
// that needs the API URL should import API_CONFIG from here instead of
// hardcoding or re-declaring its own copy of these values.
//
// The URLs are picked up at BUILD time from REACT_APP_API_URL / REACT_APP_BASE_URL
// (see .env.production for the production default, and package.json's
// "build:staging" script for how a staging build overrides them). Falling
// back to a local backend keeps `npm start` usable against a machine-local
// PHP server when neither env var is set.
export const API_CONFIG = {
  base_api_url: process.env.REACT_APP_API_URL || 'http://localhost/VetoNest/public/index.php/api/',
  base_url: process.env.REACT_APP_BASE_URL || 'http://localhost/VetoNest/public/',
};
