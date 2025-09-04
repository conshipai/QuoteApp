// src/pages/QuoteHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Truck, MapPin, ChevronRight, Anchor, Plane, 
  ArrowUp, ArrowDown, CheckCircle, Search, Filter,
  Calendar, Package, FileText 
} from 'lucide-react';

const QuoteHistory = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadAllQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, filterStatus, filterMode, dateRange]);

  const loadAllQuotes = async () => {
    try {
      setLoading(true);
      let allQuotes = [];
      
      // Get ground quotes
      const groundResponse = await fetch('https://api.gcc.conship.ai/api/ground-quotes/recent?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (groundResponse.ok) {
        const groundData = await groundResponse.json();
        if (groundData.success && groundData.requests) {
          const groundQuotes = groundData.requests.map(req => ({
            ...req,
            mode: 'ground',
            direction: null
          }));
          allQuotes = [...allQuotes, ...groundQuotes];
        }
      }

      // Get air/ocean quotes
      const airOceanResponse = await fetch('https://api.gcc.conship.ai/api/quotes/recent?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
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

      // Check booking status for each quote
      const quotesWithBookingStatus = await Promise.all(
        allQuotes.map(async (quote) => {
          try {
            const bookingResponse = await fetch(`https://api.gcc.conship.ai/api/bookings/by-request/${quote.requestId || quote._id}`, {
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

      // Sort by date (newest first)
      quotesWithBookingStatus.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuotes(quotesWithBookingStatus);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quotes:', error);
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

  const handleQuoteClick = (quote) => {
    if (quote.isBooked) {
      navigate(`/app/quotes/bookings/${quote.bookingId}`);
    } else {
      if (quote.mode === 'ground') {
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
    }
  };

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
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote History
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all your freight quotes
          </p>
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
              <Calendar className="w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by quote number or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Status Filter */}
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

            {/* Mode Filter */}
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

            {/* Date Range Filter */}
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
                : 'No quotes found'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.requestId || quote._id}
                  onClick={() => handleQuoteClick(quote)}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-750`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {quote.requestNumber}
                        </span>
                        
                        {/* Mode and Direction Icons */}
                        <div className="flex items-center gap-1">
                          {getModeIcon(quote.mode)}
                          {getDirectionIcon(quote.direction)}
                        </div>

                        {/* Status Badge */}
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
                                : quote.status === 'failed'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {quote.status?.toUpperCase()}
                          </span>
                        )}
                        
                        {/* Quote Count */}
                        {quote.quoteCount > 0 && (
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {quote.quoteCount} quotes
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
                          {quote.formData?.commodities?.[0] && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {quote.formData.commodities.reduce((sum, c) => sum + parseInt(c.quantity || 0), 0)} units,
                              {quote.formData.commodities.reduce((sum, c) => sum + parseInt(c.weight || 0), 0)} lbs
                            </span>
                          )}
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
      </div>
    </div>
  );
};

export default QuoteHistory;
