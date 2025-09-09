// src/services/quoteApi.js
import API_BASE from '../config/api';

const getToken = () => localStorage.getItem('auth_token') || '';

const quoteApi = {
  async createGroundQuoteRequest(formData, serviceType) {
    const response = await fetch(`${API_BASE}/ground-quotes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ formData, serviceType }) // 'ltl' | 'ftl' | 'expedited'
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'Failed to create quote request');
    }

    // Works for both patterns:
    // - callers expecting a successful object
    // - callers relying on thrown errors for failures
    return {
      success: true,
      requestId: data.data._id,
      requestNumber: data.data.requestNumber,
      status: data.data.status,
      carriersNotified: data.data.carriersNotified,
      responseDeadline: data.data.responseDeadline
    };
  },

  async getGroundQuoteResults(requestId) {
    const response = await fetch(`${API_BASE}/ground-quotes/${requestId}/results`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'Failed to get results');
    }

    // Return the backend payload (plus success) so existing callers continue to work
    return {
      success: true,
      ...data
    };
  }
};

export default quoteApi;
