// src/components/bookings/BookingRequestForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Truck, User, Phone, Mail, Calendar, Shield, 
  AlertCircle, Clock, MapPin, Building, FileText, Upload, X, 
  BookOpen, Plus, Check, Search, Star
} from 'lucide-react';
import API_BASE from '../../config/api';

const BookingRequestForm = ({ quote, formData, onSuccess, onCancel, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [addressBook, setAddressBook] = useState([]);
  const [showAddressBook, setShowAddressBook] = useState({ pickup: false, delivery: false });
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [searchTerm, setSearchTerm] = useState({ pickup: '', delivery: '' });
  const [showSaveAddress, setShowSaveAddress] = useState({ pickup: false, delivery: false });
  
  const modalRef = useRef(null);
  const formRef = useRef(null);
  
  // Scroll to top when modal opens
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
    if (formRef.current) {
      formRef.current.scrollTop = 0;
    }
    document.body.style.overflow = 'hidden';
    
    // Load address book
    fetchAddressBook();
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const [bookingData, setBookingData] = useState({
    // Pickup Information
    pickup: {
      company: formData?.originCompany || '',
      address: formData?.originAddress || '',
      address2: '',
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
      address2: '',
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

  // Fetch address book
  const fetchAddressBook = async () => {
    setLoadingAddresses(true);
    try {
      const response = await fetch(`${API_BASE}/address-book/companies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAddressBook(data.companies || []);
      }
    } catch (error) {
      console.error('Error loading address book:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Save address to address book
  const saveToAddressBook = async (type) => {
    const addressData = bookingData[type];
    const addressType = type === 'pickup' ? 'shipper' : 'consignee';
    
    try {
      const response = await fetch(`${API_BASE}/address-book/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name: addressData.company,
          address: addressData.address,
          address2: addressData.address2,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          country: 'USA',
          contact: addressData.contactName,
          phone: addressData.contactPhone,
          email: addressData.contactEmail,
          types: [addressType],
          notes: `${type === 'pickup' ? 'Pickup' : 'Delivery'} location - Hours: ${addressData.hours}`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`${type === 'pickup' ? 'Pickup' : 'Delivery'} location saved to address book!`);
        fetchAddressBook(); // Refresh address book
        setShowSaveAddress({ ...showSaveAddress, [type]: false });
      }
    } catch (error) {
      console.error('Error saving to address book:', error);
      alert('Failed to save address');
    }
  };

  // Select address from address book
  const selectFromAddressBook = (type, company) => {
    setBookingData({
      ...bookingData,
      [type]: {
        ...bookingData[type],
        company: company.name,
        address: company.address || '',
        address2: company.address2 || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
        contactName: company.contact || bookingData[type].contactName,
        contactPhone: company.phone || bookingData[type].contactPhone,
        contactEmail: company.email || bookingData[type].contactEmail
      }
    });
    setShowAddressBook({ ...showAddressBook, [type]: false });
  };

  // Handle file upload with real S3 upload
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
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', quote.requestId || quote._id || `temp_${Date.now()}`);
      formData.append('documentType', 'booking_document');
      
      const response = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        const fileInfo = {
          id: `doc_${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: data.fileUrl,
          key: data.key,
          uploaded: true
        };
        
        setDocuments(prev => [...prev, fileInfo]);
        console.log('Document uploaded:', data.fileUrl);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
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
        pickup: {
          ...bookingData.pickup,
          address: bookingData.pickup.address + (bookingData.pickup.address2 ? `, ${bookingData.pickup.address2}` : '')
        },
        delivery: {
          ...bookingData.delivery,
          address: bookingData.delivery.address + (bookingData.delivery.address2 ? `, ${bookingData.delivery.address2}` : '')
        },
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
          size: d.size,
          url: d.url,
          key: d.key
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

  // Filter address book based on search and type
  const getFilteredAddresses = (type) => {
    const term = searchTerm[type].toLowerCase();
    const addressType = type === 'pickup' ? 'shipper' : 'consignee';
    
    // Filter by type and search term
    return addressBook.filter(company => {
      // Check if it's the right type or has no type specified
      const hasCorrectType = !company.types || company.types.length === 0 || 
                             company.types.includes(addressType) || 
                             company.types.includes('third_party');
      
      // Check search term
      const matchesSearch = !term || 
                           company.name?.toLowerCase().includes(term) ||
                           company.city?.toLowerCase().includes(term) ||
                           company.contact?.toLowerCase().includes(term);
      
      return hasCorrectType && matchesSearch;
    });
  };

  // Get type badges for address
  const getTypeBadges = (company) => {
    if (!company.types || company.types.length === 0) return null;
    
    const typeColors = {
      shipper: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      consignee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      third_party: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      broker: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    };
    
    return (
      <div className="flex gap-1">
        {company.types.map(type => (
          <span key={type} className={`text-xs px-2 py-0.5 rounded ${typeColors[type] || 'bg-gray-100'}`}>
            {type.replace('_', ' ')}
          </span>
        ))}
      </div>
    );
  };

  // Address Book Modal Component
  const AddressBookModal = ({ type, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-h-[80vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select {type === 'pickup' ? 'Pickup' : 'Delivery'} Location
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name, city, or contact..."
            value={searchTerm[type]}
            onChange={(e) => setSearchTerm({ ...searchTerm, [type]: e.target.value })}
            className={`w-full pl-10 pr-3 py-2 rounded border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        
        {/* Address List */}
        <div className="space-y-2">
          {loadingAddresses ? (
            <p className="text-center py-4">Loading addresses...</p>
          ) : getFilteredAddresses(type).length === 0 ? (
            <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No addresses found
            </p>
          ) : (
            getFilteredAddresses(type).map(company => (
              <div
                key={company._id}
                onClick={() => selectFromAddressBook(type, company)}
                className={`p-3 rounded cursor-pointer border ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {company.name}
                      </h4>
                      {company.isDefault && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                      {getTypeBadges(company)}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {company.address}
                      {company.address2 && `, ${company.address2}`}
                      {company.city && `, ${company.city}`}
                      {company.state && `, ${company.state}`} 
                      {company.zip}
                    </p>
                    {company.contact && (
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Contact: {company.contact} 
                        {company.phone && ` • ${company.phone}`}
                        {company.email && ` • ${company.email}`}
                      </p>
                    )}
                    {company.notes && (
                      <p className={`text-xs mt-1 italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {company.notes}
                      </p>
                    )}
                  </div>
                  <Check className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Add New Button */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => {
              onClose();
              setShowSaveAddress({ ...showSaveAddress, [type]: true });
            }}
            className={`w-full py-2 rounded flex items-center justify-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            Save Current Form to Address Book
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
      <div 
        ref={modalRef}
        className="w-full h-full overflow-y-auto"
      >
        <div className="min-h-full flex items-start justify-center p-4 py-8">
          <div className={`max-w-5xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            {/* Header */}
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Truck className="w-5 h-5 text-blue-500" />
                      Pickup Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddressBook({ ...showAddressBook, pickup: true })}
                      className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-white hover:bg-gray-100 text-gray-700 border'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Address Book
                    </button>
                  </div>
                  
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
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={bookingData.pickup.address2}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          pickup: { ...bookingData.pickup, address2: e.target.value }
                        })}
                        placeholder="Suite, Building, Floor, etc."
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
                    
                    {showSaveAddress.pickup && (
                      <button
                        type="button"
                        onClick={() => saveToAddressBook('pickup')}
                        className={`w-full py-2 rounded flex items-center justify-center gap-2 ${
                          isDarkMode 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Save to Address Book
                      </button>
                    )}
                  </div>
                </div>

                {/* Delivery Information - Same structure as pickup */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Package className="w-5 h-5 text-green-500" />
                      Delivery Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddressBook({ ...showAddressBook, delivery: true })}
                      className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-white hover:bg-gray-100 text-gray-700 border'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Address Book
                    </button>
                  </div>
                  
                  {/* Similar fields as pickup - I'll keep it shorter for space */}
                  <div className="space-y-3">
                    {/* Company, Address, City, State, ZIP fields - same as pickup */}
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
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={bookingData.delivery.address2}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          delivery: { ...bookingData.delivery, address2: e.target.value }
                        })}
                        placeholder="Suite, Building, Floor, etc."
                        className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    
                    {/* City, State, ZIP - same grid structure */}
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
                    
                    {/* Contact fields */}
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
                    
                    {showSaveAddress.delivery && (
                      <button
                        type="button"
                        onClick={() => saveToAddressBook('delivery')}
                        className={`w-full py-2 rounded flex items-center justify-center gap-2 ${
                          isDarkMode 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Save to Address Book
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Services & Documents - Keep the same as before */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services section - same as before */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5 text-purple-500" />
                    Additional Services
                  </h3>
                  
                  {/* All service checkboxes - same as before */}
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
                    
                    {/* Other service checkboxes */}
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

                {/* Documents section - same as before */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="w-5 h-5 text-orange-500" />
                    Documents
                  </h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded cursor-pointer border-2 border-dashed ${
                      isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                        <div className="flex items-center gap-2 flex-1">
                          {doc.uploaded && <Check className="w-4 h-4 text-green-500" />}
                          <span className="text-sm truncate flex-1">{doc.name}</span>
                        </div>
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

              {/* Rest of the form remains the same */}
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
                      <li>• All uploaded documents are securely stored</li>
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
          
          {/* Address Book Modals */}
          {showAddressBook.pickup && (
            <AddressBookModal 
              type="pickup" 
              onClose={() => setShowAddressBook({ ...showAddressBook, pickup: false })} 
            />
          )}
          
          {showAddressBook.delivery && (
            <AddressBookModal 
              type="delivery" 
              onClose={() => setShowAddressBook({ ...showAddressBook, delivery: false })} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingRequestForm;
