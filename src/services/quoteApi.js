// src/services/quoteApi.js
const axios = window.shellAxios; // Use authenticated axios from Shell

const API_BASE = ''; // Empty because baseURL is already set in shellAxios

const createGroundQuote = async (formData, serviceType) => {
  try {
    // Log the request for debugging
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

    const { data } = await axios.post('/ground-quotes/create', requestData);
    
    console.log('Quote created successfully:', data);
    
    return {
      success: true,
      requestId: data.requestId,
      requestNumber: data.requestNumber,
      status: data.status
    };
  } catch (error) {
    console.error('Error creating ground quote:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Server error occurred'
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: 'No response from server. Please check your connection.'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};

const getGroundQuoteResults = async (requestId) => {
  try {
    const { data } = await axios.get(`/ground-quotes/results/${requestId}`);
    
    // Map the response to expected format
    return {
      success: true,
      status: data.status,
      requestNumber: data.requestNumber,
      serviceType: data.serviceType,
      formData: data.formData,
      quotes: data.quotes || [],
      error: data.error
    };
  } catch (error) {
    console.error('Error fetching quote results:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch quote results'
    };
  }
};

// Add default export (required for the refactored Ground.jsx)
const quoteApi = {
  createGroundQuote,
  createGroundQuoteRequest: createGroundQuote, // Alias for compatibility
  getGroundQuoteResults
};

export default quoteApi;

// Also keep named exports for backward compatibility
export { createGroundQuote, getGroundQuoteResults };
