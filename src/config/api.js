// API endpoints are configured through environment variables so the same build
// can target different backends without editing source.
//
//   .env.development -> used by `npm start`      (local backend)
//   .env.production  -> used by `npm run build`  (https://backend.vetonest.com)
//
// Create React App only exposes variables prefixed with REACT_APP_. The
// fallbacks below keep production behaviour identical to the previous hardcoded
// configuration if the environment variables are ever missing at build time.
export const API_CONFIG = {
  base_api_url:
    process.env.REACT_APP_API_BASE_URL || 'https://backend.vetonest.com/api/',
  base_url:
    process.env.REACT_APP_BASE_URL || 'https://backend.vetonest.com/',
};
