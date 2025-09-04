// src/components/ground/GroundQuoteResults.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ADDED
import { Check, Clock, Truck, AlertCircle, Package, MapPin } from 'lucide-react';
import { API_BASE } from '../../config/api'; // ADDED
import quoteApi from '../../services/quoteApi';
import bookingApi from '../../services/bookingApi';  // EXISTING
import BookingConfirmation from './BookingConfirmation';  // EXISTING
import BOLBuilder from '../bol/BOLBuilder';  // EXISTING

const GroundQuoteResults = ({ requestId: requestIdProp, requestNumber, serviceType, formData = {}, onBack, isDarkMode }) => {
  const navigate = useNavigate(); // ADDED
  const { requestId: requestIdParam } = useParams(); // ADDED
  const requestId = requestIdProp || requestIdParam; // ADDED - prefer prop, fallback to route param

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PROCESSING');
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState(null);

  // Booking flow state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [showBOL, setShowBOL] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Step 2 — "Check if booked" on mount; redirect to booking page
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    if (!requestId) return;

    const checkBookingStatus = async () => {
      try {
        const resp = await fetch(`${API_BASE}/bookings/by-request/${requestId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` }
        });
        if (!mounted) return;
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.booking && data.booking.bookingId) {
            navigate(`/app/quotes/bookings/${data.booking.bookingId}`);
          }
        }
      } catch (err) {
        console.error('Error checking booking status:', err);
      }
    };

    checkBookingStatus();
    return () => { mounted = false; };
  }, [requestId, navigate]);

  // ─────────────────────────────────────────────────────────────
  // Quote polling
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!requestId) return;
    let isMounted = true;

    const fetchResults = async () => {
      try {
        const result = await quoteApi.getGroundQuoteResults(requestId);
        console.log('📊 Quote Results from backend:', result);

        if (!isMounted) return;

        if (result.success) {
          // Backend sends lowercase statuses; UI state uses uppercase
          const backendStatus = (result.status || 'processing').toUpperCase();
          setStatus(backendStatus);

          if (result.status === 'quoted' && Array.isArray(result.quotes)) {
            // Map backend format to what the component expects
            const mappedQuotes = result.quotes.map((q) => ({
              quoteId: q.quoteId,
              service_details: {
                carrier: q.carrier,
                service: q.service,
                guaranteed: q.guaranteed
              },
              raw_cost: q.rawCost ?? q.price ?? 0, // fallback to price if rawCost missing
              final_price: q.price ?? 0,
              markup_percentage: q.markup ?? 0,
              transit_days: q.transitDays ?? q.transit_days ?? 0,
              additional_fees: q.additionalFees || [],
              fuel_surcharge: 0 // backend doesn't separate this in current payload
            }));

            setQuotes(mappedQuotes);
            setLoading(false);
          } else if (result.status === 'failed') {
            // Stop polling and show error
            setError(result.error || 'Unable to retrieve quotes. Please try again or contact support.');
            setLoading(false);
          } else if (result.status === 'pending' || result.status === 'processing') {
            // Keep polling
            setLoading(true);
          } else {
            // Any other status -> stop loading but keep UI stable
            setLoading(false);
          }
        } else {
          setError(result.error || 'Unknown error');
          setLoading(false);
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('Error fetching quote results:', e);
        setError('Failed to retrieve quotes. Please try again.');
        setLoading(false);
      }
    };

    // Poll every second while processing/pending
    const interval = setInterval(() => {
      if (status === 'PROCESSING' || status === 'PENDING') {
        fetchResults();
      }
    }, 1000);

    // Initial fetch
    fetchResults();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [requestId, status]);

  // --- BOOKING: create booking from selected quote ---
  const handleBookShipment = async () => {
    if (selectedQuote === null) return;
    setBookingLoading(true);

    const selected = quotes[selectedQuote];

    try {
      // Pass the formData as shipmentData (as per your backend expectation)
      const bookingPayload = {
        quoteData: selected,
        requestId: requestId,
        shipmentData: {
          formData: formData,
          serviceType: serviceType
        }
      };

      const result = await bookingApi.createBooking(bookingPayload);

      if (result.success) {
        setBookingData(result.booking);
      } else {
        alert('Booking failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // --- BOOKING FLOW RENDERS (take precedence over normal states) ---
  if (bookingData && !showBOL) {
    return (
      <BookingConfirmation
        booking={bookingData}
        onCreateBOL={() => setShowBOL(true)}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (showBOL && bookingData) {
    return <BOLBuilder booking={bookingData} isDarkMode={isDarkMode} />;
  }

  // --- EXISTING LOADING / ERROR STATES ---
  if (loading && status === 'PROCESSING') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          <div className={`text-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div
              className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent' }}
            />
            <h2 className="text-2xl font-bold mb-2">Getting {String(serviceType || '').toUpperCase()} Quotes...</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Request #{requestNumber}</p>
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
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  const commodities = Array.isArray(formData.commodities) ? formData.commodities : [];
  const totalUnits = commodities.reduce((sum, c) => sum + parseInt(c.quantity || 0, 10), 0);
  const totalWeight = commodities.reduce((sum, c) => sum + parseInt(c.weight || 0, 10), 0);

  // --- MAIN RESULTS VIEW ---
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {String(serviceType || '').toUpperCase()} Quote Results
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Request #{requestNumber}</p>
            </div>
            <button
              onClick={onBack}
              className={`text-sm px-4 py-2 rounded ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New Quote
            </button>
          </div>
        </div>

        {/* Shipment Summary */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
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
                {totalUnits} units, {totalWeight} lbs
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
                ${
                  selectedQuote === index
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
                    {quote?.service_details?.carrier}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quote?.service_details?.service}
                  </p>
                </div>
                {selectedQuote === index && (
                  <Check className={`w-6 h-6 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${Number(quote.final_price || 0).toFixed(2)}
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Base: ${Number(quote.raw_cost || 0).toFixed(2)} | Fuel:{' '}
                  {
                    typeof quote.fuel_surcharge === 'number'
                      ? quote.fuel_surcharge.toFixed(2)
                      : (quote.fuel_surcharge || '0.00')
                  }{' '}
                  | +{quote.markup_percentage}%
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
                {quote?.service_details?.guaranteed && (
                  <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Guaranteed Service</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => {
              if (selectedQuote === null) return;
              const selected = quotes[selectedQuote];
              console.log('Saving quote:', {
                requestId,
                carrier: selected?.service_details?.carrier,
                price: selected?.final_price
              });
              alert('Quote saved!');
            }}
            className={`px-6 py-2 rounded font-medium ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Save Quote
          </button>

          <button
            onClick={handleBookShipment}
            disabled={selectedQuote === null || bookingLoading}
            className={`px-6 py-2 rounded font-medium ${
              selectedQuote === null || bookingLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDarkMode
                ? 'bg-conship-orange text-white hover:bg-orange-600'
                : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            {bookingLoading ? 'Booking...' : 'Book Shipment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroundQuoteResults;
