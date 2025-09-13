import axios from 'axios';

// Base URL (your services should call paths like "/api/address-book/companies")
axios.defaults.baseURL = 'https://api.gcc.conship.ai';
axios.defaults.withCredentials = false;

// Robust token getter
const getToken = () => (
  (window.shellAuth && (window.shellAuth.getToken?.() || window.shellAuth.token)) ||
  localStorage.getItem('auth_token') ||
  null
);

// Guard against duplicate registration
if (!window.__QUOTES_AXIOS_INSTALLED__) {
  axios.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      const t = getToken();
      if (t) config.headers.Authorization = `Bearer ${t}`;
    }
    if (window.DEBUG_HTTP) {
      const url = (config.baseURL || '') + (config.url || '');
      console.log('HTTP ➜', config.method?.toUpperCase(), url, { headers: config.headers, data: config.data });
    }
    return config;
  });

  axios.interceptors.response.use(
    (res) => {
      if (window.DEBUG_HTTP) {
        const url = (res.config.baseURL || '') + (res.config.url || '');
        console.log('HTTP ✓', res.status, res.config.method?.toUpperCase(), url, res.data);
      }
      return res;
    },
    (err) => {
      const s = err?.response?.status;
      const cfg = err?.config || {};
      if (s === 401) console.warn('Quotes axios: 401 on', (cfg.baseURL || '') + (cfg.url || ''));
      if (window.DEBUG_HTTP) console.log('HTTP ✗', s, cfg.method?.toUpperCase(), (cfg.baseURL || '') + (cfg.url || ''), err?.response?.data || err);
      return Promise.reject(err);
    }
  );

  window.__QUOTES_AXIOS_INSTALLED__ = true;
}

// Expose for debugging and for other MFEs to reuse if needed
window.quotesAxios = axios;
export default axios;
