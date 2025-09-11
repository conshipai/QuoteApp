// src/services/debugApi.js
import API_BASE from '../config/api';

const debugApi = {
  getQuoteChain: async (requestId, type = 'ground') => {
    const endpoint = type === 'ground' ? 'ground-chain' : 'air-ocean-chain';
    const response = await fetch(`${API_BASE}/debug/${endpoint}/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    });
    return response.json();
  },
  
  getAllQuotes: async (limit = 20) => {
    const response = await fetch(`${API_BASE}/debug/all-quotes?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    });
    return response.json();
  },
  
  verifyQuote: async (requestId) => {
    const response = await fetch(`${API_BASE}/debug/verify/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    });
    return response.json();
  }
};

export default debugApi;
