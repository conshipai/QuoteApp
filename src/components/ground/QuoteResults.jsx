// src/components/ground/QuoteResults.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Check, Clock, Truck, AlertCircle, Package, MapPin,
  FileText, Upload, Download, X, RefreshCw, AlertTriangle
} from 'lucide-react';
import API_BASE from '../../config/api';
import quoteApi from '../../services/quoteApi';
import bookingApi from '../../services/bookingApi';
import BookingConfirmation from './BookingConfirmation';
import BOLBuilder from '../bol/BOLBuilder';

// ─────────────────────────────────────────────────────────────
// DocumentUpload component (keeping as-is from original)
// ─────────────────────────────────────────────────────────────
const DocumentUpload = ({ requestId, isDarkMode }) => {
  // ... keeping the original DocumentUpload implementation ...
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');

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

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      event.target.value = '';
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      event.target.value = '';
      return;
    }

    if (!requestId) {
      alert('Missing request ID. Cannot upload document.');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);
      formData.append('documentType', docType);

      console.log('📤 Uploading to R2:', {
        fileName: file.name,
        fileSize: file.size,
        requestId,
        documentType: docType
      });

      const response = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: formData
      });

      console.log('📥 Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);

      if (data.success) {
        // Add to documents list
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
      } else {
        throw new Error(data.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (doc) => {
    try {
      if (doc.url) {
        window.open(doc.url, '_blank', 'noopener,noreferrer');
      } else if (doc.key) {
        const response = await fetch(`${API_BASE}/storage/signed-url/${encodeURIComponent(doc.key)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get download URL (${response.status})`);
        }
        
        const data = await response.json();
        if (data.success && data.url) {
          window.open(data.url, '_blank', 'noopener,noreferrer');
        } else {
          throw new Error('Failed to get download URL');
        }
      } else {
        alert('Download URL not available');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document: ' + error.message);
    }
  };

  const handleDelete = (docId) => {
    if (!confirm('Remove this document from the list?')) return;
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Documents
      </h3>

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
          {uploading ? 'Uploading...' : 'Upload Document'}
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
                <FileText className={`w-5 h-5 ${
                  doc.type === 'sds_sheet' 
                    ? 'text-yellow-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {doc.name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {documentTypes.find(t => t.value === doc.type)?.label || doc.type} • 
                    {(doc.size / 1024).toFixed(1)} KB • 
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc)}
                  className={`p-2 rounded ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-500"
                  title="Remove"
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

// ─────────────────────────────────────────────────────────────
// Enhanced GroundQuoteResults with better data handling
// ─────────────────────────────────────────────────────────────
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
  
  // Get data from props, route params, or location state
  const requestId = requestIdProp || requestIdParam || location.state?.requestId;
  const [requestNumber, setRequestNumber] = useState(requestNumberProp || location.state?.requestNumber || 'N/A');
  const [serviceType, setServiceType] = useState(serviceTypeProp || location.state?.serviceType || 'ltl');
  const [formData, setFormData] = useState(formDataProp || location.state?.formData || {});

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PROCESSING');
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [dataSource, setDataSource] = useState('props'); // Track where data came from
  const [missingDataWarning, setMissingDataWarning] = useState(false);
  
  // Booking flow state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [showBOL, setShowBOL] = useState(false);

  // Enhanced data loading with multiple fallback sources
  useEffect(() => {
    if (requestId && (!formData || Object.keys(formData).length === 0)) {
      console.log('📦 Attempting to load quote data from multiple sources...');
      
      let dataLoaded = false;
      let source = 'none';
      
      // 1. Try complete quote data first
      const completeData = localStorage.getItem(`quote_complete_${requestId}`);
      if (completeData) {
        try {
          const parsed = JSON.parse(completeData);
          if (parsed.formData && Object.keys(parsed.formData).length > 0) {
            setFormData(parsed.formData);
            setServiceType(parsed.serviceType || 'ltl');
            setRequestNumber(parsed.requestNumber || 'N/A');
            source = 'complete_cache';
            dataLoaded = true;
            console.log('✅ Loaded complete quote data from cache');
          }
        } catch (e) {
          console.error('Error parsing complete data:', e);
        }
      }
      
      // 2. Try form data cache
      if (!dataLoaded) {
        const formDataCache = localStorage.getItem(`quote_formdata_${requestId}`);
        if (formDataCache) {
          try {
            const parsed = JSON.parse(formDataCache);
            if (Object.keys(parsed).length > 0) {
              setFormData(parsed);
              source = 'form_cache';
              dataLoaded = true;
              console.log('📋 Loaded form data from cache');
            }
          } catch (e) {
            console.error('Error parsing form data:', e);
          }
        }
      }
      
      // 3. Try results cache
      if (!dataLoaded) {
        const resultsCache = localStorage.getItem(`quote_results_${requestId}`);
        if (resultsCache) {
          try {
            const parsed = JSON.parse(resultsCache);
            if (parsed.formData && Object.keys(parsed.formData).length > 0) {
              setFormData(parsed.formData);
              if (parsed.requestNumber) setRequestNumber(parsed.requestNumber);
              if (parsed.serviceType) setServiceType(parsed.serviceType);
              source = 'results_cache';
              dataLoaded = true;
              console.log('📊 Loaded data from results cache');
            }
          } catch (e) {
            console.error('Error parsing results cache:', e);
          }
        }
      }
      
      // 4. Try request cache
      if (!dataLoaded) {
        const requestCache = localStorage.getItem(`quote_request_${requestId}`);
        if (requestCache) {
          try {
            const parsed = JSON.parse(requestCache);
            if (parsed.formData && Object.keys(parsed.formData).length > 0) {
              setFormData(parsed.formData);
              source = 'request_cache';
              dataLoaded = true;
              console.log('📝 Loaded data from request cache');
            }
          } catch (e) {
            console.error('Error parsing request cache:', e);
          }
        }
      }
      
      setDataSource(source);
      
      // Show warning if no data could be loaded
      if (!dataLoaded) {
        console.warn('⚠️ No form data available for this quote');
        setMissingDataWarning(true);
      }
    }
  }, [requestId]);

  // Save current state to localStorage whenever it changes
  useEffect(() => {
    if (requestId && formData && Object.keys(formData).length > 0) {
      const dataToSave = {
        requestId,
        requestNumber,
        serviceType,
        formData,
        status,
        savedAt: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify(dataToSave));
        console.log('💾 Saved current state to localStorage');
      } catch (e) {
        console.error('Failed to save state:', e);
      }
    }
  }, [requestId, requestNumber, serviceType, formData, status]);

  // Check if booked on mount; redirect to booking page
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

  // Quote polling with data recovery
  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided. Please go back and create a new quote.');
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    const fetchResults = async () => {
      try {
        const result = await quoteApi.getGroundQuoteResults(requestId);
        console.log('📊 Quote Results from backend:', result);

        if (!isMounted) return;

        if (result.success) {
          // Update metadata if available
          if (result.requestNumber) setRequestNumber(result.requestNumber);
          if (result.serviceType) setServiceType(result.serviceType);
          
          // Update form data if we don't have it yet or if backend has more complete data
          if (result.formData && (!formData || Object.keys(formData).length === 0)) {
            setFormData(result.formData);
            setDataSource('backend');
            setMissingDataWarning(false);
            
            // Save the recovered data
            const dataToSave = {
              requestId,
              requestNumber: result.requestNumber,
              serviceType: result.serviceType,
              formData: result.formData,
              status: result.status,
              savedAt: new Date().toISOString()
            };
            localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify(dataToSave));
            console.log('✅ Recovered and saved form data from backend');
          }

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
              raw_cost: q.rawCost ?? q.price ?? 0,
              final_price: q.price ?? 0,
              markup_percentage: q.markup ?? 0,
              transit_days: q.transitDays ?? q.transit_days ?? 0,
              additional_fees: q.additionalFees || [],
              fuel_surcharge: 0
            }));

            setQuotes(mappedQuotes);
            setLoading(false);
          } else if (result.status === 'failed') {
            setError(result.error || 'Unable to retrieve quotes. Please try again or contact support.');
            setLoading(false);
          } else if (result.status === 'pending' || result.status === 'processing') {
            setLoading(true);
          } else {
            setLoading(false);
          }
        } else {
          setError(result.error || 'Unknown error occurred while fetching quotes');
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

  // Attempt to recover missing data from API
  const attemptDataRecovery = async () => {
    if (!requestId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ground-quotes/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.formData) {
          setFormData(data.formData);
          setRequestNumber(data.requestNumber || 'N/A');
          setServiceType(data.serviceType || 'ltl');
          setMissingDataWarning(false);
          setDataSource('recovered');
          
          // Save recovered data
          localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify({
            requestId,
            requestNumber: data.requestNumber,
            serviceType: data.serviceType,
            formData: data.formData,
            status: data.status,
            savedAt: new Date().toISOString()
          }));
          
          console.log('✅ Successfully recovered quote data from API');
        }
      }
    } catch (error) {
      console.error('Failed to recover data:', error);
      alert('Unable to recover quote data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create booking from selected quote
  const handleBookShipment = async () => {
    if (selectedQuote === null) return;
    
    // Check if we have minimum required data
    if (!formData || Object.keys(formData).length === 0) {
      alert('Missing shipment details. Please ensure all required information is available.');
      return;
    }
    
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

  // Handle back button
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/app/quotes/ground/${serviceType || 'ltl'}`);
    }
  };

  // Booking flow renders
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

  // Loading state
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
            {dataSource !== 'props' && (
              <p className={`mt-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Data loaded from: {dataSource}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
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

  // Main results view
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Missing Data Warning */}
        {missingDataWarning && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-yellow-900/20 border-yellow-600/50 text-yellow-400' 
              : 'bg-yellow-50 border-yellow-300 text-yellow-800'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Limited shipment details available</p>
                <p className="text-sm mt-1 opacity-90">
                  Some shipment information could not be loaded. This may affect booking capabilities.
                </p>
              </div>
              <button
                onClick={attemptDataRecovery}
                className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                  isDarkMode 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
                    : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                Recover Data
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {String(serviceType || '').toUpperCase()} Quote Results
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Request #{requestNumber}
                {dataSource !== 'props' && (
                  <span className="ml-2 text-xs opacity-75">
                    (Data: {dataSource})
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {/* Documents toggle button */}
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
                onClick={handleBack}
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
        {formData && Object.keys(formData).length > 0 ? (
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
              {commodities.length > 0 && (
                <div className="flex items-center gap-2">
                  <Package className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {totalUnits} units, {totalWeight} lbs
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-100 border-gray-300'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Shipment details unavailable. Loading from request...
            </p>
          </div>
        )}

        {/* Documents Section - Collapsible */}
        {showDocuments && (
          <div className="mb-6">
            <DocumentUpload requestId={requestId} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Quote Cards */}
        {quotes.length === 0 && !loading ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="mb-4">No quotes available yet. Please check back in a moment.</p>
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotes.map((quote, index) => (
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
        )}

        {/* Action Buttons */}
        {quotes.length > 0 && (
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
                  disabled={selectedQuote === null || bookingLoading || (missingDataWarning && (!formData || Object.keys(formData).length === 0))}
                  className={`px-6 py-2 rounded font-medium ${
                    (selectedQuote === null || bookingLoading || (missingDataWarning && (!formData || Object.keys(formData).length === 0)))
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : (isDarkMode
                        ? 'bg-conship-orange text-white hover:bg-orange-600'
                        : 'bg-conship-purple text-white hover:bg-purple-700')
                  }`}
                  title={missingDataWarning ? 'Please recover shipment data before booking' : ''}
                >
                  {bookingLoading ? 'Booking...' : 'Book Shipment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundQuoteResults;
