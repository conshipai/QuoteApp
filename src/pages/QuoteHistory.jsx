// src/pages/QuoteHistory.jsx - Add Manual Booking Feature
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Truck, MapPin, ChevronRight, Anchor, Plane, 
  ArrowUp, ArrowDown, CheckCircle, Search, Filter,
  Calendar, Package, FileText, AlertCircle, RefreshCw,
  Plus, DollarSign, Building2, Save
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

  // ... (keep existing useEffects and functions)

  // Manual Booking Modal Component
  const ManualBookingModal = ({ quote, onClose, onConfirm }) => {
    const [bookingData, setBookingData] = useState({
      carrier: '',
      price: '',
      transitDays: '',
      pickupNumber: '',
      confirmationNumber: `MANUAL-${Date.now()}`,
      notes: '',
      contactName: '',
      contactPhone: '',
      contactEmail: ''
    });

    const handleSubmit = () => {
      // Validation
      if (!bookingData.carrier || !bookingData.price) {
        alert('Carrier name and price are required');
        return;
      }

      onConfirm(bookingData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`max-w-2xl w-full rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-6 max-h-[90vh] overflow-y-auto`}>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Manual Booking - {quote.requestNumber}
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create a booking without waiting for carrier quotes
            </p>
          </div>

          {/* Shipment Summary */}
          <div className={`mb-4 p-3 rounded ${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Service:</span>
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quote.serviceType?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Route:</span>
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quote.formData?.originCity} → {quote.formData?.destCity}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Pickup Date:</span>
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(quote.formData?.pickupDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Weight:</span>
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quote.formData?.legalLoadWeight || 
                   quote.formData?.commodities?.reduce((sum, c) => sum + parseInt(c.weight || 0), 0) || 
                   'N/A'} lbs
                </span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4">
            {/* Carrier Information */}
            <div>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Carrier Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="Enter carrier name"
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
                    Total Price *
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-2.5 w-4 h-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="number"
                      step="0.01"
                      value={bookingData.price}
                      onChange={(e) => setBookingData({...bookingData, price: e.target.value})}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-3 py-2 rounded border ${
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
                    Transit Days
                  </label>
                  <input
                    type="number"
                    value={bookingData.transitDays}
                    onChange={(e) => setBookingData({...bookingData, transitDays: e.target.value})}
                    placeholder="e.g., 2"
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
                    Pickup/PRO Number
                  </label>
                  <input
                    type="text"
                    value={bookingData.pickupNumber}
                    onChange={(e) => setBookingData({...bookingData, pickupNumber: e.target.value})}
                    placeholder="Optional"
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Carrier Contact (Optional)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={bookingData.contactName}
                    onChange={(e) => setBookingData({...bookingData, contactName: e.target.value})}
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={bookingData.contactPhone}
                    onChange={(e) => setBookingData({...bookingData, contactPhone: e.target.value})}
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={bookingData.contactEmail}
                    onChange={(e) => setBookingData({...bookingData, contactEmail: e.target.value})}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Notes
              </label>
              <textarea
                rows="3"
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                placeholder="Any special instructions or notes about this booking..."
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className={`flex-1 px-4 py-2 rounded font-medium flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
              }`}
            >
              <Save className="w-4 h-4" />
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
      // Create booking with manual data
      const payload = {
        requestId: quote.requestId,
        quoteData: {
          carrier: bookingData.carrier,
          price: parseFloat(bookingData.price),
          transitDays: bookingData.transitDays,
          isManualBooking: true,
          manualBookingDetails: {
            ...bookingData,
            bookedBy: localStorage.getItem('user_email') || 'user',
            bookedAt: new Date().toISOString()
          }
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
        loadAllQuotes(); // Refresh the list
        
        // Navigate to booking confirmation
        navigate(`/app/quotes/bookings/${result.booking.bookingId}`);
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Manual booking error:', error);
      showNotification('Failed to create booking: ' + error.message, 'error');
    }
  };

  // Check if quote is eligible for manual booking
  const canManualBook = (quote) => {
    // Only for FTL and Expedited that are not yet booked
    return (quote.serviceType === 'ftl' || quote.serviceType === 'expedited') && 
           !quote.isBooked &&
           (quote.status === 'pending' || quote.status === 'pending_carrier_response');
  };

  // ... (keep existing loadAllQuotes, filterQuotes, and other functions)

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* ... (keep existing notification and header) */}
      
      <div className="p-6">
        {/* ... (keep existing header and stats cards) */}

        {/* Quotes List - Modified */}
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
                        
                        {/* Mode and Direction Icons */}
                        <div className="flex items-center gap-1">
                          {getModeIcon(quote.mode)}
                          {getDirectionIcon(quote.direction)}
                        </div>

                        {/* Service Type Badge for FTL/Expedited */}
                        {(quote.serviceType === 'ftl' || quote.serviceType === 'expedited') && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            {quote.serviceType?.toUpperCase()}
                          </span>
                        )}

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
                      {/* Manual Booking Button */}
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
