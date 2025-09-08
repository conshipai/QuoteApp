// src/components/bol/BOLBuilder.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, Save, Building2, Plus, X, 
  MapPin, Phone, User, Mail, Hash, Trash2, AlertTriangle 
} from 'lucide-react';
import BOLTemplate from './BOLTemplate';
import bolApi from '../../services/bolApi';
import AddressBook from '../shared/AddressBook';
import addressBookApi from '../../services/addressBookApi';

const AddressForm = React.memo(({ type, data, onChange, isDarkMode, setShowAddressBook }) => {
  const isShipper = type === 'shipper';
  const title = isShipper ? 'Shipper Information' : 'Consignee Information';
  
  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <MapPin className="inline w-5 h-5 mr-2" />
          {title}
        </h2>
        <button
          onClick={() => setShowAddressBook(type)}
          className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-conship-orange text-white hover:bg-orange-600' 
              : 'bg-conship-purple text-white hover:bg-purple-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Select from Address Book
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Company Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange(type, 'name', e.target.value)}
            placeholder="Enter company name"
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div className="col-span-2">
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Street Address *
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange(type, 'address', e.target.value)}
            placeholder="Enter street address"
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            City *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange(type, 'city', e.target.value)}
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              State *
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange(type, 'state', e.target.value)}
              maxLength="2"
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              ZIP *
            </label>
            <input
              type="text"
              value={data.zip}
              onChange={(e) => onChange(type, 'zip', e.target.value)}
              maxLength="5"
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <User className="inline w-4 h-4 mr-1" />
            Contact Name
          </label>
          <input
            type="text"
            value={data.contact}
            onChange={(e) => onChange(type, 'contact', e.target.value)}
            placeholder="Contact person"
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Phone className="inline w-4 h-4 mr-1" />
            Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange(type, 'phone', e.target.value)}
            placeholder="(555) 123-4567"
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Mail className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange(type, 'email', e.target.value)}
            placeholder="email@example.com"
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Dock Hours / Notes
          </label>
          <input
            type="text"
            value={data.hours}
            onChange={(e) => onChange(type, 'hours', e.target.value)}
            placeholder="7AM-3PM, Appt required"
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>
    </div>
  );
});

