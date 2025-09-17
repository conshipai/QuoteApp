// src/components/bookings/BookingRequestForm.jsx
import React, { useState } from 'react';
import { Package, Truck, User, Phone, X } from 'lucide-react';
import API_BASE from '../../config/api';

const BookingRequestForm = ({ quote, formData, onSuccess, onCancel, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    pickup: {
      company: formData?.originCompany || '',
      address: formData?.originAddress || '',
      city: formData?.originCity || '',
      state: formData?.originState || '',
      zip: formData?.originZip || '',
      contactName: '',
      contactPhone: '',
      readyDate: formData?.pickupDate || new Date().toISOString().split('T')[0]
    },
    delivery: {
      company: formData?.destCompany || '',
      address: formData?.destAddress || '',
      city: formData?.destCity || '',
      state: formData?.destState || '',
      zip: formData?.destZip || '',
      contactName: '',
      contactPhone: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.pickup.contactName || !bookingData.pickup.contactPhone) {
      alert('Please provide pickup contact information');
      return;
    }
    
    setLoading(true);
    
    try {
      const requestData = {
        quoteId: quote.requestId || quote._id,
        pickup: bookingData.pickup,
        delivery: bookingData.delivery,
        cargo: {
          totalWeight: formData?.commodities?.reduce((sum, c) => sum + (c.weight * c.quantity), 0) || 0,
          totalPieces: formData?.commodities?.reduce((sum, c) => sum + parseInt(c.quantity), 0) || 0,
          description: 'General Freight'
        },
        pricing: {
          total: quote.price || quote.rate || quote.final_price || 0
        }
      };
      
      const response = await fetch(`${API_BASE}/booking-requests/create-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        onSuccess(result.bookingRequest);
      } else {
        alert('Failed to create booking: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-2xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Complete Booking Request
          </h2>
          <button onClick={onCancel} className="p-2 rounded hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pickup Section */}
          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Pickup Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Contact Name *"
                required
                value={bookingData.pickup.contactName}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  pickup: { ...bookingData.pickup, contactName: e.target.value }
                })}
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="tel"
                placeholder="Contact Phone *"
                required
                value={bookingData.pickup.contactPhone}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  pickup: { ...bookingData.pickup, contactPhone: e.target.value }
                })}
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {/* Delivery Section */}
          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Delivery Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Contact Name *"
                required
                value={bookingData.delivery.contactName}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  delivery: { ...bookingData.delivery, contactName: e.target.value }
                })}
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="tel"
                placeholder="Contact Phone *"
                required
                value={bookingData.delivery.contactPhone}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  delivery: { ...bookingData.delivery, contactPhone: e.target.value }
                })}
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded font-medium ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isDarkMode 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Booking Request'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingRequestForm;
