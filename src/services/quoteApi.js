// src/services/quoteApi.js
const API_BASE = process.env.REACT_APP_API_URL || 'https://api.conship.ai';

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

  // Poll for quote results
  async getQuoteResults(requestId) {
    try {
      const response = await fetch(`${API_BASE}/quotes/requests/${requestId}/results`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch results');
      
      const data = await response.json();
      return {
        success: true,
        status: data.status,
        costFiles: data.cost_files || [],
        quotes: data.quotes || []
      };
    } catch (error) {
      console.error('Get quote results error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // For development: Mock responses
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
          transit_days: 3,
          markup_percentage: 18,
          final_price: 572.89, // 485.50 * 1.18
          service_details: {
            carrier: 'STG Logistics',
            service: 'Standard LTL',
            estimated_delivery: '3-4 business days'
          }
        },
        {
          provider: 'SEFL',
          raw_cost: 512.25,
          transit_days: 2,
          markup_percentage: 25,
          final_price: 640.31, // 512.25 * 1.25
          service_details: {
            carrier: 'Southeastern Freight Lines',
            service: 'Priority LTL',
            estimated_delivery: '2-3 business days'
          }
        }
      ];
      
      const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`));
      request.status = 'QUOTED';
      request.costFiles = mockCostFiles;
      localStorage.setItem(`quote_request_${requestId}`, JSON.stringify(request));
    }, 3000);
  }

  async mockGetQuoteResults(requestId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`) || '{}');
    
    if (!request.requestId) {
      return {
        success: false,
        error: 'Request not found'
      };
    }
    
    return {
      success: true,
      status: request.status,
      costFiles: request.costFiles || [],
      requestNumber: request.requestNumber
    };
  }

  // Add to quoteApi.js
  async mockGetGroundQuoteResults(requestId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`) || '{}');
    
    if (!request.requestId) {
      return { success: false, error: 'Request not found' };
    }
    
    // Ground-specific mock data
    if (!request.costFiles && request.status === 'PROCESSING') {
      setTimeout(() => {
        const groundQuotes = [
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
        
        request.status = 'QUOTED';
        request.costFiles = groundQuotes;
        localStorage.setItem(`quote_request_${requestId}`, JSON.stringify(request));
      }, 3000);
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
