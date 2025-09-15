// src/services/quoteApi.js - FIXED
import api from './api';
import { logQuoteFlow } from '../utils/debugLogger';

// Main function
const createGroundQuoteRequest = async (formData, serviceType) => {
  try {
    logQuoteFlow('REQUEST_CREATE', {
      serviceType,
      origin: `${formData.originCity}, ${formData.originState}`,
      destination: `${formData.destCity}, ${formData.destState}`,
      commodityCount: formData.commodities?.length
    });

    // Debug: Check if auth is present
    console.log('Auth token at request time:', localStorage.getItem('auth_token'));

    // Use the centralized api instance
    const { data } = await api.post('/ground-quotes/create', {
      formData,
      serviceType
    });

    logQuoteFlow('REQUEST_RESPONSE', {
      success: data.success,
      requestId: data.requestId,
      requestNumber: data.requestNumber,
      status: data.status
    });

    // Store the mapping for debugging
    if (data.success && data.requestId) {
      const quoteMap = JSON.parse(localStorage.getItem('quote_id_map') || '{}');
      quoteMap[data.requestId] = {
        requestNumber: data.requestNumber,
        createdAt: new Date().toISOString(),
        serviceType,
        origin: `${formData.originCity}, ${formData.originState}`,
        destination: `${formData.destCity}, ${formData.destState}`
      };
      localStorage.setItem('quote_id_map', JSON.stringify(quoteMap));
    }

    return data;
  } catch (error) {
    logQuoteFlow('REQUEST_ERROR', { 
      error: error?.response?.data?.message || error.message,
      status: error?.response?.status
    });
    
    // Better error messages
    if (error?.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error?.response?.status === 403) {
      throw new Error('You do not have permission to create quotes.');
    }
    
    throw error;
  }
};

// Export with both names for compatibility
export const createGroundQuote = createGroundQuoteRequest;

// Export as default object (this is what the working file expects)
const quoteApi = {
  createGroundQuoteRequest,
  createGroundQuote
};

export default quoteApi;
