// src/services/quoteApi.js - FIX THE ENDPOINT
import API_BASE from '../config/api';

class QuoteAPI {
  async createGroundQuoteRequest(formData, serviceType) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    try {
      // CORRECT ENDPOINT for ground quotes
      const response = await fetch(`${API_BASE}/ground-quotes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType: serviceType,
          formData: formData
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Failed to create quote');
      }

      return {
        success: true,
        requestId: data.data._id,
        requestNumber: data.data.requestNumber
      };

    } catch (error) {
      console.error('Quote creation failed:', error);
      throw error;
    }
  }

  async getGroundQuoteResults(requestId) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // CORRECT ENDPOINT for ground results
      const response = await fetch(`${API_BASE}/ground-quotes/${requestId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Failed to get results');
      }

      return data;

    } catch (error) {
      console.error('Failed to get results:', error);
      throw error;
    }
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new QuoteAPI();
