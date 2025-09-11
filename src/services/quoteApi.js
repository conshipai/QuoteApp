// src/services/quoteApi.js - Updated version
import { logQuoteFlow } from '../utils/debugLogger';

const createGroundQuote = async (formData, serviceType) => {
  try {
    logQuoteFlow('REQUEST_CREATE', {
      serviceType,
      origin: `${formData.originCity}, ${formData.originState}`,
      destination: `${formData.destCity}, ${formData.destState}`,
      commodityCount: formData.commodities?.length
    });

    const response = await fetch(`${API_BASE}/ground-quotes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ formData, serviceType })
    });

    const data = await response.json();
    
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
        serviceType: serviceType,
        origin: `${formData.originCity}, ${formData.originState}`,
        destination: `${formData.destCity}, ${formData.destState}`
      };
      localStorage.setItem('quote_id_map', JSON.stringify(quoteMap));
    }

    return data;
  } catch (error) {
    logQuoteFlow('REQUEST_ERROR', { error: error.message });
    throw error;
  }
};
