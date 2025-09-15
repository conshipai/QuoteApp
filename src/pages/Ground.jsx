// src/pages/Ground.jsx (FIXED)
import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { groundQuoteReducer, initialState } from '../reducers/groundQuoteReducer';
import quoteApi from '../services/quoteApi'; // Import the full API object
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
      // Use the same API method as the working file
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
        
        // Save to localStorage like the working version
        localStorage.setItem(
          `quote_formdata_${result.requestId}`,
          JSON.stringify(state.formData)
        );
        
        const completeQuoteData = {
          requestId: result.requestId,
          requestNumber: result.requestNumber,
          serviceType: state.serviceType,
          formData: state.formData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(
          `quote_complete_${result.requestId}`,
          JSON.stringify(completeQuoteData)
        );
        
        // Navigate for FTL/Expedited
        if (state.serviceType !== 'ltl') {
          alert(`✅ ${state.serviceType.toUpperCase()} Quote Request Sent!\n\n` +
                `Request #${result.requestNumber}\n\n` +
                `Carriers have been notified and have 30 minutes to respond.\n` +
                `You'll be notified when quotes are ready.`);
          navigate('/app/quotes/history');
        }
      } else {
        throw new Error(result?.error || 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Quote submission error:', error);
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
              onChange={(field, value) => {
                const newFormData = { ...state.formData, [field]: value };
                dispatch({ type: 'UPDATE_FORM', payload: newFormData });
              }}
              isDarkMode={isDarkMode}
            />
          )}
          {state.serviceType === 'expedited' && (
            <ExpeditedOptions
              formData={state.formData}
              onChange={(field, value) => {
                const newFormData = { ...state.formData, [field]: value };
                dispatch({ type: 'UPDATE_FORM', payload: newFormData });
              }}
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
              onChange={(field, value) => {
                const newFormData = { ...state.formData, [field]: value };
                dispatch({ type: 'UPDATE_FORM', payload: newFormData });
              }}
              isDarkMode={isDarkMode}
            />
          )}
          {state.serviceType === 'expedited' && (
            <ExpeditedOptions
              formData={state.formData}
              onChange={(field, value) => {
                const newFormData = { ...state.formData, [field]: value };
                dispatch({ type: 'UPDATE_FORM', payload: newFormData });
              }}
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
