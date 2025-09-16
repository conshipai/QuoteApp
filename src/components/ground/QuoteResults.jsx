// src/components/ground/QuoteResults.jsx - Improved Version with Enhanced Logging
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Check, Clock, Truck, AlertCircle, Package, MapPin,
  FileText, Upload, Download, X, RefreshCw, AlertTriangle,
  DollarSign, ShieldCheck, Star, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import API_BASE from '../../config/api';
import quoteApi from '../../services/quoteApi';
import bookingApi from '../../services/bookingApi';
import BookingConfirmation from './BookingConfirmation';
import BOLBuilder from '../bol/BOLBuilder';
import { logQuoteFlow } from '../../utils/debugLogger';

// DocumentUpload component remains the same
const DocumentUpload = ({ requestId, isDarkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');
  const [collapsed, setCollapsed] = useState(true);

  const documentTypes = [
    { value: 'dangerous_goods_declaration', label: 'Dangerous Goods Declaration' },
    { value: 'sds_sheet', label: 'Safety Data Sheet (SDS)' },
    { value: 'battery_certification', label: 'Battery Certification' },
    { value: 'packing_list', label: 'Packing List' },
    { value: 'commercial_invoice', label: 'Commercial Invoice' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!docType) {
      alert('Please select a document type first');
      event.target.value = '';
      return;
    }

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      event.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);
      formData.append('documentType', docType);

      const response = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDocuments(prev => [...prev, {
          id: data.key || `doc_${Date.now()}`,
          name: file.name,
          type: docType,
          size: file.size,
          url: data.fileUrl,
          key: data.key,
          uploadedAt: new Date().toISOString()
        }]);
        
        alert('Document uploaded successfully!');
        setDocType('');
        event.target.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full p-4 flex items-center justify-between ${
          isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <FileText className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Documents ({documents.length})
          </h3>
        </div>
        {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      {!collapsed && (
        <div className="p-4 pt-0">
          <div className="mb-4 flex items-center gap-3">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select document type...</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <label className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-conship-orange text-white hover:bg-orange-600' 
                : 'bg-conship-purple text-white hover:bg-purple-700'
            } ${!docType || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={!docType || uploading}
              />
            </label>
          </div>

          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No documents uploaded yet
              </p>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {doc.name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main QuoteResults Component with Improved Layout and Enhanced Logging
const GroundQuoteResults = ({ 
  requestId: requestIdProp, 
  requestNumber: requestNumberProp, 
  serviceType: serviceTypeProp, 
  formData: formDataProp = {}, 
  onBack, 
  isDarkMode 
}) => {
  const navigate = useNavigate();
  const { requestId: requestIdParam } = useParams();
  const location = useLocation();
  
  const requestId = requestIdProp || requestIdParam || location.state?.requestId;
  const [requestNumber, setRequestNumber] = useState(requestNumberProp || location.state?.requestNumber || 'N/A');
  const [serviceType, setServiceType] = useState(serviceTypeProp || location.state?.serviceType || 'ltl');
  const [formData, setFormData] = useState(formDataProp || location.state?.formData || {});

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PROCESSING');
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price'); // price, transit, recommended
  
  // Booking flow state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [showBOL, setShowBOL] = useState(false);

  // Log component initialization
  useEffect(() => {
    logQuoteFlow('QUOTE_RESULTS_INIT', {
      requestId,
      requestNumber,
      serviceType,
      hasFormData: !!formData && Object.keys(formData).length > 0,
      source: requestIdProp ? 'prop' : requestIdParam ? 'param' : 'location.state'
    });
  }, [requestId]);

  // Log when quotes are displayed
  useEffect(() => {
    if (quotes.length > 0) {
      logQuoteFlow('QUOTE_DISPLAY', {
        requestId,
        requestNumber,
        quoteCount: quotes.length,
        quotes: quotes.map(q => ({
          quoteId: q.quoteId,
          carrier: q.service_details?.carrier,
          price: q.final_price,
          rawCost: q.raw_cost,
          markup: q.markup_percentage,
          transit: q.transit_days
        }))
      });
    }
  }, [quotes, requestId, requestNumber]);

  // Load data from localStorage if available
  useEffect(() => {
    if (requestId && (!formData || Object.keys(formData).length === 0)) {
      const completeData = localStorage.getItem(`quote_complete_${requestId}`);
      if (completeData) {
        try {
          const parsed = JSON.parse(completeData);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.serviceType) setServiceType(parsed.serviceType);
          if (parsed.requestNumber) setRequestNumber(parsed.requestNumber);
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }
    }
  }, [requestId]);

  // Check if already booked
  useEffect(() => {
    if (!requestId) return;
    
    const checkBookingStatus = async () => {
      try {
        const resp = await fetch(`${API_BASE}/bookings/by-request/${requestId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.booking?.bookingId) {
            navigate(`/app/quotes/bookings/${data.booking.bookingId}`);
          }
        }
      } catch (err) {
        console.error('Error checking booking status:', err);
      }
    };
    
    checkBookingStatus();
  }, [requestId, navigate]);

  // Poll for quotes with enhanced logging
  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided. Please go back and create a new quote.');
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    const fetchResults = async () => {
      try {
        logQuoteFlow('QUOTE_FETCH_ATTEMPT', {
          requestId,
          currentStatus: status
        });

        const result = await quoteApi.getGroundQuoteResults(requestId);
        
        if (!isMounted) return;

        if (result.success) {
          // Log status change
          if (result.status && result.status !== status) {
            logQuoteFlow('QUOTE_STATUS_CHANGE', {
              requestId,
              oldStatus: status,
              newStatus: result.status,
              quoteCount: result.quotes?.length || 0
            });
          }

          if (result.requestNumber) setRequestNumber(result.requestNumber);
          if (result.serviceType) setServiceType(result.serviceType);
          if (result.formData) setFormData(result.formData);

          const backendStatus = (result.status || 'processing').toUpperCase();
          setStatus(backendStatus);

          if (result.status === 'quote_ready' && Array.isArray(result.quotes)) {
            const mappedQuotes = result.quotes.map((q, index) => ({
              quoteId: q.quoteId,
              service_details: {
                carrier: q.carrier,
                service: q.service,
                guaranteed: q.guaranteed
              },
              raw_cost: q.rawCost ?? q.price ?? 0,
              final_price: q.price ?? 0,
              markup_percentage: q.markup ?? 0,
              transit_days: q.transitDays ?? q.transit_days ?? 0,
              additional_fees: q.additionalFees || [],
              fuel_surcharge: 0,
              // Add mock ranking for demo
              ranking: index === 0 ? 'recommended' : index === 1 ? 'fastest' : index === 2 ? 'cheapest' : null
            }));

            setQuotes(mappedQuotes);
            setLoading(false);
          } else if (result.status === 'quote_expired') {
            setError(result.error || 'Unable to retrieve quotes.');
            setLoading(false);
          }
        } else {
          setError(result.error || 'Unknown error occurred');
          setLoading(false);
        }
      } catch (e) {
        logQuoteFlow('QUOTE_FETCH_ERROR', {
          requestId,
          error: e.message
        });
        if (!isMounted) return;
        setError('Failed to retrieve quotes. Please try again.');
        setLoading(false);
      }
    };

    const interval = setInterval(() => {
      if (status === 'PROCESSING' || status === 'PENDING') {
        fetchResults();
      }
    }, 1000);

    fetchResults();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [requestId, status]);

  // Handle quote selection with logging
  const handleQuoteSelection = (index) => {
    setSelectedQuote(index);
    const selected = quotes[index];
    logQuoteFlow('QUOTE_SELECTED', {
      requestId,
      selectedIndex: index,
      quoteId: selected?.quoteId,
      carrier: selected?.service_details?.carrier,
      price: selected?.final_price
    });
  };

  // Sort quotes
  const sortedQuotes = [...quotes].sort((a, b) => {
    switch(sortBy) {
      case 'price':
        return a.final_price - b.final_price;
      case 'transit':
        return a.transit_days - b.transit_days;
      case 'recommended':
        if (a.ranking === 'recommended') return -1;
        if (b.ranking === 'recommended') return 1;
        return 0;
      default:
        return 0;
    }
  });

  // Handle booking with enhanced logging
  const handleBookShipment = async () => {
    if (selectedQuote === null) return;
    
    const selected = quotes[selectedQuote];
    
    logQuoteFlow('BOOKING_START', {
      requestId,
      requestNumber,
      selectedQuote: {
        quoteId: selected.quoteId,
        carrier: selected.service_details?.carrier,
        price: selected.final_price
      }
    });
    
    setBookingLoading(true);

    try {
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
        logQuoteFlow('BOOKING_SUCCESS', {
          requestId,
          bookingId: result.booking?.bookingId,
          confirmationNumber: result.booking?.confirmationNumber
        });
        setBookingData(result.booking);
      } else {
        logQuoteFlow('BOOKING_FAILED', {
          requestId,
          error: result.error
        });
        alert('Booking failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      logQuoteFlow('BOOKING_ERROR', {
        requestId,
        error: err.message
      });
      console.error('Booking error:', err);
      alert('Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/app/quotes/ground/${serviceType || 'ltl'}`);
    }
  };

  // Handle different states
  if (bookingData && !showBOL) {
    return <BookingConfirmation booking={bookingData} onCreateBOL={() => setShowBOL(true)} isDarkMode={isDarkMode} />;
  }

  if (showBOL && bookingData) {
    return <BOLBuilder booking={bookingData} isDarkMode={isDarkMode} />;
  }

  if (loading && status === 'PROCESSING') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          <div className={`text-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div
              className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent' }}
            />
            <h2 className="text-2xl font-bold mb-2">Getting {serviceType.toUpperCase()} Quotes...</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Request #{requestNumber}</p>
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
              onClick={handleBack}
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
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
              onClick={handleBack}
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
                  {formData.originCity || 'N/A'}, {formData.originState || ''} {formData.originZip || ''}
                </span>
              </div>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.destCity || 'N/A'}, {formData.destState || ''} {formData.destZip || ''}
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

        {/* Documents Section */}
        <div className="mb-6">
          <DocumentUpload requestId={requestId} isDarkMode={isDarkMode} />
        </div>

        {/* Sorting Options */}
        {quotes.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Available Quotes ({quotes.length})
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-1 text-sm rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="recommended">Recommended</option>
                <option value="price">Lowest Price</option>
                <option value="transit">Fastest Transit</option>
              </select>
            </div>
          </div>
        )}

        {/* Quotes List - Vertical Layout */}
        {quotes.length === 0 && !loading ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="mb-4">No quotes available yet. Please check back in a moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedQuotes.map((quote, index) => {
              const originalIndex = quotes.indexOf(quote);
              const isSelected = selectedQuote === originalIndex;
              
              return (
                <div
                  key={quote.quoteId || index}
                  onClick={() => handleQuoteSelection(originalIndex)}
                  className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    isSelected
                      ? isDarkMode 
                        ? 'bg-gray-800 border-conship-orange shadow-lg' 
                        : 'bg-purple-50 border-conship-purple shadow-lg'
                      : isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Carrier Info */}
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Truck className={`w-6 h-6 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quote?.service_details?.carrier || 'Carrier'}
                          </h3>
                          {quote.ranking === 'recommended' && (
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                          {quote.ranking === 'fastest' && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Fastest
                            </span>
                          )}
                          {quote.ranking === 'cheapest' && (
                            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              Best Price
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {quote?.service_details?.service || 'Service'}
                          {quote?.service_details?.guaranteed && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 inline-flex">
                              <ShieldCheck className="w-3 h-3" />
                              Guaranteed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Center: Service Details */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Transit Time
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quote?.transit_days ?? 0} days
                          </span>
                        </div>
                      </div>
                      
                      {Array.isArray(quote?.additional_fees) && quote.additional_fees.length > 0 && (
                        <div className="text-center">
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Additional Fees
                          </div>
                          <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {quote.additional_fees.length} fees
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Price */}
                    <div className="text-right">
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Total Price
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${
                        isSelected 
                          ? isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${Number(quote?.final_price ?? 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Check className={`w-5 h-5 ${
                          isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                        }`}>
                          Selected
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {quotes.length > 0 && (
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => {
                if (selectedQuote === null) return;
                const selected = quotes[selectedQuote];
                console.log('Saving quote:', selected);
                alert('Quote saved!');
              }}
              disabled={selectedQuote === null}
              className={`px-6 py-2 rounded font-medium ${
                selectedQuote === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Save Quote
            </button>

            <button
              onClick={handleBookShipment}
              disabled={selectedQuote === null || bookingLoading}
              className={`px-6 py-2 rounded font-medium ${
                (selectedQuote === null || bookingLoading)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : (isDarkMode
                    ? 'bg-conship-orange text-white hover:bg-orange-600'
                    : 'bg-conship-purple text-white hover:bg-purple-700')
              }`}
            >
              {bookingLoading ? 'Booking...' : 'Book Shipment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundQuoteResults;
