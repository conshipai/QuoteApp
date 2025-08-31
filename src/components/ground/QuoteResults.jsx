import React, { useState, useEffect } from 'react';
import { Check, Clock, Truck, AlertCircle, Package, MapPin } from 'lucide-react';
import quoteApi from '../../services/quoteApi';

const GroundQuoteResults = ({ requestId, requestNumber, serviceType, formData, onBack, isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PROCESSING');
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      // For ground quotes specifically
      const result = await quoteApi.mockGetGroundQuoteResults(requestId);
      
      if (result.success) {
        setStatus(result.status);
        if (result.status === 'QUOTED') {
          setQuotes(result.costFiles);
          setLoading(false);
        }
      } else {
        setError(result.error);
        setLoading(false);
      }
    };

    const interval = setInterval(() => {
      if (status === 'PROCESSING') {
        fetchResults();
      }
    }, 1000);

    fetchResults();
    return () => clearInterval(interval);
  }, [requestId, status]);

  if (loading && status === 'PROCESSING') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          <div className={`text-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
                 style={{borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent'}}></div>
            <h2 className="text-2xl font-bold mb-2">Getting {serviceType.toUpperCase()} Quotes...</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Request #{requestNumber}
            </p>
            <div className={`mt-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Contacting carriers...</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <span>SEFL</span>
                <span>•</span>
                <span>STG Logistics</span>
                <span>•</span>
                <span>YRC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          <div className={`text-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Getting Quotes</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
            <button
              onClick={onBack}
              className={`mt-6 px-6 py-2 rounded font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {serviceType.toUpperCase()} Quote Results
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Request #{requestNumber}
              </p>
            </div>
            <button
              onClick={onBack}
              className={`text-sm px-4 py-2 rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New Quote
            </button>
          </div>
        </div>

        {/* Shipment Summary */}
        <div className={`mb-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.originCity}, {formData.originState} {formData.originZip}
                </span>
              </div>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.destCity}, {formData.destState} {formData.destZip}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formData.commodities.reduce((sum, c) => sum + parseInt(c.quantity || 0), 0)} units,
                {' '}
                {formData.commodities.reduce((sum, c) => sum + parseInt(c.weight || 0), 0)} lbs
              </span>
            </div>
          </div>
        </div>

        {/* Quote Cards - Ground Specific */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotes.map((quote, index) => (
            <div
              key={index}
              onClick={() => setSelectedQuote(index)}
              className={`
                p-6 rounded-lg border-2 cursor-pointer transition-all
                ${selectedQuote === index 
                  ? isDarkMode 
                    ? 'border-conship-orange bg-gray-800' 
                    : 'border-conship-purple bg-purple-50'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Carrier Info */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quote.service_details.carrier}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quote.service_details.service}
                  </p>
                </div>
                {selectedQuote === index && (
                  <Check className={`w-6 h-6 ${
                    isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                  }`} />
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${quote.final_price.toFixed(2)}
                </div>
                {/* Ground-specific details */}
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Base: ${quote.raw_cost.toFixed(2)} | Fuel: ${quote.fuel_surcharge || '0.00'} | +{quote.markup_percentage}%
                </div>
              </div>

              {/* Ground-specific details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transit: {quote.transit_days} business days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {serviceType === 'ltl' ? 'LTL Service' : serviceType === 'ftl' ? 'Full Truckload' : 'Expedited'}
                  </span>
                </div>
                {quote.service_details.guaranteed && (
                  <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ✓ Guaranteed Service
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => {
              const selected = quotes[selectedQuote];
              console.log('Saving quote:', {
                requestId,
                carrier: selected.service_details.carrier,
                price: selected.final_price
              });
              alert('Quote saved!');
            }}
            className={`px-6 py-2 rounded font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Save Quote
          </button>
          <button
            onClick={() => {
              if (selectedQuote !== null) {
                const selected = quotes[selectedQuote];
                console.log('Booking shipment:', {
                  requestId,
                  carrier: selected.service_details.carrier,
                  price: selected.final_price
                });
                alert(`Proceeding to book with ${selected.service_details.carrier}`);
              }
            }}
            disabled={selectedQuote === null}
            className={`px-6 py-2 rounded font-medium ${
              selectedQuote === null
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            Book Shipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroundQuoteResults;
