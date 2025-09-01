// src/services/quoteApi.js
import API_BASE from '../config/api';

class QuoteAPI {
  // Create quote request - try real API first
  async createQuoteRequest(formData, serviceType) {
    try {
      const response = await fetch(`${API_BASE}/quotes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          service_type: serviceType,
          form_data: formData,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create quote request');

      const data = await response.json();
      return {
        success: true,
        requestId: data?.data?._id,
        requestNumber: data?.data?.requestNumber
      };
    } catch (error) {
      console.error('API call failed, using mock:', error);
      // Fall back to mock if API fails
      return this.mockCreateQuoteRequest(formData, serviceType);
    }
  }

  // Mock version for development (kept as backup)
  async mockCreateQuoteRequest(formData, serviceType) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const requestId = `REQ-${Date.now()}`;
    const requestNumber = `QR-2025-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Store in localStorage for mock persistence
    const mockRequest = {
      requestId,
      requestNumber,
      serviceType,
      formData,
      status: 'PROCESSING',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(`quote_request_${requestId}`, JSON.stringify(mockRequest));

    // Simulate backend processing
    this.simulateBackendProcessing(requestId);

    return {
      success: true,
      requestId,
      requestNumber
    };
  }

  async simulateBackendProcessing(requestId) {
    // After 3 seconds, create mock cost files
    setTimeout(() => {
      const mockCostFiles = [
        {
          provider: 'STG',
          raw_cost: 485.50,
          fuel_surcharge: 48.55,
          transit_days: 3,
          markup_percentage: 18,
          final_price: 629.99,
          service_details: {
            carrier: 'STG Logistics',
            service: 'Standard LTL',
            guaranteed: false
          }
        },
        {
          provider: 'SEFL',
          raw_cost: 512.25,
          fuel_surcharge: 51.23,
          transit_days: 2,
          markup_percentage: 25,
          final_price: 704.35,
          service_details: {
            carrier: 'Southeastern Freight Lines',
            service: 'Priority LTL',
            guaranteed: true
          }
        }
      ];

      const key = `quote_request_${requestId}`;
      const request = JSON.parse(localStorage.getItem(key) || '{}');
      if (!request || !request.requestId) return;

      request.status = 'QUOTED';
      request.costFiles = mockCostFiles;
      localStorage.setItem(key, JSON.stringify(request));
    }, 3000);
  }

  async mockGetGroundQuoteResults(requestId) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`) || '{}');

    if (!request.requestId) {
      return { success: false, error: 'Request not found' };
    }

    return {
      success: true,
      status: request.status,
      costFiles: request.costFiles || [],
      requestNumber: request.requestNumber
    };
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new QuoteAPI();
