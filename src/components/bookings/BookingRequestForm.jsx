// src/components/bookings/BookingRequestForm.jsx
import React, { useState } from 'react';
import { 
  Package, Truck, User, Phone, Mail, Calendar, Shield, 
  AlertCircle, Clock, MapPin, Building, FileText, Upload, X, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../config/api';

const BookingRequestForm = ({ quote, formData, onSuccess, isDarkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Pickup/Delivery, 2: Details, 3: Services
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  
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
      hours: 'business', // business, 24/7, custom
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
    
    // Cargo Details (from quote)
    cargo: {
      pieces: formData?.commodities?.map(c => ({
        quantity: c.quantity,
        weight: c.weight,
        length: c.length,
        width: c.width,
        height: c.height,
        description: c.description || 'General Freight',
        hazmat: c.hazmat || false
      })) || [],
      totalWeight: formData?.commodities?.reduce((sum, c) => sum + (c.weight * c.quantity), 0) || 0,
      totalPieces: formData?.commodities?.reduce((sum, c) => sum + parseInt(c.quantity), 0) || 0
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
      notifications: ['email'], // email, sms, both
      tradeShow: false,
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
    
    // For now, just store file info locally
    // In production, you'd upload to your storage service
    const fileInfo = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file // Store the actual file for upload later
    };
    
    setDocuments(prev => [...prev, fileInfo]);
    setUploading(false);
    event.target.value = '';
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      // Validate pickup/delivery companies and addresses
      if (!bookingData.pickup.company || !bookingData.pickup.address) {
        alert('Please enter pickup company and address');
        return false;
      }
      if (!bookingData.delivery.company || !bookingData.delivery.address) {
        alert('Please enter delivery company and address');
        return false;
      }
    } else if (stepNum === 2) {
      // Validate contacts
      if (!bookingData.pickup.contactName || !bookingData.pickup.contactPhone) {
        alert('Please enter pickup contact information');
        return false;
      }
      if (!bookingData.delivery.contactName || !bookingData.delivery.contactPhone) {
        alert('Please enter delivery contact information');
        return false;
      }
      if (!bookingData.pickup.readyDate) {
        alert('Please enter ready date');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    // Navigate back to quotes or dashboard
    navigate(-1); // Go back to previous page
    // Or navigate to specific route: navigate('/quotes');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;
    
    setLoading(true);
    
    try {
      // Prepare the booking request data
      const requestData = {
        quoteId: quote.requestId || quote._id,
        pickup: bookingData.pickup,
        delivery: bookingData.delivery,
        cargo: {
          ...bookingData.cargo,
          hazmat: bookingData.cargo.pieces.some(p => p.hazmat)
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
        // If we have documents, upload them
        if (documents.length > 0) {
          for (const doc of documents) {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('bookingRequestId', result.bookingRequest.id);
            formData.append('documentType', 'booking_document');
            
            // Upload to your storage service
            // await uploadDocument(formData);
          }
        }
        
        if (onSuccess) {
          onSuccess(result.bookingRequest);
        } else {
          // Navigate to success page or bookings list
          navigate('/bookings', { state: { message: 'Booking request created successfully!' } });
        }
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm mb-6`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <button 
                onClick={handleCancel}
                className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Quotes
              </button>
            </div>
            
            <div className="mt-4">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Complete Booking Request
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Quote #{quote?.requestNumber || 'N/A'} • {quote?.service_details?.carrier || 'Carrier'} • ${quote?.final_price || quote?.price || 0}
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 1 ? 'bg-purple-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div className="flex items-center mx-2">
                  <div className={`w-24 h-1 ${step >= 2 ? 'bg-purple-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 2 ? 'bg-purple-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <div className="flex items-center mx-2">
                  <div className={`w-24 h-1 ${step >= 3 ? 'bg-purple-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 3 ? 'bg-purple-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
              </div>
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-center mt-2 gap-8 text-xs">
              <span className={step >= 1 ? 'text-purple-600 font-semibold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                Locations
              </span>
              <span className={step >= 2 ? 'text-purple-600 font-semibold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                Contacts
              </span>
              <span className={step >= 3 ? 'text-purple-600 font-semibold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                Services
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Pickup & Delivery Locations */}
            {step === 1 && (
              <div className="space-y-8">
                {/* Pickup Section */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Truck className="w-5 h-5" />
                    Pickup Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
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
                    
                    <div className="md:col-span-2">
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
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
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
                      <div className="flex-1">
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
                </div>

                {/* Delivery Section */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="w-5 h-5" />
                    Delivery Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
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
                    
                    <div className="md:col-span-2">
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
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
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
                      <div className="flex-1">
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
                </div>
              </div>
            )}

            {/* Step 2: Contact & Schedule */}
            {step === 2 && (
              <div className="space-y-8">
                {/* Pickup Contact */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5" />
                    Pickup Contact & Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Phone Number *
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
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={bookingData.pickup.contactEmail}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          pickup: { ...bookingData.pickup, contactEmail: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hours of Operation
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
                    
                    {bookingData.pickup.hours === 'custom' && (
                      <>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Open Time
                          </label>
                          <input
                            type="time"
                            value={bookingData.pickup.customHours.open}
                            onChange={(e) => setBookingData({
                              ...bookingData,
                              pickup: {
                                ...bookingData.pickup,
                                customHours: { ...bookingData.pickup.customHours, open: e.target.value }
                              }
                            })}
                            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Close Time
                          </label>
                          <input
                            type="time"
                            value={bookingData.pickup.customHours.close}
                            onChange={(e) => setBookingData({
                              ...bookingData,
                              pickup: {
                                ...bookingData.pickup,
                                customHours: { ...bookingData.pickup.customHours, close: e.target.value }
                              }
                            })}
                            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                      </>
                    )}
                    
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

                {/* Delivery Contact */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5" />
                    Delivery Contact & Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Phone Number *
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
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={bookingData.delivery.contactEmail}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          delivery: { ...bookingData.delivery, contactEmail: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hours of Operation
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
                        min={bookingData.pickup.readyDate || new Date().toISOString().split('T')[0]}
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
                          className="w-4 h-4"
                        />
                        <span>Guaranteed Delivery (extra charges apply)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Services & Documents */}
            {step === 3 && (
              <div className="space-y-8">
                {/* Additional Services */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5" />
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
                      <span>Add Cargo Insurance</span>
                    </label>
                    
                    {bookingData.services.insurance && (
                      <div className="ml-7">
                        <input
                          type="number"
                          placeholder="Declared value ($)"
                          value={bookingData.services.insuranceValue}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            services: { ...bookingData.services, insuranceValue: e.target.value }
                          })}
                          className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
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
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="w-5 h-5" />
                    Documents (Optional)
                  </h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}>
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    
                    {documents.map(doc => (
                      <div key={doc.id} className={`flex items-center justify-between p-3 rounded ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className="text-sm">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
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
                    placeholder="Any special handling instructions or notes..."
                    className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* Notice */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                        What Happens Next?
                      </p>
                      <ul className={`mt-2 space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        <li>• Your booking request will be reviewed by our operations team</li>
                        <li>• Once confirmed, you'll receive your BOL and shipping labels via email</li>
                        <li>• You can track your shipment status in your dashboard</li>
                        <li>• Typical processing time: 15-30 minutes during business hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 rounded font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`px-4 py-2 rounded font-medium ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-6 py-2 rounded font-medium ${
                      isDarkMode 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 rounded font-medium ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : isDarkMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestForm;
