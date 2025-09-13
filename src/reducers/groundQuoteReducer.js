// src/reducers/groundQuoteReducer.js
export const initialState = {
  step: 'service_selection', // 'service_selection' | 'form' | 'results' | 'booking' | 'bol'
  serviceType: null, // 'ltl' | 'ftl' | 'expedited'
  formData: {
    originCity: '',
    originState: '',
    originZip: '',
    destCity: '',
    destState: '',
    destZip: '',
    pickupDate: '',
    commodities: [],
    accessorials: {},
    // FTL specific
    loadType: 'legal',
    equipmentType: '',
    // Expedited specific
    vehicleType: '',
    teamDrivers: false
  },
  quoteRequest: null, // { requestId, requestNumber }
  quotes: [],
  selectedQuote: null,
  booking: null,
  loading: false,
  error: null,
  pollingStatus: null
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
        formData: {
          ...state.formData,
          ...action.payload
        }
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
        quoteRequest: action.payload,
        step: 'results',
        loading: false
      };
    
    case 'QUOTES_RECEIVED':
      return {
        ...state,
        quotes: action.payload,
        loading: false,
        pollingStatus: 'complete'
      };
    
    case 'SELECT_QUOTE':
      return {
        ...state,
        selectedQuote: action.payload,
        step: 'booking'
      };
    
    case 'BOOKING_CREATED':
      return {
        ...state,
        booking: action.payload,
        step: 'confirmation'
      };
    
    case 'RESET':
      return initialState;
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};
