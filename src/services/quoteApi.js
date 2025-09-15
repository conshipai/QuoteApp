// src/services/quoteApi.js
import { logQuoteFlow } from '../utils/debugLogger';

// Use the Shell's authenticated axios
const axios = window.shellAxios || window.quotesAxios || require('axios').default;

// Create ground quote
const createGroundQuote = async (formData, serviceType) => {
  try {
    logQuoteFlow('REQUEST_CREATE', {
      serviceType,
      origin: `${formData.originCity}, ${formData.originState}`,
      destination: `${formData.destCity}, ${formData.destState}`
    });

    // Note: axios already has baseURL and auth from Shell
    const { data } = await axios.post('/ground-quotes/create', {
      formData,
      serviceType
    });

    logQuoteFlow('REQUEST_RESPONSE', {
      success: data.success,
      requestId: data.requestId,
      requestNumber: data.requestNumber
    });

    return data;
  } catch (error) {
    logQuoteFlow('REQUEST_ERROR', { 
      error: error?.response?.data?.message || error.message 
    });
    throw error;
  }
};

// Get quote results
const getGroundQuoteResults = async (requestId) => {
  try {
    const { data } = await axios.get(`/ground-quotes/results/${requestId}`);
    return data;
  } catch (error) {
    console.error('Error getting quote results:', error);
    throw error;
  }
};

// Export as default object with both function names for compatibility
const quoteApi = {
  createGroundQuote,
  createGroundQuoteRequest: createGroundQuote, // Alias for compatibility
  getGroundQuoteResults
};

export default quoteApi;
export { createGroundQuote }; // Also export named for direct imports