const ItemsSection = React.memo(({ bolData, isDarkMode, handleItemChange }) => {
  const hasHazmat = bolData.items.some(item => item.hazmat);
  
  return (
    <>
      <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm print:hidden`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Commodity Items
        </h2>
        
        <div className="space-y-4">
          {bolData.items.map((item, index) => (
            <div key={index} className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Qty
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Unit Type
                  </label>
                  <select
                    value={item.unitType}
                    onChange={(e) => handleItemChange(index, 'unitType', e.target.value)}
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option>Pallets</option>
                    <option>Boxes</option>
                    <option>Crates</option>
                    <option>Skids</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Class
                  </label>
                  <input
                    type="text"
                    value={item.class}
                    onChange={(e) => handleItemChange(index, 'class', e.target.value)}
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    NMFC #
                  </label>
                  <input
                    type="text"
                    value={item.nmfc}
                    onChange={(e) => handleItemChange(index, 'nmfc', e.target.value)}
                    placeholder="Optional"
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={item.hazmat}
                    onChange={(e) => handleItemChange(index, 'hazmat', e.target.checked)}
                    className="mr-2"
                  />
                  <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                  Hazmat
                </label>
              </div>
              
              {item.hazmat && (
                <div className={`mt-3 p-3 border-2 border-yellow-500 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    Hazmat Details Required
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        UN Number *
                      </label>
                      <input
                        type="text"
                        value={item.hazmatDetails?.unNumber || ''}
                        onChange={(e) => handleItemChange(index, 'hazmatDetails.unNumber', e.target.value)}
                        placeholder="UN1203"
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Proper Shipping Name *
                      </label>
                      <input
                        type="text"
                        value={item.hazmatDetails?.properShippingName || ''}
                        onChange={(e) => handleItemChange(index, 'hazmatDetails.properShippingName', e.target.value)}
                        placeholder="Gasoline"
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Hazard Class *
                      </label>
                      <input
                        type="text"
                        value={item.hazmatDetails?.hazardClass || ''}
                        onChange={(e) => handleItemChange(index, 'hazmatDetails.hazardClass', e.target.value)}
                        placeholder="3"
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Packing Group *
                      </label>
                      <select
                        value={item.hazmatDetails?.packingGroup || ''}
                        onChange={(e) => handleItemChange(index, 'hazmatDetails.packingGroup', e.target.value)}
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="">Select</option>
                        <option value="N/A">N/A</option>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Packaging Details
                      </label>
                      <input
                        type="text"
                        value={item.hazmatDetails?.packingDetails || ''}
                        onChange={(e) => handleItemChange(index, 'hazmatDetails.packingDetails', e.target.value)}
                        placeholder="4 Drums"
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        24-Hour Emergency Phone
                      </label>
                      <input
                        type="text"
                        value={item.hazmatDetails?.emergencyPhone || ''}
                        onChange={(e) => handleItemChange(index, 'hazmatDetails.emergencyPhone', e.target.value)}
                        placeholder="1-800-424-9300"
                        className={`w-full px-2 py-1 rounded border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {hasHazmat && (
        <div className={`mb-6 p-6 rounded-lg border-2 border-yellow-500 ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} shadow-sm print:hidden`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
            <AlertTriangle className="inline w-5 h-5 mr-2" />
            Hazmat Shipper Certification Required
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
            This is to certify that the above-named materials are properly classified, described, packaged, marked, 
            and labeled, and are in proper condition for transportation according to the applicable regulations of 
            the Department of Transportation.
          </p>
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Shipper Name (Print)
            </label>
            <input
              type="text"
              placeholder="Enter shipper's printed name"
              className={`w-full max-w-md px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      )}
    </>
  );
});

