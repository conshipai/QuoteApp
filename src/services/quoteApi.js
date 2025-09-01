// src/services/quoteApi.js
import API_BASE from '../config/api';

class QuoteAPI {
  // ===== Real API methods =====

  // Create GROUND quote request - UPDATED
  async createGroundQuoteRequest(formData, serviceType) {
    try {
      console.log('📤 Sending to backend:', { serviceType, formData });

      const response = await fetch(`${API_BASE}/ground-quotes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          serviceType,
          formData
        })
      });

      // Attempt to parse JSON even on non-2xx for more useful errors
      const data = await response.json().catch(() => ({}));
      console.log('📥 Backend response:', data);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Failed to create quote (HTTP ${response.status})`);
      }

      return {
        success: true,
        requestId: data.data?._id,
        requestNumber: data.data?.requestNumber
      };
    } catch (error) {
      console.error('❌ API error (createGroundQuoteRequest):', error);

      // Fallback to mock behavior
      return this.mockCreateQuoteRequest(formData, serviceType);
    }
  }

  // Get ground quote results - NEW
  async getGroundQuoteResults(requestId) {
    try {
      const response = await fetch(`${API_BASE}/ground-quotes/results/${encodeURIComponent(requestId)}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      // Parse JSON even on non-2xx
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Failed to fetch results (HTTP ${response.status})`);
      }

      return data; // keep shape from backend
    } catch (error) {
      console.error('❌ API error (getGroundQuoteResults):', error);

      // Fallback to mock behavior
      return this.mockGetGroundQuoteResults(requestId);
    }
  }

  // ===== Mock methods (fallbacks) =====

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

    // Simulate backend processing that will later populate results
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
    // Simulate small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`) || '{}');

    if (!request?.requestId) {
      return { success: false, error: 'Request not found' };
    }

    // Return data in a shape that mirrors your real endpoint as closely as possible
    return {
      success: true,
      status: request.status,
      costFiles: request.costFiles || [],
      requestNumber: request.requestNumber
    };
  }

  // ===== Utilities =====

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new QuoteAPI();
