// src/components/bookings/BookingRequestForm.jsx
import React, { useState } from 'react';
import { Package, Truck, User, Phone, Mail, Calendar, Shield, AlertCircle } from 'lucide-react';
import bookingApi from '../../services/bookingApi';

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
      contactEmail: '',
      readyDate: formData?.pickupDate || new Date().toISOString().split('T')[0],
      readyTime: '09:00',
      hours: 'business',
      customHours: { open: '08:00', close: '17:00' }
    },
    delivery: {
      company: formData?.destCompany || '',
      address: formData?.destAddress || '',
      city: formData?.destCity || '',
      state: formData?.destState || '',
      zip: formData?.destZip || '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      requiredDate: '',
      requiredTime: '',
      guaranteed: false,
      hours: 'business',
      customHours: { open: '08:00', close: '17:00' }
    },
    services: {
      insurance: false,
      insuranceValue: '',
      liftgatePickup: formData?.liftgatePickup || false,
      liftgateDelivery: formData?.liftgateDelivery || false,
      insidePickup: false,
      insideDelivery: formData?.insideDelivery || false,
      appointmentRequired: false
    },
    specialInstructions: formData?.specialInstructions || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingData.pickup.contactName || !bookingData.pickup.contactPhone) {
      alert('Please provide pickup contact information');
      return;
    }
    if (!bookingData.delivery.contactName || !bookingData.delivery.contactPhone) {
      alert('Please provide delivery contact information');
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
          description: formData?.commodities?.[0]?.description || 'General Freight',
          hazmat: formData?.commodities?.some(c => c.hazmat) || false
        },
        services: bookingData.services,
        pricing: {
          total: quote.price || quote.rate
        },
        specialInstructions: bookingData.specialInstructions
      };
      
      const result = await bookingApi.createBooking(requestData);
      
      if (result.success) {
        onSuccess(result.booking);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto`}>
      <div className={`max-w-4xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 my-8`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Complete Booking Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Truck className="w-5 h-5" />
              Pickup Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.pickup.company}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pickup: { ...bookingData.pickup, company: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.pickup.address}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pickup: { ...bookingData.pickup, address: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.pickup.contactName}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pickup: { ...bookingData.pickup, contactName: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.pickup.contactPhone}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pickup: { ...bookingData.pickup, contactPhone: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ready Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.pickup.readyDate}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pickup: { ...bookingData.pickup, readyDate: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ready Time
                </label>
                <input
                  type="time"
                  value={bookingData.pickup.readyTime}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pickup: { ...bookingData.pickup, readyTime: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Package className="w-5 h-5" />
              Delivery Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.delivery.company}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    delivery: { ...bookingData.delivery, company: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.delivery.address}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    delivery: { ...bookingData.delivery, address: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.delivery.contactName}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    delivery: { ...bookingData.delivery, contactName: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.delivery.contactPhone}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    delivery: { ...bookingData.delivery, contactPhone: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Required Delivery Date
                </label>
                <input
                  type="date"
                  value={bookingData.delivery.requiredDate}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    delivery: { ...bookingData.delivery, requiredDate: e.target.value }
                  })}
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className={`flex items-center gap-2 mt-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={bookingData.delivery.guaranteed}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      delivery: { ...bookingData.delivery, guaranteed: e.target.checked }
                    })}
                  />
                  <span>Guaranteed Delivery (extra charges apply)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-5 h-5" />
              Additional Services
            </h3>
            
            <div className="space-y-3">
              <label className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={bookingData.services.insurance}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    services: { ...bookingData.services, insurance: e.target.checked }
                  })}
                />
                <span>Add Insurance</span>
              </label>
              
              {bookingData.services.insurance && (
                <input
                  type="number"
                  placeholder="Insurance value ($)"
                  value={bookingData.services.insuranceValue}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    services: { ...bookingData.services, insuranceValue: e.target.value }
                  })}
                  className={`ml-6 px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              )}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Special Instructions
            </label>
            <textarea
              rows="3"
              value={bookingData.specialInstructions}
              onChange={(e) => setBookingData({ ...bookingData, specialInstructions: e.target.value })}
              className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          {/* Notice */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                  Booking Confirmation Process
                </p>
                <p className={`mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Once you submit this booking request, our team will review it and send you the BOL and shipping labels via email within 30 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded font-medium ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 rounded font-medium ${
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
