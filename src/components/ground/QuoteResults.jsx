// src/components/ground/GroundQuoteResults.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ADDED
import {
  Check, Clock, Truck, AlertCircle, Package, MapPin,
  FileText, Upload, Download, X
} from 'lucide-react';
import API_BASE from '../../config/api'; // ADDED
import quoteApi from '../../services/quoteApi';
import bookingApi from '../../services/bookingApi';  // EXISTING
import BookingConfirmation from './BookingConfirmation';  // EXISTING
import BOLBuilder from '../bol/BOLBuilder';  // EXISTING
// REMOVED: import QuoteDocumentUpload from '../shared/QuoteDocumentUpload';

// ─────────────────────────────────────────────────────────────
// Local IndexedDB-backed DocumentUpload component
// ─────────────────────────────────────────────────────────────
const DocumentUpload = ({ bookingId, isDarkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');

  const documentTypes = [
    'Bill of Lading',
    'Commercial Invoice',
    'Packing List',
    'Safety Data Sheet (SDS)',
    'Certificate of Origin',
    'Insurance Certificate',
    'Other'
  ];

  // Initialize IndexedDB
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookingDocuments', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' });
          store.createIndex('bookingId', 'bookingId', { unique: false });
        }
      };
    });
  };

  // Load documents from IndexedDB
  const loadDocuments = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const index = store.index('bookingId');

      const request = index.getAll(bookingId);

      request.onsuccess = () => {
        const docs = request.result || [];
        // Only load metadata, not the actual file data
        const docsMetadata = docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadedAt: doc.uploadedAt
        }));
        setDocuments(docsMetadata);
      };
    } catch (error) {
      console.log('Could not load documents from IndexedDB:', error);
      // Silently fail - documents feature will still work for new uploads
    }
  };

  useEffect(() => {
    if (bookingId) loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !docType) {
      alert('Please choose a document type first.');
      return;
    }

    // Allow up to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();

      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingId: bookingId,
        name: file.name,
        type: docType,
        size: file.size,
        mimeType: file.type,
        data: arrayBuffer,
        uploadedAt: new Date().toISOString()
      };

      // Save to IndexedDB
      const db = await initDB();
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      await store.add(newDoc);

      // Update UI
      setDocuments(prev => [
        ...prev,
        {
          id: newDoc.id,
          name: newDoc.name,
          type: newDoc.type,
          size: newDoc.size,
          uploadedAt: newDoc.uploadedAt
        }
      ]);

      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      event.target.value = '';
      setDocType('');
    }
  };

  const handleDownload = async (docId) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.get(docId);

      request.onsuccess = () => {
        const doc = request.result;
        if (doc && doc.data) {
          const blob = new Blob([doc.data], { type: doc.mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = doc.name;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      };
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      const db = await initDB();
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      await store.delete(docId);

      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Documents</h3>

      <div className="mb-4 flex items-center gap-3">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className={`px-3 py-2 rounded border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select document type...</option>
          {documentTypes.map(type => (<option key={type} value={type}>{type}</option>))}
        </select>

        <label className={`${isDarkMode ? 'bg-conship-orange hover:bg-orange-600' : 'bg-conship-purple hover:bg-purple-700'} text-white px-4 py-2 rounded inline-flex items-center gap-2 cursor-pointer`}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={handleFileUpload}
            disabled={uploading || !docType}
          />
        </label>
      </div>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No documents uploaded yet</p>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.type} • {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-500"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GroundQuoteResults = ({ requestId: requestIdProp, requestNumber, serviceType, formData = {}, onBack, isDarkMode }) => {
  const navigate = useNavigate(); // ADDED
  const { requestId: requestIdParam } = useParams(); // ADDED
  const requestId = requestIdProp || requestIdParam; // ADDED - prefer prop, fallback to route param

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PROCESSING');
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
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

  // ─────────────────────────────────────────────────────────────
  // NEW: After quotes loaded / status settled, check booking and redirect
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!requestId) return;

    // Only check once the request is not in a polling state
    const isSettled = status !== 'PROCESSING' && status !== 'PENDING';
    if (!isSettled) return;

    const checkBookingStatus = async () => {
      try {
        const bookingResponse = await fetch(`${API_BASE}/bookings/by-request/${requestId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          if (bookingData.success && bookingData.booking && bookingData.booking.bookingId) {
            navigate(`/app/quotes/bookings/${bookingData.booking.bookingId}`);
          }
        }
      } catch (error) {
        console.error('Error checking booking status:', error);
      }
    };

    checkBookingStatus();
  }, [requestId, status, navigate]);

  // --- BOOKING: create booking from selected quote ---
  const handleBookShipment = async () => {
    if (selectedQuote === null) return;
    setBookingLoading(true);

    const selected = quotes[selectedQuote];

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

  // MAIN RESULTS VIEW
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
            <div className="flex gap-3">
              {/* DOCUMENTS TOGGLE BUTTON */}
              <button
                onClick={() => setShowDocuments(!showDocuments)}
                className={`text-sm px-4 py-2 rounded flex items-center gap-2 ${
                  showDocuments
                    ? isDarkMode
                      ? 'bg-conship-orange text-white'
                      : 'bg-conship-purple text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                {showDocuments ? 'Hide Documents' : 'Manage Documents'}
              </button>

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

        {/* DOCUMENTS SECTION - Collapsible */}
        {showDocuments && (
          <div className="mb-6">
            {/* Using requestId for now; once a booking is created you can migrate these to the real bookingId if desired */}
            <DocumentUpload bookingId={requestId} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Quote Cards - Keep your existing card rendering here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotes.map((quote, index) => (
            // ... your existing quote card content and handlers ...
            <div
              key={quote.quoteId || index}
              className={`rounded-lg p-4 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
                  <div>
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {quote?.service_details?.carrier || 'Carrier'}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {quote?.service_details?.service || 'Service'} {quote?.service_details?.guaranteed ? '• Guaranteed' : ''}
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${Number(quote?.final_price ?? 0).toFixed(2)}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{quote?.transit_days ?? 0} days</span>
                </div>
                {Array.isArray(quote?.additional_fees) && quote.additional_fees.length > 0 && (
                  <div className="text-xs opacity-75">
                    + {quote.additional_fees.length} fees
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="selectedQuote"
                    checked={selectedQuote === index}
                    onChange={() => setSelectedQuote(index)}
                  />
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>Select this quote</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Document indicator */}
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {showDocuments && (
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents will be included with booking
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundQuoteResults;
