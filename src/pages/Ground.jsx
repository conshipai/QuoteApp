// src/pages/Ground.jsx
import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { groundQuoteReducer, initialState } from '../reducers/groundQuoteReducer';
import GroundServiceSelector from '../components/ground/GroundServiceSelector';
import GroundQuoteForm from '../components/ground/GroundQuoteForm';
import GroundQuoteResults from '../components/ground/GroundQuoteResults';
import GroundBookingForm from '../components/ground/GroundBookingForm';
import GroundBookingConfirmation from '../components/ground/GroundBookingConfirmation';

const Ground = ({ isDarkMode }) => {
  const [state, dispatch] = useReducer(groundQuoteReducer, initialState);
  const navigate = useNavigate();

  const handleServiceSelect = (serviceType) => {
    dispatch({ type: 'SELECT_SERVICE', payload: serviceType });
  };

  const handleFormSubmit = async (formData) => {
    dispatch({ type: 'SUBMIT_QUOTE' });
    
    try {
      // API call to create quote
      const response = await api.post('/ground-quotes/create', {
        formData,
        serviceType: state.serviceType
      });
      
      dispatch({ 
        type: 'QUOTE_CREATED', 
        payload: {
          requestId: response.data.requestId,
          requestNumber: response.data.requestNumber
        }
      });
      
      // For FTL/Expedited, might redirect instead of showing results
      if (state.serviceType !== 'ltl' && response.data.status === 'pending') {
        navigate('/app/quotes/history');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.error || 'Failed to create quote'
      });
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 'service_selection':
        return (
          <GroundServiceSelector 
            onSelect={handleServiceSelect}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'form':
        return (
          <GroundQuoteForm
            serviceType={state.serviceType}
            formData={state.formData}
            dispatch={dispatch}
            onSubmit={handleFormSubmit}
            loading={state.loading}
            error={state.error}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'results':
        return (
          <GroundQuoteResults
            requestId={state.quoteRequest.requestId}
            serviceType={state.serviceType}
            dispatch={dispatch}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'booking':
        return (
          <GroundBookingForm
            quote={state.selectedQuote}
            dispatch={dispatch}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'confirmation':
        return (
          <GroundBookingConfirmation
            booking={state.booking}
            onCreateBOL={() => navigate(`/app/quotes/bol/${state.booking.id}`)}
            isDarkMode={isDarkMode}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default Ground;
