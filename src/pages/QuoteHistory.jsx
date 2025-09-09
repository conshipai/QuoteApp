// src/pages/QuoteHistory.jsx - Fixed version with manual booking
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Truck, MapPin, ChevronRight, Anchor, Plane, 
  ArrowUp, ArrowDown, CheckCircle, Search, Filter,
  Calendar, Package, FileText, AlertCircle, RefreshCw,
  Plus, DollarSign, Save
} from 'lucide-react';
import bookingApi from '../services/bookingApi';

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

  // KEEP THE ORIGINAL LOADING LOGIC
  const loadAllQuotes = async () => {
    setLoading(true);
    try {
      // First try to get ground quotes
      const groundResponse = await fetch('https://api.gcc.conship.ai/api/ground-quotes/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      let allQuotes = [];
      
      if (groundResponse.ok) {
        const groundData = await groundResponse.json();
        if (groundData.success && groundData.requests) {
          const groundQuotes = groundData.requests.map(req => ({
            ...req,
            requestId: req.requestId || req._id,
            mode: 'ground',
            serviceType: req.serviceType || 'ltl',
            direction: null,
            formData: req.formData || {},
            origin: {
              city: req.formData?.originCity,
              state: req.formData?.originState,
              zipCode: req.formData?.originZip
            },
            destination: {
              city: req.formData?.destCity,
              state: req.formData?.destState,
              zipCode: req.formData?.destZip
            }
          }));
          allQuotes = [...allQuotes, ...groundQuotes];
        }
      }

      // Also get air/ocean quotes if available
      const airOceanResponse = await fetch('https://api.gcc.conship.ai/api/quotes/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (airOceanResponse.ok) {
        const airOceanData = await airOceanResponse.json();
        if (airOceanData.success && airOceanData.requests) {
          const aoQuotes = airOceanData.requests.map(req => ({
            ...req,
            requestId: req.requestId || req._id,
            mode: req.shipment?.mode || 'air',
            direction: req.shipment?.direction || 'export'
          }));
          allQuotes = [...allQuotes, ...aoQuotes];
        }
      }

      // Check for bookings for each quote
      const quotesWithBookingStatus = await Promise.all(
        allQuotes.map(async (quote) => {
          try {
            const bookingResponse = await fetch(`https://api.gcc.conship.ai/api/bookings/by-request/${quote.requestId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
              }
            });
            
            if (bookingResponse.ok) {
              const bookingData = await bookingResponse.json();
              return {
                ...quote,
                isBooked: bookingData.success && bookingData.booking,
                bookingId: bookingData.booking?.bookingId
              };
            }
          } catch (e) {
            console.error('Error checking booking status:', e);
          }
          return { ...quote, isBooked: false };
        })
      );

      // Sort by date
      quotesWithBookingStatus.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuotes(quotesWithBookingStatus);
      console.log(`Loaded ${quotesWithBookingStatus.length} quotes`);
      
    } catch (error) {
      console.error('Failed to load quotes:', error);
      showNotification('Failed to load quotes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = [...quotes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.origin?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.formData?.originCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.formData?.destCity?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'booked') {
        filtered = filtered.filter(quote => quote.isBooked);
      } else {
        filtered = filtered.filter(quote => !quote.isBooked && quote.status === filterStatus);
      }
    }

    // Mode filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(quote => quote.mode === filterMode);
    }

    // Date range filter
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
          direction: quote.direction
        }
      });
    }
  };

  const refreshQuotes = () => {
    showNotification('Refreshing quotes...', 'info');
    loadAllQuotes();
  };

  // Check if quote is eligible for manual booking
  const canManualBook = (quote) => {
    return (quote.serviceType === 'ftl' || quote.serviceType === 'expedited') && 
           !quote.isBooked &&
           (quote.status === 'pending' || quote.status === 'pending_carrier_response');
  };

  // Manual Booking Modal Component
  const ManualBookingModal = ({ quote, onClose, onConfirm }) => {
    const [bookingData, setBookingData] = useState({
      carrier: '',
      price: '',
      transitDays: '',
      pickupNumber: '',
      confirmationNumber: `MANUAL-${Date.now()}`,
      notes: ''
    });

    const handleSubmit = () => {
      if (!bookingData.carrier || !bookingData.price) {
        alert('Carrier name and price are required');
        return;
      }
      onConfirm(bookingData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`max-w-lg w-full rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manual Booking - {quote.requestNumber}
          </h2>

          <div className={`mb-4 p-3 rounded text-sm ${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'}`}>
            <div>Route: {quote.formData?.originCity} → {quote.formData?.destCity}</div>
            <div>Service: {quote.serviceType?.toUpperCase()}</div>
            <div>Pickup: {new Date(quote.formData?.pickupDate).toLocaleDateString()}</div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Carrier Name *
              </label>
              <input
                type="text"
                value={bookingData.carrier}
                onChange={(e) => setBookingData({...bookingData, carrier: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Total Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bookingData.price}
                  onChange={(e) => setBookingData({...bookingData, price: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Transit Days
                </label>
                <input
                  type="number"
                  value={bookingData.transitDays}
                  onChange={(e) => setBookingData({...bookingData, transitDays: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Pickup/PRO Number
              </label>
              <input
                type="text"
                value={bookingData.pickupNumber}
                onChange={(e) => setBookingData({...bookingData, pickupNumber: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Notes
              </label>
              <textarea
                rows="2"
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className={`flex-1 px-4 py-2 rounded font-medium ${
                isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
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

  const handleManualBooking = async (quote, bookingData) => {
    try {
      const payload = {
        requestId: quote.requestId,
        quoteData: {
          carrier: bookingData.carrier,
          price: parseFloat(bookingData.price),
          transitDays: bookingData.transitDays,
          pickupNumber: bookingData.pickupNumber,
          confirmationNumber: bookingData.confirmationNumber,
          isManualBooking: true
        },
        shipmentData: {
          formData: quote.formData,
          serviceType: quote.serviceType || 'ftl'
        }
      };

      const result = await bookingApi.createBooking(payload);
      
      if (result.success) {
        showNotification('Booking created successfully!', 'success');
        setManualBookingModal(null);
        loadAllQuotes();
        navigate(`/app/quotes/bookings/${result.booking.bookingId}`);
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Manual booking error:', error);
      showNotification('Failed to create booking: ' + error.message, 'error');
    }
  };

  // KEEP THE REST OF THE ORIGINAL RENDER CODE
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
        {/* Header */}
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

        {/* Stats Cards */}
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
                  {quotes.filter(q => q.status === 'pending').length}
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

        {/* Filters */}
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
              <option value="quoted">Quoted</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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

        {/* Quotes List */}
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
                  className={`p-4 transition-all ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
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

                        {(quote.serviceType === 'ftl' || quote.serviceType === 'expedited') && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
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
                            {quote.formData?.originCity || quote.origin?.city || 'N/A'}, {quote.formData?.originState || quote.origin?.state || ''} 
                            → {quote.formData?.destCity || quote.destination?.city || 'N/A'}, {quote.formData?.destState || quote.destination?.state || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(quote.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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

      {/* Manual Booking Modal */}
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
