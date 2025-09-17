// src/components/bookings/BookingRequestForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Truck, User, Phone, Mail, Calendar, Shield, 
  AlertCircle, Clock, MapPin, Building, FileText, Upload, X 
} from 'lucide-react';
import API_BASE from '../../config/api';

const BookingRequestForm = ({ quote, formData, onSuccess, onCancel, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const modalRef = useRef(null);
  const formRef = useRef(null);
  
  // Scroll to top when modal opens
  useEffect(() => {
    // Scroll the modal content to top
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
    // Also scroll the form to top
    if (formRef.current) {
      formRef.current.scrollTop = 0;
    }
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const [bookingData, setBookingData] = useState({
    // Pickup Information
    pickup: {
      company: formData?.originCompany || '',
      address: formData?.originAddress || '',
      city: formData?.originCity || '',
      state: formData?.originState || '',
      zip: formData?.originZip || '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      hours: 'business',
      customHours: { open: '08:00', close: '17:00' },
      readyDate: formData?.pickupDate || new Date().toISOString().split('T')[0],
      readyTime: '09:00'
    },
    
    // Delivery Information
    delivery: {
      company: formData?.destCompany || '',
      address: formData?.destAddress || '',
      city: formData?.destCity || '',
      state: formData?.destState || '',
      zip: formData?.destZip || '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      hours: 'business',
      customHours: { open: '08:00', close: '17:00' },
      requiredDate: '',
      requiredTime: '',
      guaranteed: false
    },
    
    // Additional Services
    services: {
      insurance: false,
      insuranceValue: '',
      liftgatePickup: formData?.liftgatePickup || false,
      liftgateDelivery: formData?.liftgateDelivery || false,
      insidePickup: false,
      insideDelivery: formData?.insideDelivery || false,
      appointmentRequired: false,
      residential: formData?.residentialDelivery || false
    },
    
    // Special Instructions
    specialInstructions: formData?.specialInstructions || ''
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }

    setUploading(true);
    
    const fileInfo = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    };
    
    setDocuments(prev => [...prev, fileInfo]);
    setUploading(false);
    event.target.value = '';
  };

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
          pieces: formData?.commodities || []
        },
        services: bookingData.services,
        pricing: {
          total: quote.final_price || quote.price || quote.rate || 0,
          carrier: quote.service_details?.carrier || quote.carrier,
          transitDays: quote.transit_days || quote.transitDays
        },
        specialInstructions: bookingData.specialInstructions,
        documents: documents.map(d => ({
          name: d.name,
          type: d.type,
          size: d.size
        }))
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
      <div 
        ref={modalRef}
        className="w-full h-full overflow-y-auto"
      >
        <div className="min-h-full flex items-start justify-center p-4 py-8">
          <div className={`max-w-5xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            {/* Header - Not sticky to avoid scroll issues */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Complete Booking Request
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Quote #{quote.requestNumber} • {quote.service_details?.carrier || 'Carrier'} • ${quote.final_price || quote.price}
                  </p>
                </div>
                <button 
                  onClick={onCancel} 
                  className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Body - Single Page */}
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Pickup & Delivery Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pickup Information */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Truck className="w-5 h-5 text-blue-500" />
                    Pickup Information
                  </h3>
                  
                  <div className="space-y-3">
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
                        Street Address *
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
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingData.pickup.city}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            pickup: { ...bookingData.pickup, city: e.target.value }
                          })}
                          className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength="2"
                            value={bookingData.pickup.state}
                            onChange={(e) => setBookingData({
                              ...bookingData,
                              pickup: { ...bookingData.pickup, state: e.target.value.toUpperCase() }
                            })}
                            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ZIP *
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingData.pickup.zip}
                            onChange={(e) => setBookingData({
                              ...bookingData,
                              pickup: { ...bookingData.pickup, zip: e.target.value }
                            })}
                            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                      </div>
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
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone *
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
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={bookingData.pickup.contactEmail}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          pickup: { ...bookingData.pickup, contactEmail: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
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
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Time
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
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hours
                      </label>
                      <select
                        value={bookingData.pickup.hours}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          pickup: { ...bookingData.pickup, hours: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="business">Business Hours (8AM-5PM)</option>
                        <option value="24/7">24/7</option>
                        <option value="custom">Custom Hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="w-5 h-5 text-green-500" />
                    Delivery Information
                  </h3>
                  
                  <div className="space-y-3">
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
                        Street Address *
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
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingData.delivery.city}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            delivery: { ...bookingData.delivery, city: e.target.value }
                          })}
                          className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength="2"
                            value={bookingData.delivery.state}
                            onChange={(e) => setBookingData({
                              ...bookingData,
                              delivery: { ...bookingData.delivery, state: e.target.value.toUpperCase() }
                            })}
                            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ZIP *
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingData.delivery.zip}
                            onChange={(e) => setBookingData({
                              ...bookingData,
                              delivery: { ...bookingData.delivery, zip: e.target.value }
                            })}
                            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                      </div>
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
                        placeholder="Jane Smith"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone *
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
                        placeholder="(555) 987-6543"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={bookingData.delivery.contactEmail}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          delivery: { ...bookingData.delivery, contactEmail: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="jane@example.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Required Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.delivery.requiredDate}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            delivery: { ...bookingData.delivery, requiredDate: e.target.value }
                          })}
                          min={bookingData.pickup.readyDate || new Date().toISOString().split('T')[0]}
                          className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Time
                        </label>
                        <input
                          type="time"
                          value={bookingData.delivery.requiredTime}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            delivery: { ...bookingData.delivery, requiredTime: e.target.value }
                          })}
                          className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hours
                      </label>
                      <select
                        value={bookingData.delivery.hours}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          delivery: { ...bookingData.delivery, hours: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="business">Business Hours (8AM-5PM)</option>
                        <option value="24/7">24/7</option>
                        <option value="custom">Custom Hours</option>
                      </select>
                    </div>
                    
                    <label className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.delivery.guaranteed}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          delivery: { ...bookingData.delivery, guaranteed: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Guaranteed Delivery (additional charges apply)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Services & Documents */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5 text-purple-500" />
                    Additional Services
                  </h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.services.insurance}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, insurance: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Cargo Insurance</span>
                    </label>
                    
                    {bookingData.services.insurance && (
                      <input
                        type="number"
                        placeholder="Declared value ($)"
                        value={bookingData.services.insuranceValue}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, insuranceValue: e.target.value }
                        })}
                        className={`ml-7 px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    )}
                    
                    <label className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.services.liftgatePickup}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, liftgatePickup: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Liftgate at Pickup</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.services.liftgateDelivery}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, liftgateDelivery: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Liftgate at Delivery</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.services.insideDelivery}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, insideDelivery: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Inside Delivery</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.services.appointmentRequired}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, appointmentRequired: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Appointment Required</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={bookingData.services.residential}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          services: { ...bookingData.services, residential: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Residential Delivery</span>
                    </label>
                  </div>
                </div>

                {/* Documents */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="w-5 h-5 text-orange-500" />
                    Documents
                  </h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded cursor-pointer border-2 border-dashed ${
                      isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <Upload className="w-5 h-5" />
                      <span>{uploading ? 'Uploading...' : 'Upload Document (PDF, JPG, PNG)'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    
                    {documents.map(doc => (
                      <div key={doc.id} className={`flex items-center justify-between p-2 rounded ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className="text-sm truncate flex-1">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                          className="ml-2 text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {documents.length === 0 && (
                      <p className={`text-sm text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No documents uploaded yet
                      </p>
                    )}
                  </div>
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
                  placeholder="Any special handling instructions, delivery requirements, or notes..."
                  className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* Notice */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                      What Happens Next?
                    </p>
                    <ul className={`mt-2 space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      <li>• Your booking will be confirmed within 15-30 minutes</li>
                      <li>• BOL and shipping labels will be sent to your email</li>
                      <li>• Track shipment status in your dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  className={`px-6 py-2 rounded font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-2 rounded font-medium ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : isDarkMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestForm;
