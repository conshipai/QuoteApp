import React, { useState } from 'react';
import { FileText, Download, Save, Plus, Trash2 } from 'lucide-react';

const BOLBuilder = ({ booking, isDarkMode }) => {
  const { confirmationNumber, pickupNumber, carrier, shipmentData } = booking;
  const formData = shipmentData.formData;
  
  const [bolData, setBolData] = useState({
    // Pre-fill from booking
    shipper: {
      name: '',
      address: '',
      city: formData.originCity,
      state: formData.originState,
      zip: formData.originZip,
      phone: '',
      contact: ''
    },
    consignee: {
      name: '',
      address: '',
      city: formData.destCity,
      state: formData.destState,
      zip: formData.destZip,
      phone: '',
      contact: ''
    },
    thirdParty: {
      enabled: false,
      name: '',
      address: '',
      city: '',
      state: '',
      zip: ''
    },
    specialInstructions: '',
    poNumber: '',
    referenceNumbers: [''],
    items: formData.commodities.map(c => ({
      quantity: c.quantity,
      unitType: c.unitType,
      weight: c.weight,
      class: c.useOverride ? c.overrideClass : c.calculatedClass,
      description: c.description,
      nmfc: '',
      hazmat: false
    }))
  });

  const updateShipper = (field, value) => {
    setBolData(prev => ({
      ...prev,
      shipper: { ...prev.shipper, [field]: value }
    }));
  };

  const updateConsignee = (field, value) => {
    setBolData(prev => ({
      ...prev,
      consignee: { ...prev.consignee, [field]: value }
    }));
  };

  const addReferenceNumber = () => {
    setBolData(prev => ({
      ...prev,
      referenceNumbers: [...prev.referenceNumbers, '']
    }));
  };

  const updateReferenceNumber = (index, value) => {
    setBolData(prev => {
      const refs = [...prev.referenceNumbers];
      refs[index] = value;
      return { ...prev, referenceNumbers: refs };
    });
  };

  const generateBOL = () => {
    console.log('Generating BOL with data:', bolData);
    alert('BOL Generated! In production, this would create a PDF.');
    // In production: Call API to generate PDF
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create Bill of Lading
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Booking: {confirmationNumber} | Pickup: {pickupNumber}
          </p>
        </div>

        {/* Shipper & Consignee */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shipper */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Shipper Information
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Company Name *"
                value={bolData.shipper.name}
                onChange={(e) => updateShipper('name', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="text"
                placeholder="Street Address *"
                value={bolData.shipper.address}
                onChange={(e) => updateShipper('address', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={bolData.shipper.city}
                  disabled
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
                <input
                  type="text"
                  value={bolData.shipper.state}
                  disabled
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
                <input
                  type="text"
                  value={bolData.shipper.zip}
                  disabled
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number *"
                value={bolData.shipper.phone}
                onChange={(e) => updateShipper('phone', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="text"
                placeholder="Contact Name"
                value={bolData.shipper.contact}
                onChange={(e) => updateShipper('contact', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Consignee */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Consignee Information
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Company Name *"
                value={bolData.consignee.name}
                onChange={(e) => updateConsignee('name', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="text"
                placeholder="Street Address *"
                value={bolData.consignee.address}
                onChange={(e) => updateConsignee('address', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={bolData.consignee.city}
                  disabled
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
                <input
                  type="text"
                  value={bolData.consignee.state}
                  disabled
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
                <input
                  type="text"
                  value={bolData.consignee.zip}
                  disabled
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number *"
                value={bolData.consignee.phone}
                onChange={(e) => updateConsignee('phone', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="text"
                placeholder="Contact Name"
                value={bolData.consignee.contact}
                onChange={(e) => updateConsignee('contact', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Reference Numbers */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Reference Numbers
            </h3>
            <button
              onClick={addReferenceNumber}
              className={`text-sm px-3 py-1 rounded flex items-center gap-1 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Reference
            </button>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="PO Number"
              value={bolData.poNumber}
              onChange={(e) => setBolData(prev => ({ ...prev, poNumber: e.target.value }))}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {bolData.referenceNumbers.map((ref, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Reference ${index + 1}`}
                value={ref}
                onChange={(e) => updateReferenceNumber(index, e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Special Instructions
          </h3>
          <textarea
            rows={3}
            placeholder="Enter any special handling instructions..."
            value={bolData.specialInstructions}
            onChange={(e) => setBolData(prev => ({ ...prev, specialInstructions: e.target.value }))}
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateBOL}
            className={`flex-1 px-6 py-3 rounded font-medium flex items-center justify-center gap-2 ${
              isDarkMode 
                ? 'bg-conship-orange text-white hover:bg-orange-600' 
                : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            <Download className="w-5 h-5" />
            Generate BOL PDF
          </button>
          
          <button
            className={`px-6 py-3 rounded font-medium flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOLBuilder;