const BOLBuilder = ({ booking, isDarkMode, onComplete }) => {
  const bolRef = useRef();
  const [generating, setGenerating] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  const quoteNumber = booking?.quoteNumber || booking?.requestNumber || '';
  const defaultBolNumber = quoteNumber.startsWith('Q') 
    ? quoteNumber.substring(1) 
    : quoteNumber || `BOL-${Date.now()}`;
  
  const [bolNumber, setBolNumber] = useState(defaultBolNumber);

  const accessorialNotes = [];
  if (booking?.shipmentData?.formData?.liftgatePickup) accessorialNotes.push('Liftgate at Pickup');
  if (booking?.shipmentData?.formData?.liftgateDelivery) accessorialNotes.push('Liftgate at Delivery');
  if (booking?.shipmentData?.formData?.residentialDelivery) accessorialNotes.push('Residential Delivery');
  if (booking?.shipmentData?.formData?.insideDelivery) accessorialNotes.push('Inside Delivery');
  if (booking?.shipmentData?.formData?.limitedAccessPickup) accessorialNotes.push('Limited Access Pickup');
  if (booking?.shipmentData?.formData?.limitedAccessDelivery) accessorialNotes.push('Limited Access Delivery');

  const initialAccessorialText =
    accessorialNotes.length > 0 ? `ACCESSORIALS: ${accessorialNotes.join(', ')}` : '';

  const referenceTypes = [
    'PO Number',
    'SO Number',
    'Work Order',
    'Invoice Number',
    'PRO Number',
    'Pickup Number',
    'Delivery Number',
    'Customer Reference',
    'Vendor Reference',
    'Job Number',
    'Project Code',
    'Custom'
  ];

  const [bolData, setBolData] = useState({
    bolNumber: defaultBolNumber,
    shipper: {
      name: booking?.shipmentData?.formData?.originCompany || '',
      address: booking?.shipmentData?.formData?.originAddress || '',
      city: booking?.shipmentData?.formData?.originCity || '',
      state: booking?.shipmentData?.formData?.originState || '',
      zip: booking?.shipmentData?.formData?.originZip || '',
      phone: '',
      contact: '',
      email: '',
      hours: ''
    },
    consignee: {
      name: booking?.shipmentData?.formData?.destCompany || '',
      address: booking?.shipmentData?.formData?.destAddress || '',
      city: booking?.shipmentData?.formData?.destCity || '',
      state: booking?.shipmentData?.formData?.destState || '',
      zip: booking?.shipmentData?.formData?.destZip || '',
      phone: '',
      contact: '',
      email: '',
      hours: ''
    },
    referenceNumbers: [
      { type: 'PO Number', value: '' },
      ...(booking?.carrier === 'Southeastern Freight Lines' && booking?.pickupNumber 
        ? [{ type: 'Pickup Number', value: booking.pickupNumber }]
        : []
      )
    ],
    items: booking?.shipmentData?.formData?.commodities?.map(c => ({
      quantity: c.quantity,
      unitType: c.unitType,
      description: c.description || 'General Freight',
      weight: c.weight,
      length: c.length || '',
      width: c.width || '',
      height: c.height || '',
      class: c.useOverride ? c.overrideClass : c.calculatedClass,
      nmfc: c.nmfc || '',
      hazmat: c.hazmat || false,
      hazmatDetails: c.hazmat ? {
        unNumber: '',
        properShippingName: '',
        hazardClass: '',
        packingGroup: '',
        packingDetails: '',
        totalWeight: c.weight,
        emergencyPhone: '1-800-424-9300'
      } : null
    })) || [],
    specialInstructions: initialAccessorialText,
    pickupInstructions: '',
    deliveryInstructions: '',
    accessorials: {
      liftgatePickup: booking?.shipmentData?.formData?.liftgatePickup || false,
      liftgateDelivery: booking?.shipmentData?.formData?.liftgateDelivery || false,
      residentialDelivery: booking?.shipmentData?.formData?.residentialDelivery || false,
      insideDelivery: booking?.shipmentData?.formData?.insideDelivery || false,
      limitedAccessPickup: booking?.shipmentData?.formData?.limitedAccessPickup || false,
      limitedAccessDelivery: booking?.shipmentData?.formData?.limitedAccessDelivery || false
    }
  });

  useEffect(() => {
    loadSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSavedAddresses = async () => {
    const result = await addressBookApi.getCompanies();
    if (result.success) {
      setSavedAddresses(result.companies);
    }
  };

  const handleAddressSelect = (company, type) => {
    setBolData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        name: company.name,
        address: company.address,
        city: company.city,
        state: company.state,
        zip: company.zip,
        phone: company.phone || '',
        contact: company.contact || '',
        email: company.email || '',
        hours: company.notes || ''
      }
    }));
    setShowAddressBook(null);
  };

  const handleAddReference = () => {
    setBolData(prev => ({
      ...prev,
      referenceNumbers: [...prev.referenceNumbers, { type: 'PO Number', value: '' }]
    }));
  };

  const handleRemoveReference = (index) => {
    setBolData(prev => ({
      ...prev,
      referenceNumbers: prev.referenceNumbers.filter((_, i) => i !== index)
    }));
  };

  const handleReferenceChange = useCallback((index, field, value) => {
    setBolData(prev => {
      const newRefs = [...prev.referenceNumbers];
      newRefs[index] = { ...newRefs[index], [field]: value };
      return { ...prev, referenceNumbers: newRefs };
    });
  }, []);

  const handleAddressChange = useCallback((type, field, value) => {
    setBolData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setBolData(prev => {
      const newItems = [...prev.items];
      if (field === 'hazmat') {
        newItems[index] = {
          ...newItems[index],
          hazmat: value,
          hazmatDetails: value ? {
            unNumber: '',
            properShippingName: '',
            hazardClass: '',
            packingGroup: '',
            packingDetails: '',
            totalWeight: newItems[index].weight,
            emergencyPhone: '1-800-424-9300'
          } : null
        };
      } else if (field.startsWith('hazmatDetails.')) {
        const hazmatField = field.replace('hazmatDetails.', '');
        newItems[index] = {
          ...newItems[index],
          hazmatDetails: {
            ...newItems[index].hazmatDetails,
            [hazmatField]: value
          }
        };
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]: value
        };
      }
      return { ...prev, items: newItems };
    });
  }, []);

  const handlePrint = () => {
    const node = document.getElementById('bol-template');
    if (!node) {
      alert('BOL content is not ready to print.');
      return;
    }
    const prevTitle = document.title;
    document.title = bolData.bolNumber || 'Bill of Lading';
    window.print();
    document.title = prevTitle;
  };

  // Save / Generate PDF and upload
  const handleSave = async () => {
    const errors = [];
    if (!bolData.shipper.name) errors.push('Shipper company name is required');
    if (!bolData.shipper.address) errors.push('Shipper address is required');
    if (!bolData.consignee.name) errors.push('Consignee company name is required');
    if (!bolData.consignee.address) errors.push('Consignee address is required');

    bolData.items.forEach((item, index) => {
      if (item.hazmat && item.hazmatDetails) {
        if (!item.hazmatDetails.unNumber) errors.push(`Item ${index + 1}: UN Number required for hazmat`);
        if (!item.hazmatDetails.properShippingName) errors.push(`Item ${index + 1}: Proper shipping name required`);
        if (!item.hazmatDetails.hazardClass) errors.push(`Item ${index + 1}: Hazard class required`);
      }
    });

    if (errors.length > 0) {
      alert('Please complete required fields:\n' + errors.join('\n'));
      return;
    }

    setGenerating(true);
    try {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          setTimeout(reject, 5000);
        });
        console.log('html2pdf library loaded dynamically');
      }

      const bolElement = document.getElementById('bol-template');
      if (!bolElement) throw new Error('BOL template not found in DOM');

      const clonedElement = bolElement.cloneNode(true);
      const htmlContent = clonedElement.outerHTML;

      const requestNumber = booking?.requestNumber || booking?.requestId;
      if (!requestNumber) throw new Error('Request number not found in booking data');

      console.log('Creating BOL with request number:', requestNumber);

      const result = await bolApi.createBOL({
        bookingId: booking.bookingId,
        bolNumber: bolNumber,
        bolData: bolData,
        htmlContent: htmlContent,
        bookingData: booking // ✅ pass booking directly
      });

      if (result.success) {
        if (typeof onComplete === 'function') onComplete();
      } else {
        throw new Error(result.error || 'BOL creation failed');
      }
    } catch (error) {
      console.error('Failed to save BOL:', error);
      alert(`Failed to save BOL:\n${error.message}\n\nPlease check:\n1. html2pdf library is loaded\n2. BOL template is rendered\n3. Network connection is active`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Controls */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Complete Bill of Lading Information
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print BOL
            </button>
            <button
              onClick={handleSave}
              disabled={generating}
              className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors ${
                generating 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                  : 'bg-green-500 text-white hover:bg-green-600 border border-green-600 shadow-sm'
              }`}
              style={{ color: generating ? '#e5e5e5' : '#ffffff' }}
            >
              <Save className="w-4 h-4" />
              {generating ? 'Saving...' : 'Save BOL'}
            </button>
          </div>
        </div>

        {/* BOL Number */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm print:hidden`}>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            BOL Number
          </label>
          <input
            type="text"
            value={bolNumber}
            onChange={(e) => {
              setBolNumber(e.target.value);
              setBolData(prev => ({ ...prev, bolNumber: e.target.value }));
            }}
            className={`px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Address Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:hidden">
          <AddressForm type="shipper" data={bolData.shipper} onChange={handleAddressChange} isDarkMode={isDarkMode} setShowAddressBook={setShowAddressBook} />
          <AddressForm type="consignee" data={bolData.consignee} onChange={handleAddressChange} isDarkMode={isDarkMode} setShowAddressBook={setShowAddressBook} />
        </div>

        {/* Reference Numbers */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm print:hidden`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Hash className="inline w-5 h-5 mr-2" />
              Reference Numbers
            </h2>
            <button
              onClick={handleAddReference}
              className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Reference
            </button>
          </div>

          <div className="space-y-3">
            {bolData.referenceNumbers.map((ref, index) => (
              <div key={index} className="flex gap-3 items-center">
                <select
                  value={ref.type}
                  onChange={(e) => handleReferenceChange(index, 'type', e.target.value)}
                  className={`px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {referenceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                {ref.type === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Custom label"
                    value={ref.customLabel || ''}
                    onChange={(e) => handleReferenceChange(index, 'customLabel', e.target.value)}
                    className={`px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                )}
                
                <input
                  type="text"
                  placeholder="Enter reference number"
                  value={ref.value}
                  onChange={(e) => handleReferenceChange(index, 'value', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                
                {bolData.referenceNumbers.length > 1 && (
                  <button
                    onClick={() => handleRemoveReference(index)}
                    className="p-2 rounded hover:bg-red-100 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Items Section with Hazmat */}
        <ItemsSection bolData={bolData} isDarkMode={isDarkMode} handleItemChange={handleItemChange} />

        {/* Special Instructions */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm print:hidden`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Special Instructions
          </h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                General Instructions
              </label>
              <textarea
                rows="2"
                value={bolData.specialInstructions}
                onChange={(e) => setBolData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Any special handling or delivery instructions"
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pickup Instructions
                </label>
                <textarea
                  rows="2"
                  value={bolData.pickupInstructions}
                  onChange={(e) => setBolData(prev => ({ ...prev, pickupInstructions: e.target.value }))}
                  placeholder="Check in at office, use dock door 3"
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Delivery Instructions
                </label>
                <textarea
                  rows="2"
                  value={bolData.deliveryInstructions}
                  onChange={(e) => setBolData(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                  placeholder="Call 30 min before arrival"
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOL Preview — ALWAYS render as white/black and printable */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div ref={bolRef} className="print:bg-white">
            <BOLTemplate 
              bolData={bolData}
              booking={booking}
              isDarkMode={false}  // ALWAYS pass false to BOL template
            />
          </div>
        </div>
      </div>

      {/* Address Book Modal */}
      {showAddressBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-4xl w-full max-h-[80vh] overflow-y-auto rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select {showAddressBook === 'shipper' ? 'Shipper' : 'Consignee'} Address
              </h2>
              <button
                onClick={() => setShowAddressBook(null)}
                className={`p-2 rounded hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <AddressBook
              isDarkMode={isDarkMode}
              onSelect={(company) => handleAddressSelect(company, showAddressBook)}
              type={showAddressBook}
            />
          </div>
        </div>
      )}

      {/* Print Styles — target only #bol-template */}
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          #bol-template, #bol-template * {
            visibility: visible;
          }
          
          #bol-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }

        /* Force BOL template to always have white background and black text */
        #bol-template {
          background-color: white !important;
          color: black !important;
        }
        #bol-template * {
          color: black !important;
          background-color: transparent !important;
        }
        #bol-template .bg-gray-100 { background-color: #f3f4f6 !important; }
        #bol-template .bg-gray-200 { background-color: #e5e7eb !important; }
        #bol-template .border-black { border-color: black !important; }
        #bol-template input,
        #bol-template select,
        #bol-template textarea {
          color: black !important;
          background-color: white !important;
        }
      `}</style>
    </div>
  );
};

export default BOLBuilder;
