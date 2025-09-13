// src/pages/customers/Ground.jsx (SIMPLIFIED)
import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { groundQuoteReducer, initialState } from '../../reducers/groundQuoteReducer';
import quoteApi from '../../services/quoteApi';

// Use YOUR EXISTING component names!
import ServiceTypeSelector from '../../components/ground/ServiceTypeSelector';
import GroundFormBase from '../../components/ground/GroundFormBase';
import GroundQuoteResults from '../../components/ground/QuoteResults';
import FTLOptions from '../../components/ground/FTLOptions';
import ExpeditedOptions from '../../components/ground/ExpeditedOptions';

const Ground = ({ isDarkMode }) => {
  const [state, dispatch] = useReducer(groundQuoteReducer, initialState);
  const navigate = useNavigate();

  const handleServiceSelect = (serviceType) => {
    dispatch({ type: 'SELECT_SERVICE', payload: serviceType });
  };

  const handleFormSubmit = async () => {
    dispatch({ type: 'SUBMIT_QUOTE' });
    
    try {
      // Use your actual API
      const result = await quoteApi.createGroundQuote(
        state.formData,
        state.serviceType
      );
      
      if (result?.success) {
        dispatch({ 
          type: 'QUOTE_CREATED', 
          payload: {
            requestId: result.requestId,
            requestNumber: result.requestNumber
          }
        });
        
        // Navigate for FTL/Expedited
        if (state.serviceType !== 'ltl') {
          navigate('/app/quotes/history');
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Render based on step
  switch (state.step) {
    case 'service_selection':
      return <ServiceTypeSelector onSelect={handleServiceSelect} isDarkMode={isDarkMode} />;
      
    case 'form':
      return (
        <GroundFormBase
          serviceType={state.serviceType}
          formData={state.formData}
          setFormData={(updater) => {
  const newData = typeof updater === 'function' 
    ? updater(state.formData) 
    : updater;
  dispatch({ type: 'UPDATE_FORM', payload: newData });
}}
          onSubmit={handleFormSubmit}
          onCancel={() => dispatch({ type: 'RESET' })}
          loading={state.loading}
          error={state.error}
          isDarkMode={isDarkMode}
        >
          {state.serviceType === 'ftl' && (
            <FTLOptions 
              formData={state.formData}
              onChange={(field, value) => 
                dispatch({ type: 'UPDATE_FORM', payload: { [field]: value } })
              }
              isDarkMode={isDarkMode}
            />
          )}
          {state.serviceType === 'expedited' && (
            <ExpeditedOptions
              formData={state.formData}
              onChange={(field, value) => 
                dispatch({ type: 'UPDATE_FORM', payload: { [field]: value } })
              }
              isDarkMode={isDarkMode}
            />
          )}
        </GroundFormBase>
      );
      
    case 'results':
      return (
        <GroundQuoteResults
          requestId={state.quoteRequest?.requestId}
          requestNumber={state.quoteRequest?.requestNumber}
          serviceType={state.serviceType}
          formData={state.formData}
          onBack={() => dispatch({ type: 'RESET' })}
          isDarkMode={isDarkMode}
        />
      );
      
    default:
      return null;
  }
};

export default Ground;
