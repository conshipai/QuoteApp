// src/reducers/groundQuoteReducer.js
export const initialState = {
  step: 'service_selection', // 'service_selection', 'form', 'results'
  serviceType: null, // 'ltl', 'ftl', 'expedited'
  formData: {
    // Origin
    originZip: '',
    originCity: '',
    originState: '',
    // Destination
    destZip: '',
    destCity: '',
    destState: '',
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Fixed: removed double colon
    // Commodities
    commodities: [
      {
        unitType: 'Pallets',
        quantity: '1',
        weight: '',
        length: '',
        width: '',
        height: '',
        description: '',
        nmfc: '',
        calculatedClass: '',
        overrideClass: '',
        useOverride: false,
        density: null,
        cubicFeet: null,
        hazmat: false,
        hazmatDetails: null,
        notes: '',
        useMetric: false // Add metric support
      }
    ],
    // Accessorials
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false,
    // Service-specific fields
    equipmentType: '',
    truckType: '',
    serviceMode: 'dedicated',
    asap: false,
    pickup24Hour: false,
    delivery24Hour: false,
    pickupHours: '',
    deliveryHours: '',
    loadType: 'custom',
    legalLoadWeight: '',
    legalLoadPallets: '',
    dropTrailer: false,
    teamService: false
  },
  loading: false,
  error: null,
  quoteRequest: null // { requestId, requestNumber }
};

export const groundQuoteReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_SERVICE':
      return {
        ...state,
        serviceType: action.payload,
        step: 'form'
      };
      
    case 'UPDATE_FORM':
      return {
        ...state,
        formData: action.payload
      };
      
    case 'SUBMIT_QUOTE':
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case 'QUOTE_CREATED':
      return {
        ...state,
        loading: false,
        quoteRequest: action.payload,
        step: state.serviceType === 'ltl' ? 'results' : state.step
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
};
