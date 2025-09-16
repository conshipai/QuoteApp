// src/hooks/useQuotePolling.js
import { useState, useEffect } from 'react';
import quoteApi from '../services/quoteApi';
import { ShipmentLifecycle } from '../constants/shipmentLifecycle';
export const useQuotePolling = (requestId, enabled) => {
  const [quotes, setQuotes] = useState([]);
  const [status, setStatus] = useState('polling');
  
  useEffect(() => {
    if (!enabled || !requestId) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/ground-quotes/results/${requestId}`);
        
        if (response.data.status === ShipmentLifecycle.QUOTE_READY) {
          setQuotes(response.data.quotes);
          setStatus('complete');
          clearInterval(pollInterval);
        } else if (response.data.status === ShipmentLifecycle.QUOTE_EXPIRED) {
          setStatus(ShipmentLifecycle.QUOTE_EXPIRED);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000);
    
    // Stop after 60 seconds
    setTimeout(() => clearInterval(pollInterval), 60000);
    
    return () => clearInterval(pollInterval);
  }, [requestId, enabled]);
  
  return { quotes, status };
};
