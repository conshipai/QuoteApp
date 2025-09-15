// src/pages/Ground.jsx - FIXED
import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { groundQuoteReducer, initialState } from '../reducers/groundQuoteReducer';
import quoteApi from '../services/quoteApi'; // Import default object
import ServiceTypeSelector from '../components/ground/ServiceTypeSelector';
import GroundFormBase from '../components/ground/GroundFormBase';
import GroundQuoteResults from '../components/ground/QuoteResults';
import FTLOptions from '../components/ground/FTLOptions';
import ExpeditedOptions from '../components/ground/ExpeditedOptions';

const Ground = ({ isDarkMode }) => {
  const [state, dispatch] = useReducer(groundQuoteReducer, initialState);
  const navigate = useNavigate();

  const handleServiceSelect = (serviceType) => {
    dispatch({ type: 'SELECT_SERVICE', payload: serviceType });
  };

      const handleFormSubmit = async () => {
      dispatch({ type: 'SUBMIT_QUOTE' });
      
      try {
        // This should work if shellAxios is being used
        const token = window.shellAuth?.token || localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        
        // This will now work because quoteApi is properly exported
        const result = await quoteApi.createGroundQuoteRequest(
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
      console.error('Quote submission error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Show user-friendly error
      if (error.message.includes('Authentication')) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert(`Error creating quote: ${error.message}`);
      }
    }
  };

  // Rest of your component...
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
                dispatch({ type: 'UPDATE_FORM', payload: { ...state.formData, [field]: value } })
              }
              isDarkMode={isDarkMode}
            />
          )}
          {state.serviceType === 'expedited' && (
            <ExpeditedOptions
              formData={state.formData}
              onChange={(field, value) => 
                dispatch({ type: 'UPDATE_FORM', payload: { ...state.formData, [field]: value } })
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
