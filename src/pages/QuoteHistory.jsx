// src/pages/QuoteHistory.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Truck, 
  DollarSign,
  Clock,
  ChevronDown,
  Package
} from 'lucide-react';

const QuoteHistory = ({ isDarkMode }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, status
  const [filterMode, setFilterMode] = useState('all'); // all, ltl, ftl, expedited
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, quoted, booked

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // We'll connect this to your backend in the next step
      // For now, let's use localStorage to test the UI
      const mockQuotes = [];
      
      // Load quotes from localStorage (your existing quotes)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quote_request_')) {
          const quote = JSON.parse(localStorage.getItem(key));
          if (quote) {
            mockQuotes.push({
              ...quote,
              // Ensure consistent structure
              id: quote.requestId || quote._id,
              mode: quote.serviceType || 'ltl',
              totalPrice: quote.price || 0,
              origin: {
                city: quote.formData?.originCity,
                state: quote.formData?.originState,
                zip: quote.formData?.originZip
              },
              destination: {
                city: quote.formData?.destCity,
                state: quote.formData?.destState,
                zip: quote.formData?.destZip
              }
            });
          }
        }
      }
      
      setQuotes(mockQuotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter quotes based on search and filters
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = !searchTerm || 
      quote.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.origin?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.origin?.zip?.includes(searchTerm) ||
      quote.destination?.zip?.includes(searchTerm);

    const matchesMode = filterMode === 'all' || quote.mode === filterMode;
    const matchesStatus = filterStatus === 'all' || quote.status?.toLowerCase() === filterStatus;

    return matchesSearch && matchesMode && matchesStatus;
  });

  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch(sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'price':
        return (b.totalPrice || 0) - (a.totalPrice || 0);
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'quoted') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (statusLower === 'pending' || statusLower === 'processing') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (statusLower === 'booked') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
               style={{borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent'}} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading quote history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote History
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all your freight quotes
          </p>
        </div>

        {/* Filters Bar */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by quote #, city, or ZIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* Filter by Mode */}
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
              <option value="ltl">LTL</option>
              <option value="ftl">FTL</option>
              <option value="expedited">Expedited</option>
            </select>

            {/* Filter by Status */}
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
              <option value="active">Active (Valid)</option>
              <option value="expired">Expired</option>
              <option value="booked">Booked</option>
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quotes.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Quotes
                </p>
              </div>
              <Package className={`w-8 h-8 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'} opacity-20`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quotes.filter(q => q.status?.toLowerCase() === 'quoted').length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </p>
              </div>
              <Clock className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'} opacity-20`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quotes.filter(q => ['pending', 'processing'].includes(q.status?.toLowerCase())).length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  In Progress
                </p>
              </div>
              <Truck className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} opacity-20`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${quotes.reduce((sum, q) => sum + (q.totalPrice || 0), 0).toLocaleString()}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Value
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} opacity-20`} />
            </div>
          </div>
        </div>

        {/* Quote List */}
        <div className="space-y-3">
          {sortedQuotes.map((quote) => (
            <div
              key={quote.id}
              className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } transition-all cursor-pointer hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Quote Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {quote.requestNumber || 'N/A'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(quote.status)}`}>
                      {(quote.status || 'Unknown').toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {(quote.mode || 'N/A').toUpperCase()}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {quote.origin?.city || 'N/A'}, {quote.origin?.state || ''} {quote.origin?.zip || ''}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {quote.destination?.city || 'N/A'}, {quote.destination?.state || ''} {quote.destination?.zip || ''}
                    </span>
                  </div>

                  {/* Date and Price */}
                  <div className={`flex items-center gap-4 mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    {quote.totalPrice > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${quote.totalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            </div>
          ))}
        </div>

        {sortedQuotes.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No quotes found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteHistory;
