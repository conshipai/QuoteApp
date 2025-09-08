// src/services/quoteApi.js - NO MOCK DATA VERSION
import API_BASE from '../config/api';

class QuoteAPI {
  async createGroundQuoteRequest(formData, serviceType) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    try {
      // Initialize quote IDs
      const initResponse = await fetch(`${API_BASE}/quotes/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const initData = await initResponse.json();
      if (!initData.success) {
        throw new Error('Failed to initialize quote');
      }

      // Create the quote
      const response = await fetch(`${API_BASE}/quotes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestNumber: initData.requestId,
          userId: localStorage.getItem('userId') || 'unknown',
          userEmail: localStorage.getItem('userEmail') || 'unknown@example.com',
          company: formData.originCompany || 'Company',
          shipment: {
            mode: 'ground',
            serviceType: serviceType,
            origin: {
              city: formData.originCity,
              state: formData.originState,
              zipCode: formData.originZip
            },
            destination: {
              city: formData.destCity,
              state: formData.destState,
              zipCode: formData.destZip
            },
            cargo: {
              pieces: formData.commodities.map(c => ({
                quantity: parseInt(c.quantity) || 1,
                weight: parseFloat(c.weight) || 0,
                weightKg: (parseFloat(c.weight) || 0) * 0.453592,
                length: parseFloat(c.length) || 0,
                width: parseFloat(c.width) || 0,
                height: parseFloat(c.height) || 0,
                commodity: c.description || 'General Cargo',
                cargoType: 'General',
                stackable: true,
                handling: []
              }))
            }
          },
          insurance: {
            requested: false
          },
          hasDangerousGoods: formData.commodities.some(c => c.hazmat),
          status: 'processing',
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
      // Use the general quotes endpoint
      const response = await fetch(`${API_BASE}/quotes/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Find the specific quote
        const quote = data.requests.find(r => r._id === requestId);
        if (quote) {
          return {
            success: true,
            status: quote.status,
            requestNumber: quote.requestNumber,
            formData: quote.formData || {},
            quotes: [] // No quotes for ground yet
          };
        }
      }

      return {
        success: true,
        status: 'processing',
        quotes: []
      };

    } catch (error) {
      console.error('Failed to get results:', error);
      throw error;
    }
  }

  getToken() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No auth token found');
    }
    return token || '';
  }
}

export default new QuoteAPI();
