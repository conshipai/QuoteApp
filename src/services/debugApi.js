// ============================================
// 4. debugApi.js - FIXED TO USE CENTRALIZED API
// ============================================
import api from './api';

const debugApi = {
  getQuoteChain: async (requestId, type = 'ground') => {
    try {
      const endpoint = type === 'ground' ? 'ground-chain' : 'air-ocean-chain';
      const { data } = await api.get(`/debug/${endpoint}/${requestId}`);
      return data;
    } catch (error) {
      console.error('Error fetching quote chain:', error);
      throw error;
    }
  },
  
  getAllQuotes: async (limit = 20) => {
    try {
      const { data } = await api.get('/debug/all-quotes', {
        params: { limit }
      });
      return data;
    } catch (error) {
      console.error('Error fetching all quotes:', error);
      throw error;
    }
  },
  
  verifyQuote: async (requestId) => {
    try {
      const { data } = await api.get(`/debug/verify/${requestId}`);
      return data;
    } catch (error) {
      console.error('Error verifying quote:', error);
      throw error;
    }
  }
};

export default debugApi;
