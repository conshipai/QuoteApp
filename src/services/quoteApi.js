// ============================================
// 7. quoteApi.js - FIXED TO USE CENTRALIZED API
// ============================================
import api from './api';
import { logQuoteFlow } from '../utils/debugLogger';

// Creates a ground quote request
export const createGroundQuote = async (formData, serviceType) => {
  try {
    logQuoteFlow('REQUEST_CREATE', {
      serviceType,
      origin: `${formData.originCity}, ${formData.originState}`,
      destination: `${formData.destCity}, ${formData.destState}`,
      commodityCount: formData.commodities?.length
    });

    // Use the centralized api instance (no /api prefix needed)
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
      error: error?.response?.data?.message || error.message 
    });
    // Re-throw so callers can handle UI errors
    throw error;
  }
};
