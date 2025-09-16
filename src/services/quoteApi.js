// src/services/quoteApi.js
const axios = window.shellAxios; // Use authenticated axios from Shell

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
        status: 'quote_ready',
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
    // First check localStorage for LTL quotes
    const storedData = localStorage.getItem(`ground_quotes_${requestId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      console.log('Retrieved quotes from localStorage:', parsed);
      return {
        success: true,
        ...parsed
      };
    }
    
    // For FTL/Expedited, try to fetch from the server
    // This endpoint might not exist yet for your backend
    console.log('Attempting to fetch from server for requestId:', requestId);
    
    // Try the quotes/details endpoint which exists in your backend
    const { data } = await axios.get(`/quotes/details/${requestId}`);
    
    return {
      success: true,
      status: data.status || 'processing',
      requestNumber: data.requestNumber,
      serviceType: data.serviceType,
      formData: data.formData,
      quotes: data.quotes || [],
      error: data.error
    };
  } catch (error) {
    console.error('Error fetching quote results:', error);
    
    // If it's a 404, return a processing status
    if (error.response?.status === 404) {
      return {
        success: true,
        status: 'processing',
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
