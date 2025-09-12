// ============================================
// 5. debugApi.js - UPDATED TO USE AXIOS
// ============================================
import axios from 'axios';
import API_BASE from '../config/api';

const debugApi = {
  getQuoteChain: async (requestId, type = 'ground') => {
    try {
      const endpoint = type === 'ground' ? 'ground-chain' : 'air-ocean-chain';
      const { data } = await axios.get(`${API_BASE}/debug/${endpoint}/${requestId}`);
      return data;
    } catch (error) {
      console.error('Error fetching quote chain:', error);
      throw error;
    }
  },
  
  getAllQuotes: async (limit = 20) => {
    try {
      const { data } = await axios.get(`${API_BASE}/debug/all-quotes`, {
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
      const { data } = await axios.get(`${API_BASE}/debug/verify/${requestId}`);
      return data;
    } catch (error) {
      console.error('Error verifying quote:', error);
      throw error;
    }
  }
};

export default debugApi;
