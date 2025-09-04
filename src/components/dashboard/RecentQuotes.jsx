// src/components/dashboard/RecentQuotes.jsx
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Clock, Truck, MapPin, ChevronRight, Anchor, Plane, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';

const RecentQuotes = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentQuotes();
  }, []);

  const loadRecentQuotes = async () => {
    try {
      const auth = localStorage.getItem('auth_token') || '';
      // Ground
      const groundResponse = await fetch('https://api.gcc.conship.ai/api/ground-quotes/recent', {
        headers: { 'Authorization': `Bearer ${auth}` }
      });
      let allQuotes = [];
      if (groundResponse.ok) {
        const groundData = await groundResponse.json();
        if (groundData.success && groundData.requests) {
          const groundQuotes = groundData.requests.map(req => ({ ...req, mode: 'ground', direction: null }));
          allQuotes = [...allQuotes, ...groundQuotes];
        }
      }
      // Air/Ocean
      const airOceanResponse = await fetch('https://api.gcc.conship.ai/api/quotes/recent', {
        headers: { 'Authorization': `Bearer ${auth}` }
      });
      if (airOceanResponse.ok) {
        const airOceanData = await airOceanResponse.json();
        if (airOceanData.success && airOceanData.requests) {
          const aoQuotes = airOceanData.requests.map(req => ({
            ...req,
            mode: req.shipment?.mode || 'air',
            direction: req.shipment?.direction || 'export'
          }));
          allQuotes = [...allQuotes, ...aoQuotes];
        }
      }
      // Check booking status
      const quotesWithBookingStatus = await Promise.all(
        allQuotes.map(async (quote) => {
          try {
            const bookingResponse = await fetch(`https://api.gcc.conship.ai/api/bookings/by-request/${quote.requestId || quote._id}`, {
              headers: { 'Authorization': `Bearer ${auth}` }
            });
            if (bookingResponse.ok) {
              const bookingData = await bookingResponse.json();
              return {
                ...quote,
                isBooked: bookingData.success && bookingData.booking,
                bookingId: bookingData.booking?.bookingId
              };
            }
          } catch (e) { console.error('Error checking booking status:', e); }
          return { ...quote, isBooked: false };
        })
      );
      quotesWithBookingStatus.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuotes(quotesWithBookingStatus);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quotes:', error);
      setLoading(false);
    }
  };

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'ocean': return <Anchor className="w-4 h-4" />;
      case 'air': return <Plane className="w-4 h-4" />;
      case 'ground': 
      default: return <Truck className="w-4 h-4" />;
    }
  };

  const getDirectionIcon = (direction) => {
    if (direction === 'import') return <ArrowDown className="w-3 h-3" />;
    if (direction === 'export') return <ArrowUp className="w-3 h-3" />;
    return null;
  };

  const handleQuoteClick = (quote) => {
    if (quote.isBooked) {
      navigate(`/app/quotes/bookings/${quote.bookingId}`);
    } else if (quote.mode === 'ground') {
      navigate(`/app/quotes/ground/results/${quote.requestId || quote._id}`, {
        state: {
          requestId: quote.requestId || quote._id,
          requestNumber: quote.requestNumber,
          serviceType: quote.serviceType,
          formData: quote.formData || {},
          status: quote.status
        }
      });
    } else {
      navigate(`/app/quotes/${quote.mode}/results/${quote.requestId || quote._id}`, {
        state: {
          requestId: quote.requestId || quote._id,
          requestNumber: quote.requestNumber,
          mode: quote.mode,
          direction: quote.direction
        }
      });
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Quotes
        </h2>
        <button
          onClick={() => navigate('/app/quotes')}
          className={`text-sm px-3 py-1 rounded ${
            isDarkMode 
              ? 'bg-conship-orange text-white hover:bg-orange-600' 
              : 'bg-conship-purple text-white hover:bg-purple-700'
          }`}
        >
          New Quote
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          No quotes yet. Create your first quote!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {quotes.slice(0, 10).map((quote) => (
            <div
              key={quote.requestId || quote._id}
              onClick={() => handleQuoteClick(quote)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-700 hover:border-gray-600' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {quote.requestNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      {getModeIcon(quote.mode)}
                      {getDirectionIcon(quote.direction)}
                    </div>
                    {quote.isBooked ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        BOOKED
                      </span>
                    ) : (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          quote.status === 'quoted'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : quote.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {quote.status?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {quote.formData?.originCity || quote.origin?.city}, {quote.formData?.originState || quote.origin?.state} 
                        → {quote.formData?.destCity || quote.destination?.city}, {quote.formData?.destState || quote.destination?.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(quote.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentQuotes;
