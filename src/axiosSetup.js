// src/axiosSetup.js
import axios from 'axios';

// 1) SINGLETON: reuse shell's configured axios if it exists
if (window.shellAxios) {
  export default window.shellAxios;
} else {
  // 2) BASE URL: make sure calls go to your API
  const API_BASE_URL =
    window.__API_BASE_URL__ ||
    process.env.REACT_APP_API_BASE_URL ||
    'https://api.gcc.conship.ai';

  axios.defaults.baseURL = API_BASE_URL;

  // Optional, since you use Bearer tokens (not cookies):
  axios.defaults.withCredentials = false;

  // Utility: robust token getter (handles both function and value)
  const getToken = () => {
    const sa = window.shellAuth || {};
    const fromFn = typeof sa.getToken === 'function' ? sa.getToken() : null;
    const fromVal = sa.token || null;
    return fromFn || fromVal || localStorage.getItem('auth_token') || null;
  };

  // Prevent duplicate interceptor registration
  if (!window.__AXIOS_INTERCEPTORS_INSTALLED__) {
    // 3) REQUEST: always inject token if missing
    axios.interceptors.request.use(
      (config) => {
        // Ensure headers object exists
        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          const token = getToken();
          if (token) config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug (toggle in console: window.DEBUG_HTTP = true)
        if (window.DEBUG_HTTP) {
          const url = (config.baseURL || '') + (config.url || '');
          console.groupCollapsed(`HTTP ➜ ${config.method?.toUpperCase()} ${url}`);
          console.log('headers:', config.headers);
          if (config.data) console.log('data:', config.data);
          console.groupEnd();
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 4) RESPONSE: do NOT auto-logout on 401
    axios.interceptors.response.use(
      (response) => {
        if (window.DEBUG_HTTP) {
          const url = (response.config.baseURL || '') + (response.config.url || '');
          console.groupCollapsed(`HTTP ✓ ${response.status} ${response.config.method?.toUpperCase()} ${url}`);
          console.log('data:', response.data);
          console.groupEnd();
        }
        return r
