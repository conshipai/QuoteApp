// src/services/quoteApi.js

// For Module Federation, we can't use process.env directly
// Use window config or hardcode for now
const API_BASE = window.REACT_APP_API_URL || 'https://api.conship.ai';

class QuoteAPI {
  // Create quote request and get ID
  async createQuoteRequest(formData, serviceType) {
    try {
      const response = await fetch(`${API_BASE}/quotes/requests`, {
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
        requestId: data.request_id,
        requestNumber: data.request_number
      };
    } catch (error) {
      console.error('Create quote request error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mock version for development
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
      
      const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`));
      request.status = 'QUOTED';
      request.costFiles = mockCostFiles;
      localStorage.setItem(`quote_request_${requestId}`, JSON.stringify(request));
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
    // Get auth token from wherever you store it
    return localStorage.getItem('auth_token') || '';
  }
}

export default new QuoteAPI();
