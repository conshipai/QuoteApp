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

  try {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Try using the general quotes endpoint like air/ocean
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

    // Now create the quote with the structure that works for air/ocean
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
        company: 'Test Company',
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
        formData: formData // Keep the original form data too
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
    console.error('❌ Quote creation failed:', error);
    alert(`Failed to create quote: ${error.message}`);
    throw error; // NO MOCK FALLBACK!
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
