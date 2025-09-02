import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Truck, MapPin, DollarSign, ChevronRight } from 'lucide-react';

const RecentQuotes = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentQuotes();
  }, []);

  const loadRecentQuotes = async () => {
    try {
      // For now, get from MongoDB via API or localStorage
      const response = await fetch('https://api.gcc.conship.ai/api/ground-quotes/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
      // Fallback to localStorage for testing
      loadMockQuotes();
    }
    setLoading(false);
  };

  const loadMockQuotes = () => {
    // Load from localStorage for testing
    const mockQuotes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('quote_request_')) {
        const quote = JSON.parse(localStorage.getItem(key));
        mockQuotes.push(quote);
      }
    }
    setQuotes(mockQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleQuoteClick = (quote) => {
    // Navigate to results page with the quote data
    navigate(`/app/quotes/ground/results/${quote.requestId}`, {
      state: {
        requestId: quote.requestId,
        requestNumber: quote.requestNumber,
        serviceType: quote.serviceType,
        formData: quote.formData
      }
    });
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
          Recent Ground Quotes
        </h2>
        <button
          onClick={() => navigate('/app/quotes/ground')}
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
              key={quote.requestId}
              onClick={() => handleQuoteClick(quote)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-750 border-gray-700 hover:border-gray-600' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {quote.requestNumber}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      quote.status === 'quoted' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : quote.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {quote.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {quote.formData?.originCity}, {quote.formData?.originState} → 
                        {quote.formData?.destCity}, {quote.formData?.destState}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {quote.serviceType?.toUpperCase()}
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
