/ src/pages/BookingsManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, Truck, Plane, Ship, ChevronDown, ChevronRight, Search, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../services/bookingApi';
import API_BASE from '../config/api';

const BookingsManagement = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getAllBookings();
      if (result.success) {
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    setLoading(false);
  };
  
    const handleReject = async (bookingId) => {
    if (!confirm('Cancel this booking request?')) return;
    try {
      const response = await fetch(`${API_BASE}/booking-requests/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        alert('Booking request cancelled');
        loadBookings();
      } else {
        throw new Error(result.error || 'Cancellation failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  const getModeIcon = (mode) => {
    switch (mode) {
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
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesMode = filterMode === 'all' || booking.mode === filterMode;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch =
      (booking.confirmationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.carrier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.pickupNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = new Date(booking.createdAt) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(booking.createdAt) <= new Date(dateRange.end);
    }

    return matchesMode && matchesStatus && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div
            className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent' }}
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
            Review incoming booking requests
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
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Mode Filter */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending Review</option>
              <option value="CONFIRMED">Approved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
            >
              {/* Booking Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedBooking(expandedBooking === booking.bookingId ? null : booking.bookingId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-1">
                      {expandedBooking === booking.bookingId ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
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
                          {booking.status}
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
                        ${Number(booking.price || 0).toFixed(2)}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedBooking === booking.bookingId && (
  <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pickup Details */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Pickup Information
        </h4>
        <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>Company: {booking.pickup?.company || 'N/A'}</div>
          <div>Address: {booking.pickup?.address || 'N/A'}</div>
          <div>Location: {booking.pickup?.city}, {booking.pickup?.state} {booking.pickup?.zip}</div>
          <div>Contact: {booking.pickup?.contactName || 'N/A'}</div>
          <div>Phone: {booking.pickup?.contactPhone || 'N/A'}</div>
          <div>Email: {booking.pickup?.contactEmail || 'N/A'}</div>
          <div>Ready Date: {booking.pickup?.readyDate ? new Date(booking.pickup.readyDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Delivery Information
        </h4>
        <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>Company: {booking.delivery?.company || 'N/A'}</div>
          <div>Address: {booking.delivery?.address || 'N/A'}</div>
          <div>Location: {booking.delivery?.city}, {booking.delivery?.state} {booking.delivery?.zip}</div>
          <div>Contact: {booking.delivery?.contactName || 'N/A'}</div>
          <div>Phone: {booking.delivery?.contactPhone || 'N/A'}</div>
          <div>Email: {booking.delivery?.contactEmail || 'N/A'}</div>
          <div>Required Date: {booking.delivery?.requiredDate ? new Date(booking.delivery.requiredDate).toLocaleDateString() : 'TBD'}</div>
        </div>
      </div>

      {/* Cargo Details */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargo Information
        </h4>
        <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>Total Pieces: {booking.cargo?.totalPieces || 0}</div>
          <div>Total Weight: {booking.cargo?.totalWeight || 0} lbs</div>
          <div>Description: {booking.cargo?.description || 'General Freight'}</div>
        </div>
      </div>

      {/* Pricing & Status */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Pricing & Status
        </h4>
        <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>
            Quote Amount: <strong>${Number(booking.pricing?.total ?? booking.price ?? 0).toFixed(2)}</strong>
          </div>
          <div>
            Status: <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>{booking.status}</span>
          </div>
          <div>Request #: {booking.bookingId}</div>
          <div>Created: {new Date(booking.createdAt).toLocaleString()}</div>
        </div>

       {booking.status === 'PENDING' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handleReject(booking.requestId)}
                  className={`w-full px-4 py-2 rounded text-sm font-medium ${
                    isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Cancel Booking Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    {/* Close the map iteration */}
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
