// src/services/quoteApi.js
const axios = window.shellAxios; // Use authenticated axios from Shell
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
    const { data } = await axios.post('/ground-quotes/create', requestData);
    
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
      return {
        success: true,
        ...parsed
      };
    }
    
    // Try the correct endpoint URL (fixed order)
    const { data } = await axios.get(`/ground-quotes/results/${requestId}`);
    
    console.log('Backend response:', data);
    
    // Handle the response properly
    if (data.success) {
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

const quoteApi = {
  createGroundQuote,
  createGroundQuoteRequest: createGroundQuote,
  getGroundQuoteResults
};

export default quoteApi;

export { createGroundQuote, getGroundQuoteResults };
