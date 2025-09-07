// src/services/quoteApi.js
import API_BASE from '../config/api';

class QuoteAPI {
  // ===== Real API methods =====

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

      // Only save complete data if we have a successful response
      if (data.success && data.data?._id) {
        const completeQuoteData = {
          requestId: data.data._id,
          requestNumber: data.data.requestNumber,
          serviceType: serviceType,
          formData: formData,  // ✅ Critical for history navigation
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Save complete quote data for history access
        localStorage.setItem(
          `quote_complete_${data.data._id}`, 
          JSON.stringify(completeQuoteData)
        );
        
        // Also save just the form data (for backward compatibility)
        localStorage.setItem(
          `quote_formdata_${data.data._id}`,
          JSON.stringify(formData)
        );
        
        console.log('💾 Saved complete quote data for history');
      }

      return {
        success: true,
        requestId: data.data?._id,
        requestNumber: data.data?.requestNumber
      };
      
    } catch (error) {
      console.error('❌ API error (createGroundQuoteRequest):', error);
      
      // Fallback to mock behavior if API fails
      return this.mockCreateQuoteRequest(formData, serviceType);
    }
  }

  // Get ground quote results - WITH CACHING
  async getGroundQuoteResults(requestId) {
    try {
      const response = await fetch(`${API_BASE}/ground-quotes/results/${encodeURIComponent(requestId)}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      // Parse JSON even on non-2xx
      const data = await response.json().catch(() => ({}));
      
      console.log('🔍 Raw backend response for results:', data);

      if (!response.ok || !data?.success) {
        // Try to get from localStorage if backend fails
        const cached = localStorage.getItem(`quote_results_${requestId}`);
        if (cached) {
          console.log('📦 Using cached quote results (backend failed)');
          return JSON.parse(cached);
        }
        throw new Error(data?.error || `Failed to fetch results (HTTP ${response.status})`);
      }

      // SAVE THE RESULTS for future retrieval
      if (data.status === 'quoted' && data.quotes) {
        localStorage.setItem(`quote_results_${requestId}`, JSON.stringify(data));
        console.log('💾 Saved quote results for future retrieval');
      }

      return data; // keep shape from backend
    } catch (error) {
      console.error('❌ API error (getGroundQuoteResults):', error);
      
      // Check localStorage first before falling back to mock
      const cached = localStorage.getItem(`quote_results_${requestId}`);
      if (cached) {
        console.log('📦 Using cached quote results (catch block)');
        return JSON.parse(cached);
      }

      // Fallback to mock behavior
      return this.mockGetGroundQuoteResults(requestId);
    }
  }

  // ✅ NEW: Get form data for a specific request (for history navigation)
  async getQuoteFormData(requestId) {
    try {
      // First try to get from backend
      const response = await fetch(`${API_BASE}/ground-quotes/formdata/${encodeURIComponent(requestId)}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.formData) {
          console.log('✅ Got form data from backend');
          return data.formData;
        }
      }
    } catch (error) {
      console.error('⚠️ Backend formdata fetch failed, checking localStorage:', error);
    }

    // Fallback to localStorage
    // Try multiple keys for backward compatibility
    const keys = [
      `quote_formdata_${requestId}`,
      `quote_complete_${requestId}`,
      `quote_request_${requestId}`
    ];

    for (const key of keys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Extract formData from different possible structures
          const formData = parsed.formData || parsed;
          if (formData && (formData.originZip || formData.originCity)) {
            console.log(`✅ Got form data from localStorage (${key})`);
            return formData;
          }
        } catch (e) {
          console.error(`Failed to parse ${key}:`, e);
        }
      }
    }

    console.warn('❌ No form data found for requestId:', requestId);
    return null;
  }

  // ✅ NEW: Get recent quotes with form data
  async getRecentQuotes(limit = 10) {
    try {
      const response = await fetch(`${API_BASE}/ground-quotes/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Got recent quotes from backend');
          return data.requests || [];
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to fetch recent quotes:', error);
    }

    // Fallback to localStorage
    return this.getRecentQuotesFromStorage(limit);
  }

  // Helper: Get recent quotes from localStorage
  getRecentQuotesFromStorage(limit = 10) {
    const quotes = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quote_complete_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.requestId) {
            quotes.push(data);
          }
        } catch (e) {
          console.error('Error parsing stored quote:', key, e);
        }
      }
    }

    // Sort by createdAt (newest first) and limit
    return quotes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Clear cached results (utility method for cleanup)
  clearCachedResults(requestId) {
    const keysToRemove = [
      `quote_results_${requestId}`,
      `quote_complete_${requestId}`,
      `quote_formdata_${requestId}`,
      `quote_request_${requestId}`
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ Cleared all cached data for:', requestId);
  }

  // Get all cached quote results (utility for debugging)
  getAllCachedResults() {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quote_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          results.push({
            key,
            requestId: key.split('_').pop(),
            type: key.split('_')[1], // 'results', 'complete', 'formdata', 'request'
            data
          });
        } catch (e) {
          console.error('Error parsing cached result:', key, e);
        }
      }
    }
    return results;
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

    // Save in multiple formats for compatibility
    localStorage.setItem(`quote_request_${requestId}`, JSON.stringify(mockRequest));
    localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify(mockRequest));
    localStorage.setItem(`quote_formdata_${requestId}`, JSON.stringify(formData));

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
      const mockQuotes = [
        {
          quoteId: `QUOTE-${Date.now()}-1`,
          carrier: 'STG Logistics',
          service: 'Standard LTL',
          guaranteed: false,
          rawCost: 485.50,
          price: 629.99,
          markup: 18,
          transitDays: 3,
          additionalFees: [],
          fuel_surcharge: 48.55
        },
        {
          quoteId: `QUOTE-${Date.now()}-2`,
          carrier: 'Southeastern Freight Lines',
          service: 'Priority LTL',
          guaranteed: true,
          rawCost: 512.25,
          price: 704.35,
          markup: 25,
          transitDays: 2,
          additionalFees: [],
          fuel_surcharge: 51.23
        }
      ];

      const key = `quote_request_${requestId}`;
      const request = JSON.parse(localStorage.getItem(key) || '{}');
      if (!request || !request.requestId) return;

      // Update the mock request
      request.status = 'QUOTED';
      request.quotes = mockQuotes;
      localStorage.setItem(key, JSON.stringify(request));

      // Also save in the quote_results format for consistency
      const mockResults = {
        success: true,
        status: 'quoted',
        quotes: mockQuotes,
        requestNumber: request.requestNumber
      };
      localStorage.setItem(`quote_results_${requestId}`, JSON.stringify(mockResults));
      console.log('💾 Mock quote results saved');
    }, 3000);
  }

  async mockGetGroundQuoteResults(requestId) {
    // Simulate small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // First check if we have cached results
    const cached = localStorage.getItem(`quote_results_${requestId}`);
    if (cached) {
      console.log('📦 Using cached mock results');
      return JSON.parse(cached);
    }

    // Otherwise check the old mock request format
    const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`) || '{}');

    if (!request?.requestId) {
      return { success: false, error: 'Request not found' };
    }

    // Convert old format to new format if needed
    if (request.status === 'QUOTED' && request.costFiles) {
      const quotes = request.costFiles.map((cf, idx) => ({
        quoteId: `QUOTE-MOCK-${idx}`,
        carrier: cf.service_details?.carrier || 'Unknown Carrier',
        service: cf.service_details?.service || 'Standard',
        guaranteed: cf.service_details?.guaranteed || false,
        rawCost: cf.raw_cost || 0,
        price: cf.final_price || 0,
        markup: cf.markup_percentage || 0,
        transitDays: cf.transit_days || 0,
        additionalFees: [],
        fuel_surcharge: cf.fuel_surcharge || 0
      }));

      return {
        success: true,
        status: 'quoted',
        quotes: quotes,
        requestNumber: request.requestNumber
      };
    }

    // Return data in a shape that mirrors your real endpoint
    return {
      success: true,
      status: request.status?.toLowerCase() || 'processing',
      quotes: request.quotes || [],
      requestNumber: request.requestNumber
    };
  }

  // ===== Utilities =====

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new QuoteAPI();
