// src/pages/BookingsManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, FileText, Download, Eye, Filter, Search, 
  Calendar, Truck, Plane, Ship, Clock, CheckCircle,
  AlertCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import bookingApi from '../services/bookingApi';

const BookingsManagement = ({ isDarkMode }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getAllBookings();
      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    setLoading(false);
  };

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'ground':
      case 'ltl':
      case 'ftl':
        return <Truck className="w-4 h-4" />;
      case 'air':
        return <Plane className="w-4 h-4" />;
      case 'ocean':
        return <Ship className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'IN_TRANSIT':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'DELIVERED':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesMode = filterMode === 'all' || booking.mode === filterMode;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = booking.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.pickupNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = new Date(booking.createdAt) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(booking.createdAt) <= new Date(dateRange.end);
    }
    
    return matchesMode && matchesStatus && matchesSearch && matchesDate;
  });

  const downloadDocument = async (bookingId, docType) => {
    const result = await bookingApi.getDocument(bookingId, docType);
    if (result.success) {
      // In production, this would download the actual PDF
      alert(`Downloading ${docType} for booking ${bookingId}`);
      console.log('Document data:', result.document);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div
            className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent'}}
          />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading bookings...</p>
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
            Booking Management
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all your shipment bookings
          </p>
        </div>

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

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
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className={`rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } shadow-sm`}
            >
              {/* Booking Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedBooking(
                  expandedBooking === booking.bookingId ? null : booking.bookingId
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-1">
                      {expandedBooking === booking.bookingId ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                    
                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {getModeIcon(booking.mode)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.confirmationNumber}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.carrier} • Pickup: {booking.pickupNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${booking.price?.toFixed(2)}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Document Actions (disabled / placeholder) */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Document download coming soon');
                        }}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Download BOL (coming soon)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Document download coming soon');
                        }}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Download Invoice (coming soon)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedBooking === booking.bookingId && (
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Shipment Details */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Shipment Details
                      </h4>
                      <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div>Origin: {booking.shipmentData?.formData?.originCity}, {booking.shipmentData?.formData?.originState}</div>
                        <div>Destination: {booking.shipmentData?.formData?.destCity}, {booking.shipmentData?.formData?.destState}</div>
                        <div>Pickup Date: {booking.shipmentData?.formData?.pickupDate}</div>
                        <div>Service Type: {booking.shipmentData?.serviceType?.toUpperCase()}</div>
                      </div>
                    </div>
                    
                    {/* Documents */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {booking.documents?.map((doc, index) => (
                          <button
                            key={index}
                            onClick={() => downloadDocument(booking.bookingId, doc.type)}
                            className={`flex items-center gap-2 text-sm ${
                              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            {doc.name}
                          </button>
                        )) || (
                          <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            No documents available
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Actions
                      </h4>
                      <div className="space-y-2">
                        {/* Only show working features */}
                        <button
                          onClick={() => alert('BOL viewing coming soon')}
                          className={`w-full px-3 py-1 rounded text-sm ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          View BOL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredBookings.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No bookings found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsManagement;
