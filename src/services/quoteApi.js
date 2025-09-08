// src/services/quoteApi.js - FIXED VERSION
import API_BASE from '../config/api';

class QuoteAPI {
  constructor() {
    // Add debug mode flag
    this.debugMode = localStorage.getItem('DEBUG_MODE') === 'true';
    this.forceMock = localStorage.getItem('FORCE_MOCK') === 'true';
  }

  // Debug logger
  log(message, data = null) {
    if (this.debugMode) {
      console.log(`🔍 QuoteAPI: ${message}`, data || '');
    }
  }

  async createGroundQuoteRequest(formData, serviceType) {
    this.log('Creating ground quote request', { serviceType, formData });

    // Check if we should use mock
    if (this.forceMock) {
      this.log('FORCE_MOCK enabled, using mock data');
      return this.mockCreateQuoteRequest(formData, serviceType);
    }

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.log('Sending request to backend', `${API_BASE}/ground-quotes/create`);

      const response = await fetch(`${API_BASE}/ground-quotes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType,
          formData
        })
      });

      const responseText = await response.text();
      this.log('Raw response', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Request failed without error message');
      }

      // Validate response structure
      if (!data.data?._id) {
        throw new Error('Invalid response structure: missing request ID');
      }

      // Store the complete quote data with immutable flag
      const completeQuoteData = {
        requestId: data.data._id,
        requestNumber: data.data.requestNumber,
        serviceType: serviceType,
        formData: { ...formData }, // Clone to prevent mutations
        status: 'pending',
        createdAt: new Date().toISOString(),
        immutable: true, // Flag to prevent edits
        originalFormData: { ...formData } // Keep original for comparison
      };

      // Save with versioning
      localStorage.setItem(
        `quote_complete_${data.data._id}`, 
        JSON.stringify(completeQuoteData)
      );

      this.log('Quote created successfully', {
        requestId: data.data._id,
        requestNumber: data.data.requestNumber
      });

      return {
        success: true,
        requestId: data.data._id,
        requestNumber: data.data.requestNumber
      };

    } catch (error) {
      console.error('❌ Quote creation failed:', error);
      
      // Show detailed error to user
      const errorMessage = `
API Error: ${error.message}
Endpoint: ${API_BASE}/ground-quotes/create
Token: ${this.getToken() ? 'Present' : 'Missing'}

To use mock data, run in console:
localStorage.setItem('FORCE_MOCK', 'true')

To enable debug mode:
localStorage.setItem('DEBUG_MODE', 'true')
      `.trim();
      
      alert(errorMessage);
      
      // Don't automatically fall back to mock - let user decide
      if (confirm('Would you like to use mock data instead?')) {
        return this.mockCreateQuoteRequest(formData, serviceType);
      }
      
      throw error;
    }
  }

  async getGroundQuoteResults(requestId) {
    this.log('Getting results for', requestId);

    if (this.forceMock) {
      return this.mockGetGroundQuoteResults(requestId);
    }

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const url = `${API_BASE}/ground-quotes/results/${encodeURIComponent(requestId)}`;
      this.log('Fetching from', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseText = await response.text();
      this.log('Raw response', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok || !data?.success) {
        // Check cache before failing
        const cached = localStorage.getItem(`quote_results_${requestId}`);
        if (cached) {
          this.log('Using cached results (API failed)');
          return JSON.parse(cached);
        }
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      // Cache successful results
      if (data.status === 'quoted' && data.quotes) {
        localStorage.setItem(`quote_results_${requestId}`, JSON.stringify(data));
        this.log('Cached results for future use');
      }

      return data;

    } catch (error) {
      console.error('❌ Failed to get results:', error);
      
      // Try cache
      const cached = localStorage.getItem(`quote_results_${requestId}`);
      if (cached) {
        this.log('Using cached results (exception)');
        return JSON.parse(cached);
      }

      // Ask user what to do
      if (confirm(`Failed to get real quotes: ${error.message}\n\nUse mock data?`)) {
        return this.mockGetGroundQuoteResults(requestId);
      }
      
      throw error;
    }
  }

  // Get immutable quote data for booking/BOL
  getImmutableQuoteData(requestId) {
    const key = `quote_complete_${requestId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      throw new Error('Quote data not found');
    }

    const data = JSON.parse(stored);
    
    if (!data.immutable) {
      console.warn('Quote data is not marked as immutable');
    }

    // Return frozen copy to prevent mutations
    return Object.freeze({
      ...data,
      formData: Object.freeze(data.formData)
    });
  }

  // Validate that booking data matches original quote
  validateBookingData(requestId, bookingFormData) {
    const original = this.getImmutableQuoteData(requestId);
    const errors = [];

    // Check critical fields that must not change
    const criticalFields = [
      'originZip', 'originCity', 'originState',
      'destZip', 'destCity', 'destState'
    ];

    criticalFields.forEach(field => {
      if (bookingFormData[field] !== original.formData[field]) {
        errors.push(`${field} cannot be changed from original quote`);
      }
    });

    // Check commodities haven't changed
    const origCommodities = JSON.stringify(original.formData.commodities);
    const newCommodities = JSON.stringify(bookingFormData.commodities);
    
    if (origCommodities !== newCommodities) {
      errors.push('Commodities cannot be changed. Create a new quote for different items.');
    }

    return errors;
  }

  getToken() {
    const token = localStorage.getItem('auth_token');
    if (!token && !this.forceMock) {
      console.warn('⚠️ No auth token found');
    }
    return token || '';
  }

  // Mock methods remain the same but clearly labeled
  async mockCreateQuoteRequest(formData, serviceType) {
    console.warn('📦 Using MOCK data for quote creation');
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const requestId = `MOCK-${Date.now()}`;
    const requestNumber = `MOCK-QR-${Math.floor(Math.random() * 10000)}`;

    const mockRequest = {
      requestId,
      requestNumber,
      serviceType,
      formData: { ...formData },
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
      isMock: true // Clear indicator
    };

    localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify(mockRequest));
    
    // Simulate results after delay
    setTimeout(() => {
      const mockQuotes = [
        {
          quoteId: `MOCK-QUOTE-1`,
          carrier: 'MOCK: STG Logistics',
          service: 'Standard LTL',
          guaranteed: false,
          rawCost: 485.50,
          price: 629.99,
          markup: 18,
          transitDays: 3,
          additionalFees: []
        }
      ];

      localStorage.setItem(`quote_results_${requestId}`, JSON.stringify({
        success: true,
        status: 'quoted',
        quotes: mockQuotes,
        requestNumber,
        isMock: true
      }));
    }, 2000);

    return { success: true, requestId, requestNumber };
  }

  async mockGetGroundQuoteResults(requestId) {
    console.warn('📦 Using MOCK results');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cached = localStorage.getItem(`quote_results_${requestId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    return {
      success: true,
      status: 'processing',
      quotes: [],
      isMock: true
    };
  }
}

export default new QuoteAPI();
