/**
 * Frontend Environment Configuration Utility
 * Switches between environment variables and default local API endpoints.
 */

export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  MODE: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV || false,
  IS_PROD: import.meta.env.PROD || false
};

export default env;
