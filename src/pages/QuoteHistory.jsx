// src/pages/QuoteHistory.jsx - ACTUAL FIX keeping original working logic
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Truck, MapPin, ChevronRight, Anchor, Plane, 
  ArrowUp, ArrowDown, CheckCircle, Search,
  Calendar, FileText, AlertCircle, RefreshCw,
  Plus, Save
} from 'lucide-react';
import bookingApi from '../services/bookingApi';
import { ShipmentLifecycle } from '../constants/shipmentLifecycle';

const QuoteHistory = ({ isDarkMode = false, userRole = 'user' }) => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [notification, setNotification] = useState(null);
  const [manualBookingModal, setManualBookingModal] = useState(null);

  useEffect(() => {
    loadAllQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, filterStatus, filterMode, dateRange]);

  // KEEP YOUR EXACT WORKING LOADING LOGIC
  const loadAllQuotes = async () => {
    try {
      setLoading(true);
      
      // Use the WORKING endpoint and data shape
      const response = await fetch('https://api.gcc.conship.ai/api/quotes/recent?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        // Use data.quotes NOT data.requests
        if (data.success && data.quotes) {
          const quotesData = data.quotes.map(quote => ({
            ...quote,
            requestId: quote._id,
            requestNumber: quote.requestNumber,
            mode: quote.mode || 'ground',
            status: quote.status || ShipmentLifecycle.QUOTE_READY,
            createdAt: quote.createdAt,
            isBooked: quote.isBooked || false,
            bookingId: quote.bookingId,
            
            // Add serviceType for ground quotes (for manual booking eligibility)
            serviceType: quote.serviceType || (quote.mode === 'ground' ? 'ltl' : quote.mode),
            
            // Handle both ground and air quote formats
            origin: quote.origin || {
              city: quote.originCity,
              state: quote.originState,
              zipCode: quote.originZip
            },
            destination: quote.destination || {
              city: quote.destinationCity || quote.destCity,
              state: quote.destinationState || quote.destState,
              zipCode: quote.destinationZip || quote.destZip
            },
            
            // Include formData if available
            formData: quote.formData || {},
            
            weight: quote.weight || 0,
            pieces: quote.pieces || 0,
            bestPrice: quote.bestPrice,
            carrierCount: quote.carrierCount
          }));
          
          // Sort by date (newest first)
          quotesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // Save complete data for each quote
          quotesData.forEach(quote => {
            const requestId = quote.requestId;
            const completeData = {
              requestId,
              requestNumber: quote.requestNumber,
              mode: quote.mode,
              serviceType: quote.serviceType || 'ltl',
              formData: quote.formData || {},
              status: quote.status,
              createdAt: quote.createdAt
            };
            localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify(completeData));
          });
          
          setQuotes(quotesData);
          console.log(`Loaded ${quotesData.length} quotes`);
        } else {
          console.log('No quotes found in response');
          setQuotes([]);
        }
      } else {
        console.error('Failed to fetch quotes:', response.status);
        showNotification('Failed to load quotes', 'error');
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
      showNotification('Failed to load quotes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = [...quotes];

    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.origin?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.formData?.originCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.formData?.destCity?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'booked') {
        filtered = filtered.filter(quote => quote.isBooked);
      } else {
        filtered = filtered.filter(quote => !quote.isBooked && quote.status === filterStatus);
      }
    }

    if (filterMode !== 'all') {
      filtered = filtered.filter(quote => quote.mode === filterMode);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch(dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(quote => new Date(quote.createdAt) >= startDate);
    }

    setFilteredQuotes(filtered);
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

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuoteClick = (quote) => {
    const requestId = quote.requestId || quote._id;
    
    if (quote.isBooked) {
      navigate(`/app/quotes/bookings/${quote.bookingId}`);
      return;
    }

    if (quote.mode === 'ground') {
      navigate(`/app/quotes/ground/results/${requestId}`, {
        state: {
          requestId: requestId,
          requestNumber: quote.requestNumber,
          serviceType: quote.serviceType || 'ltl',
          formData: quote.formData || {},
          status: quote.status
        }
      });
    } else {
      navigate(`/app/quotes/${quote.mode}/results/${requestId}`, {
        state: {
          requestId: requestId,
          requestNumber: quote.requestNumber,
          mode: quote.mode,
          direction: quote.direction,
          formData: quote.formData || {},
          status: quote.status
        }
      });
    }
  };

  const refreshQuotes = () => {
    showNotification('Refreshing quotes...', 'info');
    loadAllQuotes();
  };

  // NEW: Check if quote is eligible for manual booking
  const canManualBook = (quote) => {
    return (quote.serviceType === 'ftl' || quote.serviceType === 'expedited') && 
           !quote.isBooked &&
          (quote.status === ShipmentLifecycle.QUOTE_PROCESSING || quote.status === 'pending_carrier_response');

  // 1) ENHANCED ManualBookingModal Component with all fields
  const ManualBookingModal = ({ quote, onClose, onConfirm }) => {
    // Pre-populate with existing quote data
    const [bookingData, setBookingData] = useState({
      carrier: '',
      price: '',
      transitDays: '',
      pickupNumber: '',
      confirmationNumber: `MANUAL-${Date.now()}`,
      notes: '',
      // Add weight and pieces fields
      weight: quote.formData?.weight || quote.weight || '',
      pieces: quote.formData?.pieces || quote.pieces || ''
    });

    const handleSubmit = () => {
      if (!bookingData.carrier || !bookingData.price) {
        alert('Carrier name and price are required');
        return;
      }
      if (!bookingData.weight || !bookingData.pieces) {
        alert('Weight and pieces are required for BOL creation');
        return;
      }
      onConfirm(bookingData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`max-w-lg w-full rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-6 max-h-[90vh] overflow-y-auto`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manual Booking - {quote.requestNumber}
          </h2>

          <div className={`mb-4 p-3 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div>Route: {quote.formData?.originCity || quote.origin?.city} → {quote.formData?.destCity || quote.destination?.city}</div>
            <div>Service: {quote.serviceType?.toUpperCase()}</div>
            <div>Pickup: {quote.formData?.pickupDate ? new Date(quote.formData.pickupDate).toLocaleDateString() : 'TBD'}</div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Carrier Name *
              </label>
              <input
                type="text"
                value={bookingData.carrier}
                onChange={(e) => setBookingData({...bookingData, carrier: e.target.value})}
                placeholder="Enter carrier name"
                className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bookingData.price}
                  onChange={(e) => setBookingData({...bookingData, price: e.target.value})}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Transit Days
                </label>
                <input
                  type="number"
                  value={bookingData.transitDays}
                  onChange={(e) => setBookingData({...bookingData, transitDays: e.target.value})}
                  placeholder="e.g., 2"
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            {/* NEW: Weight and Pieces fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  value={bookingData.weight}
                  onChange={(e) => setBookingData({...bookingData, weight: e.target.value})}
                  placeholder="Enter weight"
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pieces/Pallets *
                </label>
                <input
                  type="number"
                  value={bookingData.pieces}
                  onChange={(e) => setBookingData({...bookingData, pieces: e.target.value})}
                  placeholder="Number of pieces"
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Pickup/PRO Number
              </label>
              <input
                type="text"
                value={bookingData.pickupNumber}
                onChange={(e) => setBookingData({...bookingData, pickupNumber: e.target.value})}
                placeholder="Optional"
                className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                rows="2"
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                placeholder="Any notes about this booking..."
                className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500'
              }`}
            >
              <Save className="inline w-4 h-4 mr-2" />
              Create Booking
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2) UPDATED handleManualBooking function with complete data transfer
  const handleManualBooking = async (quote, bookingData) => {
    try {
      // Extract all necessary data
      const originZip = quote.formData?.originZip || quote.origin?.zipCode || '';
      const destZip = quote.formData?.destZip || quote.destination?.zipCode || '';
      
      const payload = {
        requestId: quote.requestId,
        requestNumber: quote.requestNumber,
        mode: 'ground',
        serviceType: quote.serviceType || 'ftl',
        
        // Complete quote data with all fields
        quoteData: {
          carrier: bookingData.carrier,
          carrierName: bookingData.carrier, // Duplicate for compatibility
          price: parseFloat(bookingData.price),
          rate: parseFloat(bookingData.price), // Duplicate as 'rate' for compatibility
          transitDays: parseInt(bookingData.transitDays) || 0,
          pickupNumber: bookingData.pickupNumber || '',
          proNumber: bookingData.pickupNumber || '', // Duplicate as PRO number
          confirmationNumber: bookingData.confirmationNumber,
          isManualBooking: true,
          notes: bookingData.notes,
          // Critical shipment details
          weight: parseFloat(bookingData.weight),
          pieces: parseInt(bookingData.pieces),
          originZip: originZip,
          destinationZip: destZip
        },
        
        // Complete shipment data
        shipmentData: {
          // All form data
          formData: {
            ...quote.formData,
            // Ensure all fields are present
            originCity: quote.formData?.originCity || quote.origin?.city || '',
            originState: quote.formData?.originState || quote.origin?.state || '',
            originZip: originZip,
            originZipCode: originZip, // Duplicate for compatibility
            destCity: quote.formData?.destCity || quote.destination?.city || '',
            destState: quote.formData?.destState || quote.destination?.state || '',
            destZip: destZip,
            destinationZipCode: destZip, // Duplicate for compatibility
            weight: parseFloat(bookingData.weight),
            totalWeight: parseFloat(bookingData.weight), // Duplicate for compatibility
            pieces: parseInt(bookingData.pieces),
            pallets: parseInt(bookingData.pieces), // Assuming pieces are pallets for FTL
            pickupDate: quote.formData?.pickupDate || new Date().toISOString(),
            deliveryDate: quote.formData?.deliveryDate,
            // Include carrier in formData too
            selectedCarrier: bookingData.carrier,
            selectedRate: parseFloat(bookingData.price)
          },
          serviceType: quote.serviceType || 'ftl',
          // Carrier information
          carrierInfo: {
            name: bookingData.carrier,
            carrierName: bookingData.carrier,
            rate: parseFloat(bookingData.price),
            transitDays: parseInt(bookingData.transitDays) || 0,
            proNumber: bookingData.pickupNumber || ''
          }
        }
      };

      console.log('Manual booking payload:', JSON.stringify(payload, null, 2));

      const result = await bookingApi.createBooking(payload);
      
      if (result.success) {
        showNotification('Booking created successfully!', 'success');
        setManualBookingModal(null);

        // Store the booking data for BOL creation
        if (result.booking?.bookingId) {
          const bookingDataForBOL = {
            bookingId: result.booking.bookingId,
            carrier: bookingData.carrier,
            rate: parseFloat(bookingData.price),
            weight: parseFloat(bookingData.weight),
            pieces: parseInt(bookingData.pieces),
            originZip: originZip,
            destinationZip: destZip,
            ...payload.shipmentData.formData
          };
          localStorage.setItem(`booking_${result.booking.bookingId}`, JSON.stringify(bookingDataForBOL));
          
          // Navigate to booking confirmation
          navigate(`/app/quotes/bookings/${result.booking.bookingId}`);
        }

        loadAllQuotes(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Manual booking error:', error);
      showNotification('Failed to create booking: ' + error.message, 'error');
    }
  };

  // Keep all your existing render code exactly the same, just add the manual booking button
  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="space-y-3">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white'
            : notification.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <AlertCircle className="w-5 h-5" />
          {notification.message}
        </div>
      )}
      
      <div className="p-6">
        {/* Header - KEEP EXACTLY AS IS */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quote History
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage all your freight quotes
            </p>
          </div>
          <button
            onClick={refreshQuotes}
            className={`p-2 rounded-lg flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards - KEEP EXACTLY AS IS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Quotes</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quotes.length}
                </p>
              </div>
              <FileText className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booked</p>
                <p className={`text-2xl font-bold text-green-500`}>
                  {quotes.filter(q => q.isBooked).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                <p className={`text-2xl font-bold text-yellow-500`}>
                  {quotes.filter(q => q.status === 'quote_processing').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quotes.filter(q => {
                    const date = new Date(q.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Filters - KEEP EXACTLY AS IS */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[256px]">
              <div className="relative">
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by quote number or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="booked">Booked</option>
              <option value="quote_ready">Ready</option>
              <option value="quote_processing">Processing</option>
              <option value="quote_expired">Expired</option>
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Modes</option>
              <option value="ground">Ground</option>
              <option value="air">Air</option>
              <option value="ocean">Ocean</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>
          </div>
        </div>

        {/* Quotes List - MODIFIED TO ADD MANUAL BOOKING BUTTON */}
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          {filteredQuotes.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchTerm || filterStatus !== 'all' || filterMode !== 'all' || dateRange !== 'all'
                ? 'No quotes match your filters'
                : 'No quotes found. Create your first quote!'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.requestId || quote._id}
                  className={`p-4 transition-all ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleQuoteClick(quote)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {quote.requestNumber}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {getModeIcon(quote.mode)}
                          {getDirectionIcon(quote.direction)}
                        </div>

                        {/* Add service type badge for FTL/Expedited */}
                        {(quote.serviceType === 'ftl' || quote.serviceType === 'expedited') && (
                          <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {quote.serviceType?.toUpperCase()}
                          </span>
                        )}

                        {quote.isBooked ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            BOOKED
                          </span>
                        ) : (
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              quote.status === 'quote_ready'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : quote.status === 'quote_processing'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : quote.status === 'quote_expired'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
                            {quote.formData?.originCity || quote.origin?.city || 'N/A'}, {quote.formData?.originState || quote.origin?.state || ''} 
                            → {quote.formData?.destCity || quote.destination?.city || 'N/A'}, {quote.formData?.destState || quote.destination?.state || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {quote.createdAt ? new Date(quote.createdAt).toLocaleString() : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* NEW: Manual Booking Button */}
                      {canManualBook(quote) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setManualBookingModal(quote);
                          }}
                          className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${
                            isDarkMode 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          title="Book without waiting for carrier quotes"
                        >
                          <Plus className="w-3 h-3" />
                          Book Now
                        </button>
                      )}
                      
                      <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW: Manual Booking Modal */}
      {manualBookingModal && (
        <ManualBookingModal
          quote={manualBookingModal}
          onClose={() => setManualBookingModal(null)}
          onConfirm={(bookingData) => handleManualBooking(manualBookingModal, bookingData)}
        />
      )}
    </div>
  );
};

export default QuoteHistory;
