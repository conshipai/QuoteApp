// src/components/ground/BookingDetails.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, User, Mail, Package, FileText, 
  Plus, X, Clock, Building2, Save, AlertCircle,
  Upload, Hash, Truck, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../../services/bookingApi';
import API_BASE from '../../config/api';

const BookingDetails = ({ quoteData, isDarkMode }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [itemMode, setItemMode] = useState('total'); // 'total' or 'individual'
  
  // Initialize booking data from quote
  const [bookingData, setBookingData] = useState({
    // Quote reference
    quoteId: quoteData?.id || '',
    requestId: quoteData?.requestId || '',
    serviceType: quoteData?.serviceType || 'ftl',
    
    // Origin - locked city/state/zip but editable company/address
    origin: {
      city: quoteData?.originCity || '',
      state: quoteData?.originState || '',
      zip: quoteData?.originZip || '',
      company: quoteData?.originCompany || '',
      address: '',
      address2: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      dockHours: '',
      notes: ''
    },
    
    // Destination - locked city/state/zip but editable company/address
    destination: {
      city: quoteData?.destCity || '',
      state: quoteData?.destState || '',
      zip: quoteData?.destZip || '',
      company: quoteData?.destCompany || '',
      address: '',
      address2: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      dockHours: '',
      notes: ''
    },
    
    // Shipment details
    pickupDate: quoteData?.pickupDate || '',
    deliveryDate: '',
    
    // Commodity info
    totalWeight: quoteData?.weight || '',
    totalPieces: quoteData?.pieces || '',
    description: '',
    commodityClass: quoteData?.freightClass || '50',
    
    // Individual items (if itemMode === 'individual')
    items: [
      {
        pieces: '',
        weight: '',
        length: '48',
        width: '40', 
        height: '48',
        description: ''
      }
    ],
    
    // Reference numbers (up to 4)
    referenceNumbers: [
      { type: 'PO Number', value: '' }
    ],
    
    // Special instructions
    specialInstructions: '',
    
    // Internal fields (set by Conship employee later)
    status: 'PENDING_CARRIER',
    carrier: null,
    rate: null,
    pickupNumber: null,
    etaToPickup: null
  });
  
  const referenceTypes = [
    'PO Number',
    'SO Number', 
    'Invoice Number',
    'Order Number',
    'Reference Number',
    'Job Number',
    'Customer Reference'
  ];

  // Handle adding reference numbers (max 4)
  const addReference = () => {
    if (bookingData.referenceNumbers.length < 4) {
      setBookingData(prev => ({
        ...prev,
        referenceNumbers: [...prev.referenceNumbers, { type: 'PO Number', value: '' }]
      }));
    }
  };

  const removeReference = (index) => {
    setBookingData(prev => ({
      ...prev,
      referenceNumbers: prev.referenceNumbers.filter((_, i) => i !== index)
    }));
  };

  const updateReference = (index, field, value) => {
    setBookingData(prev => {
      const newRefs = [...prev.referenceNumbers];
      newRefs[index] = { ...newRefs[index], [field]: value };
      return { ...prev, referenceNumbers: newRefs };
    });
  };

  // Handle adding individual items
  const addItem = () => {
    setBookingData(prev => ({
      ...prev,
      items: [...prev.items, {
        pieces: '',
        weight: '',
        length: '48',
        width: '40',
        height: '48',
        description: ''
      }]
    }));
  };

  const removeItem = (index) => {
    if (bookingData.items.length > 1) {
      setBookingData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index, field, value) => {
    setBookingData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Validate required fields
  const validateBooking = () => {
    const errors = [];
    
    // Origin validation
    if (!bookingData.origin.company) errors.push('Origin company name required');
    if (!bookingData.origin.address) errors.push('Origin address required');
    if (!bookingData.origin.contactName) errors.push('Origin contact name required');
    if (!bookingData.origin.contactPhone) errors.push('Origin contact phone required');
    
    // Destination validation
    if (!bookingData.destination.company) errors.push('Destination company name required');
    if (!bookingData.destination.address) errors.push('Destination address required');
    if (!bookingData.destination.contactName) errors.push('Destination contact name required');
    if (!bookingData.destination.contactPhone) errors.push('Destination contact phone required');
    
    // Shipment validation
    if (!bookingData.pickupDate) errors.push('Pickup date required');
    if (!bookingData.description) errors.push('Commodity description required');
    
    // Weight/pieces validation
    if (itemMode === 'total') {
      if (!bookingData.totalWeight) errors.push('Total weight required');
      if (!bookingData.totalPieces) errors.push('Total pieces required');
    } else {
      bookingData.items.forEach((item, i) => {
        if (!item.pieces || !item.weight) {
          errors.push(`Item ${i + 1}: pieces and weight required`);
        }
      });
    }
    
    return errors;
  };

  // Save booking
  const handleSave = async () => {
    const errors = validateBooking();
    if (errors.length > 0) {
      alert('Please complete required fields:\n' + errors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      // If using individual items, calculate totals
      let finalData = { ...bookingData };
      if (itemMode === 'individual') {
        const totalWeight = bookingData.items.reduce((sum, item) => 
          sum + (parseFloat(item.weight) || 0) * (parseInt(item.pieces) || 0), 0);
        const totalPieces = bookingData.items.reduce((sum, item) => 
          sum + (parseInt(item.pieces) || 0), 0);
        
        finalData.totalWeight = totalWeight;
        finalData.totalPieces = totalPieces;
      }

      const result = await bookingApi.createDetailedBooking(finalData);
      
      if (result.success) {
        alert('Booking saved successfully!');
        navigate(`/app/quotes/bookings`);
      } else {
        throw new Error(result.error || 'Failed to save booking');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save booking: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Complete Booking Details
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please provide all required information for your shipment
          </p>
        </div>

        {/* Origin Section */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <MapPin className="inline w-5 h-5 mr-2" />
            Origin Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locked location */}
            <div className={`col-span-2 p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Location: <span className="font-semibold">
                  {bookingData.origin.city}, {bookingData.origin.state} {bookingData.origin.zip}
                </span>
                <span className="ml-2 text-xs">(Cannot be changed)</span>
              </p>
            </div>

            {/* Company Name */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Company Name *
              </label>
              <input
                type="text"
                value={bookingData.origin.company}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, company: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Street Address *
              </label>
              <input
                type="text"
                value={bookingData.origin.address}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, address: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Address Line 2
              </label>
              <input
                type="text"
                value={bookingData.origin.address2}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, address2: e.target.value }
                }))}
                placeholder="Suite, Unit, Building, etc."
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="inline w-4 h-4 mr-1" />
                Contact Name *
              </label>
              <input
                type="text"
                value={bookingData.origin.contactName}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, contactName: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Phone className="inline w-4 h-4 mr-1" />
                Contact Phone *
              </label>
              <input
                type="tel"
                value={bookingData.origin.contactPhone}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, contactPhone: e.target.value }
                }))}
                placeholder="(555) 123-4567"
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail className="inline w-4 h-4 mr-1" />
                Contact Email
              </label>
              <input
                type="email"
                value={bookingData.origin.contactEmail}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, contactEmail: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Dock Hours */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="inline w-4 h-4 mr-1" />
                Dock/Pickup Hours
              </label>
              <input
                type="text"
                value={bookingData.origin.dockHours}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, dockHours: e.target.value }
                }))}
                placeholder="7:00 AM - 3:00 PM"
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Pickup Notes/Instructions
              </label>
              <textarea
                rows="2"
                value={bookingData.origin.notes}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  origin: { ...prev.origin, notes: e.target.value }
                }))}
                placeholder="Special pickup instructions, dock requirements, etc."
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Destination Section - Similar structure to Origin */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <MapPin className="inline w-5 h-5 mr-2" />
            Destination Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locked location */}
            <div className={`col-span-2 p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Location: <span className="font-semibold">
                  {bookingData.destination.city}, {bookingData.destination.state} {bookingData.destination.zip}
                </span>
                <span className="ml-2 text-xs">(Cannot be changed)</span>
              </p>
            </div>

            {/* Company Name */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Company Name *
              </label>
              <input
                type="text"
                value={bookingData.destination.company}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, company: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Street Address *
              </label>
              <input
                type="text"
                value={bookingData.destination.address}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, address: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Address Line 2
              </label>
              <input
                type="text"
                value={bookingData.destination.address2}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, address2: e.target.value }
                }))}
                placeholder="Suite, Unit, Building, etc."
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="inline w-4 h-4 mr-1" />
                Contact Name *
              </label>
              <input
                type="text"
                value={bookingData.destination.contactName}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, contactName: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Phone className="inline w-4 h-4 mr-1" />
                Contact Phone *
              </label>
              <input
                type="tel"
                value={bookingData.destination.contactPhone}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, contactPhone: e.target.value }
                }))}
                placeholder="(555) 123-4567"
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail className="inline w-4 h-4 mr-1" />
                Contact Email
              </label>
              <input
                type="email"
                value={bookingData.destination.contactEmail}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, contactEmail: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Dock Hours */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="inline w-4 h-4 mr-1" />
                Dock/Delivery Hours
              </label>
              <input
                type="text"
                value={bookingData.destination.dockHours}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, dockHours: e.target.value }
                }))}
                placeholder="8:00 AM - 5:00 PM"
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Delivery Notes/Instructions
              </label>
              <textarea
                rows="2"
                value={bookingData.destination.notes}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  destination: { ...prev.destination, notes: e.target.value }
                }))}
                placeholder="Special delivery instructions, receiving requirements, etc."
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Commodity Section */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Package className="inline w-5 h-5 mr-2" />
            Commodity Information
          </h2>

          {/* Mode Toggle */}
          <div className="mb-4">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="total"
                  checked={itemMode === 'total'}
                  onChange={(e) => setItemMode(e.target.value)}
                  className="mr-2"
                />
                Enter Total Weight & Pieces
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="individual"
                  checked={itemMode === 'individual'}
                  onChange={(e) => setItemMode(e.target.value)}
                  className="mr-2"
                />
                Enter Individual Item Details
              </label>
            </div>
          </div>

          {/* Description (always shown) */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Commodity Description *
            </label>
            <input
              type="text"
              value={bookingData.description}
              onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="General description of freight"
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          {/* Total Mode */}
          {itemMode === 'total' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total Pieces/Pallets *
                </label>
                <input
                  type="number"
                  value={bookingData.totalPieces}
                  onChange={(e) => setBookingData(prev => ({ ...prev, totalPieces: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total Weight (lbs) *
                </label>
                <input
                  type="number"
                  value={bookingData.totalWeight}
                  onChange={(e) => setBookingData(prev => ({ ...prev, totalWeight: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Freight Class
                </label>
                <input
                  type="text"
                  value={bookingData.commodityClass}
                  onChange={(e) => setBookingData(prev => ({ ...prev, commodityClass: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Individual Items Mode */}
          {itemMode === 'individual' && (
            <div className="space-y-4">
              {bookingData.items.map((item, index) => (
                <div key={index} className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Item {index + 1}
                    </h4>
                    {bookingData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Pieces *
                      </label>
                      <input
                        type="number"
                        value={item.pieces}
                        onChange={(e) => updateItem(index, 'pieces', e.target.value)}
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Weight per piece (lbs) *
                      </label>
                      <input
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateItem(index, 'weight', e.target.value)}
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Length (in)
                      </label>
                      <input
                        type="number"
                        value={item.length}
                        onChange={(e) => updateItem(index, 'length', e.target.value)}
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Width (in)
                      </label>
                      <input
                        type="number"
                        value={item.width}
                        onChange={(e) => updateItem(index, 'width', e.target.value)}
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Height (in)
                      </label>
                      <input
                        type="number"
                        value={item.height}
                        onChange={(e) => updateItem(index, 'height', e.target.value)}
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addItem}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>
          )}
        </div>

        {/* Reference Numbers */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Hash className="inline w-5 h-5 mr-2" />
            Reference Numbers
          </h2>
          
          <div className="space-y-3">
            {bookingData.referenceNumbers.map((ref, index) => (
              <div key={index} className="flex gap-3 items-center">
                <select
                  value={ref.type}
                  onChange={(e) => updateReference(index, 'type', e.target.value)}
                  className={`px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {referenceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Enter reference number"
                  value={ref.value}
                  onChange={(e) => updateReference(index, 'value', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                
                {bookingData.referenceNumbers.length > 1 && (
                  <button
                    onClick={() => removeReference(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {bookingData.referenceNumbers.length < 4 && (
              <button
                onClick={addReference}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Reference Number ({4 - bookingData.referenceNumbers.length} remaining)
              </button>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="inline w-5 h-5 mr-2" />
            Special Instructions
          </h2>
          
          <textarea
            rows="4"
            value={bookingData.specialInstructions}
            onChange={(e) => setBookingData(prev => ({ ...prev, specialInstructions: e.target.value }))}
            placeholder="Any special handling requirements, accessorial services needed, or other important information..."
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>

        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border ${
          isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Carrier Assignment Pending
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                After saving, a Conship representative will assign a carrier and provide pickup details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate('/app/quotes/history')}
            className={`px-6 py-2 rounded ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded flex items-center gap-2 ${
              saving 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600'
                  : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
