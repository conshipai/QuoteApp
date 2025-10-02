// src/services/quoteApi.js
import api from './api';
import { ShipmentLifecycle } from '../constants/shipmentLifecycle';

const createGroundQuote = async (formData, serviceType) => {
  try {
    console.log('Creating ground quote:', { serviceType, formData });
    
    const requestData = {
      serviceType,
      originZip: formData.originZip,
      originCity: formData.originCity,
      originState: formData.originState,
      destZip: formData.destZip,
      destCity: formData.destCity,
      destState: formData.destState,
      pickupDate: formData.pickupDate,
      commodities: formData.commodities || [],
      additionalStops: formData.additionalStops || [],
      
      // Include accessorials
      liftgatePickup: formData.liftgatePickup || false,
      liftgateDelivery: formData.liftgateDelivery || false,
      residentialDelivery: formData.residentialDelivery || false,
      insideDelivery: formData.insideDelivery || false,
      limitedAccessPickup: formData.limitedAccessPickup || false,
      limitedAccessDelivery: formData.limitedAccessDelivery || false,
      
      // Include user info for customer carrier accounts if available
      userId: formData.userId || window.shellContext?.userId,
      companyId: formData.companyId || window.shellContext?.companyId,
      
      // Service-specific fields
      ...(serviceType === 'ftl' && {
        equipmentType: formData.equipmentType,
        loadType: formData.loadType,
        legalLoadWeight: formData.legalLoadWeight,
        legalLoadPallets: formData.legalLoadPallets,
        pickup24Hour: formData.pickup24Hour,
        delivery24Hour: formData.delivery24Hour,
        pickupHours: formData.pickupHours,
        deliveryHours: formData.deliveryHours,
        dropTrailer: formData.dropTrailer,
        teamService: formData.teamService
      }),
      
      ...(serviceType === 'expedited' && {
        truckType: formData.truckType,
        serviceMode: formData.serviceMode,
        asap: formData.asap,
        pickup24Hour: formData.pickup24Hour,
        delivery24Hour: formData.delivery24Hour,
        pickupHours: formData.pickupHours,
        deliveryHours: formData.deliveryHours,
        loadType: formData.loadType,
        legalLoadWeight: formData.legalLoadWeight
      })
    };

    console.log('Sending request data to API:', requestData);
    const { data } = await api.post('/ground-quotes/create', requestData);
    
    console.log('Quote created successfully:', data);
    
    // For LTL, save the quotes if they're returned immediately
    if (serviceType === 'ltl' && data.quotes) {
      // Store the quotes in localStorage for retrieval
      localStorage.setItem(`ground_quotes_${data.requestId}`, JSON.stringify({
        status: ShipmentLifecycle.QUOTE_READY,
        quotes: data.quotes,
        requestNumber: data.requestNumber,
        formData: requestData,
        serviceType: serviceType
      }));
      
      console.log(`✅ Received ${data.quotes.length} LTL quotes, including:`, 
        data.quotes.map(q => q.carrier).join(', '));
    }
    
    return {
      success: true,
      requestId: data.requestId,
      requestNumber: data.requestNumber,
      status: data.status,
      quotes: data.quotes // Include quotes if returned
    };
  } catch (error) {
    console.error('Error creating ground quote:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Server error occurred'
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check your connection.'
      };
    } else {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};

const getGroundQuoteResults = async (requestId) => {
  try {
    console.log('Fetching results for requestId:', requestId);
    
    // First check localStorage for any cached data
    const storedData = localStorage.getItem(`ground_quotes_${requestId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      console.log('Found cached quotes:', parsed);
      
      // Log carriers found
      if (parsed.quotes && parsed.quotes.length > 0) {
        console.log(`📊 Cached quotes from: ${parsed.quotes.map(q => q.carrier).join(', ')}`);
      }
      
      return {
        success: true,
        ...parsed
      };
    }
    
    // Fetch from backend
    const { data } = await api.get(`/ground-quotes/results/${requestId}`);
    
    console.log('Backend response:', data);
    
    // Handle the response properly
    if (data.success) {
      // Log carriers found
      if (data.quotes && data.quotes.length > 0) {
        console.log(`📊 Backend returned quotes from: ${data.quotes.map(q => q.carrier).join(', ')}`);
        
        // Check for GlobalTranz specifically
        const globalTranzQuotes = data.quotes.filter(q => 
          q.carrier?.toLowerCase().includes('globaltranz') || 
          q.carrierCode === 'GLOBALTRANZ'
        );
        
        if (globalTranzQuotes.length > 0) {
          console.log(`✅ GlobalTranz returned ${globalTranzQuotes.length} service options`);
        }
      }
      
      return {
        success: true,
        status: data.status || ShipmentLifecycle.QUOTE_PROCESSING,
        requestNumber: data.requestNumber,
        serviceType: data.serviceType,
        formData: data.formData,
        quotes: data.quotes || [],
        error: data.error
      };
    } else {
      return {
        success: true, // Keep it true to continue polling
        status: ShipmentLifecycle.QUOTE_PROCESSING,
        quotes: [],
        error: null
      };
    }
  } catch (error) {
    console.error('Error fetching quote results:', error);
    
    // If it's a 404, the quote might still be processing
    if (error.response?.status === 404) {
      console.log('Quote not found, still processing...');
      return {
        success: true,
        status: ShipmentLifecycle.QUOTE_PROCESSING,
        quotes: [],
        error: null
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch quote results'
    };
  }
};

// Debug function to check active carriers
const getActiveCarriers = async () => {
  try {
    const { data } = await api.get('/ground-quotes/active-carriers');
    console.log('Active carriers on backend:', data.carriers);
    return data.carriers;
  } catch (error) {
    console.error('Error fetching active carriers:', error);
    return [];
  }
};

const quoteApi = {
  createGroundQuote,
  createGroundQuoteRequest: createGroundQuote,
  getGroundQuoteResults,
  getActiveCarriers // Export for debugging
};

export default quoteApi;

export { createGroundQuote, getGroundQuoteResults, getActiveCarriers };
