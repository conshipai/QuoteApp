import React, { useState, useEffect } from 'react';
import { 
  Clock, Truck, MapPin, ChevronRight, Anchor, Plane, 
  ArrowUp, ArrowDown, CheckCircle, Search, Filter,
  Calendar, Package, FileText, AlertCircle
} from 'lucide-react';

const QuoteHistory = ({ isDarkMode = false, userRole = 'user' }) => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAllQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, filterStatus, filterMode, dateRange]);

  // Helper function to save complete quote data
  const saveCompleteQuoteData = (quote) => {
    const requestId = quote.requestId || quote._id;
    const completeData = {
      requestId,
      requestNumber: quote.requestNumber,
      mode: quote.mode,
      direction: quote.direction,
      serviceType: quote.serviceType || 'ltl',
      formData: quote.formData || {},
      status: quote.status,
      createdAt: quote.createdAt,
      quoteCount: quote.quoteCount || 0,
      origin: quote.origin,
      destination: quote.destination
    };
    
    try {
      localStorage.setItem(`quote_complete_${requestId}`, JSON.stringify(completeData));
      console.log(`✅ Saved complete data for ${requestId}`);
    } catch (e) {
      console.error('Failed to save quote data:', e);
    }
  };

  const loadAllQuotes = async () => {
    try {
      setLoading(true);
      let allQuotes = [];
      
      // Simulated data for demo
      const demoQuotes = [
        {
          _id: 'demo1',
          requestId: 'REQ-2025-001',
          requestNumber: 'REQ-2025-001',
          mode: 'ground',
          serviceType: 'ltl',
          status: 'quoted',
          quoteCount: 3,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          formData: {
            originCity: 'Los Angeles',
            originState: 'CA',
            destCity: 'Phoenix',
            destState: 'AZ',
            commodities: [
              { quantity: 10, weight: 500, description: 'Pallets' }
            ]
          },
          origin: { city: 'Los Angeles', state: 'CA' },
          destination: { city: 'Phoenix', state: 'AZ' }
        },
        {
          _id: 'demo2',
          requestId: 'REQ-2025-002',
          requestNumber: 'REQ-2025-002',
          mode: 'air',
          direction: 'export',
          status: 'pending',
          quoteCount: 0,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          origin: { city: 'New York', state: 'NY' },
          destination: { city: 'London', state: 'UK' },
          shipment: { mode: 'air', direction: 'export' }
        },
        {
          _id: 'demo3',
          requestId: 'REQ-2025-003',
          requestNumber: 'REQ-2025-003',
          mode: 'ocean',
          direction: 'import',
          status: 'quoted',
          quoteCount: 5,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          origin: { city: 'Shanghai', state: 'China' },
          destination: { city: 'Los Angeles', state: 'CA' },
          shipment: { mode: 'ocean', direction: 'import' },
          isBooked: true,
          bookingId: 'BK-2025-001'
        }
      ];

      // Save demo quotes data for later retrieval
      demoQuotes.forEach(quote => saveCompleteQuoteData(quote));
      
      // Set quotes
      setQuotes(demoQuotes);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to load quotes:', error);
      setLoading(false);
      showNotification('Failed to load quotes', 'error');
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

  const handleQuoteClick = async (quote) => {
    const requestId = quote.requestId || quote._id;
    
    // If booked, show booking info (simulated)
    if (quote.isBooked) {
      showNotification(`Viewing booking ${quote.bookingId}`, 'info');
      return;
    }

    // Enhanced data retrieval with fallback chain
    let completeData = { ...quote };
    let dataSource = 'original';
    
    // 1. Try to get complete saved data first
    const savedCompleteData = localStorage.getItem(`quote_complete_${requestId}`);
    if (savedCompleteData) {
      try {
        const parsed = JSON.parse(savedCompleteData);
        completeData = { ...completeData, ...parsed };
        dataSource = 'complete_cache';
        console.log(`✅ Loaded complete data for ${requestId} from cache`);
      } catch (e) {
        console.error('Error parsing complete data:', e);
      }
    }
    
    // 2. If no form data yet, try individual sources
    if (!completeData.formData || Object.keys(completeData.formData).length === 0) {
      // Try saved form data
      const savedFormData = localStorage.getItem(`quote_formdata_${requestId}`);
      if (savedFormData) {
        try {
          completeData.formData = JSON.parse(savedFormData);
          dataSource = 'form_cache';
          console.log(`📦 Using saved form data for ${requestId}`);
        } catch (e) {
          console.error('Error parsing form data:', e);
        }
      }
      
      // Try cached results
      if (!completeData.formData || Object.keys(completeData.formData).length === 0) {
        const cachedResults = localStorage.getItem(`quote_results_${requestId}`);
        if (cachedResults) {
          try {
            const cached = JSON.parse(cachedResults);
            if (cached.formData) {
              completeData.formData = cached.formData;
              dataSource = 'results_cache';
              console.log(`📊 Using form data from cached results for ${requestId}`);
            }
          } catch (e) {
            console.error('Error parsing cached results:', e);
          }
        }
      }
    }
    
    // 3. Validate and prepare navigation data
    const navigationData = {
      requestId: requestId,
      requestNumber: completeData.requestNumber,
      mode: completeData.mode,
      direction: completeData.direction,
      serviceType: completeData.serviceType || 'ltl',
      formData: completeData.formData || {},
      status: completeData.status,
      dataSource: dataSource // Track where data came from
    };
    
    // Log navigation for debugging
    console.log('📍 Navigating with data:', {
      requestId,
      mode: navigationData.mode,
      dataSource: navigationData.dataSource,
      hasFormData: Object.keys(navigationData.formData).length > 0
    });
    
    // Show notification about navigation
    showNotification(
      `Loading ${completeData.mode} quote ${completeData.requestNumber}`,
      'info'
    );
    
    // In a real app, this would use React Router navigation
    // For demo, we'll just log the navigation
    console.log('Navigate to:', {
      path: completeData.mode === 'ground' 
        ? `/app/quotes/ground/results/${requestId}`
        : `/app/quotes/${completeData.mode}/results/${requestId}`,
      state: navigationData
    });
  };

  // Function to refresh quote data
  const refreshQuoteData = async (requestId) => {
    try {
      showNotification('Refreshing quote data...', 'info');
      // In real app, this would fetch from API
      // For demo, we'll just simulate a refresh
      setTimeout(() => {
        showNotification('Quote data refreshed', 'success');
      }, 1000);
    } catch (error) {
      showNotification('Failed to refresh quote data', 'error');
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
              <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
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
                  className={`p-4 cursor-pointer transition-all ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
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
