import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Download, Save, ArrowLeft, Building2, Plus, X, 
  MapPin, Phone, User, Mail, Hash, Trash2 
} from 'lucide-react';
import BOLTemplate from './BOLTemplate';
import bolApi from '../../services/bolApi';
import AddressBook from '../shared/AddressBook';
import addressBookApi from '../../services/addressBookApi';

const BOLBuilder = ({ booking, isDarkMode }) => {
  const bolRef = useRef();
  const [generating, setGenerating] = useState(false);
  const [bolNumber, setBolNumber] = useState(`BOL-${Date.now()}`);
  const [showAddressBook, setShowAddressBook] = useState(null); // 'shipper' or 'consignee'
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  // Reference number types
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
    bolNumber: bolNumber,
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
      { type: 'PO Number', value: '' }
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
      nmfc: '',
      hazmat: false
    })) || [],
    specialInstructions: '',
    pickupInstructions: '',
    deliveryInstructions: ''
  });

  // Load saved addresses on mount
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    const result = await addressBookApi.getCompanies();
    if (result.success) {
      setSavedAddresses(result.companies);
      
      // Auto-fill with defaults if they exist
      const defaultShipper = result.companies.find(c => c.type === 'shipper' && c.isDefault);
      const defaultConsignee = result.companies.find(c => c.type === 'consignee' && c.isDefault);
      
      if (defaultShipper) {
        handleAddressSelect(defaultShipper, 'shipper');
      }
      if (defaultConsignee) {
        handleAddressSelect(defaultConsignee, 'consignee');
      }
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

  const handleReferenceChange = (index, field, value) => {
    setBolData(prev => {
      const newRefs = [...prev.referenceNumbers];
      newRefs[index][field] = value;
      return { ...prev, referenceNumbers: newRefs };
    });
  };

  // Print function
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

  const handleSave = async () => {
    // Validate required fields
    const errors = [];
    if (!bolData.shipper.name) errors.push('Shipper company name is required');
    if (!bolData.shipper.address) errors.push('Shipper address is required');
    if (!bolData.consignee.name) errors.push('Consignee company name is required');
    if (!bolData.consignee.address) errors.push('Consignee address is required');
    
    if (errors.length > 0) {
      alert('Please complete required fields:\n' + errors.join('\n'));
      return;
    }

    setGenerating(true);
    try {
      // Capture the BOL HTML content
      const bolElement = document.getElementById('bol-template');
      let htmlContent = '';
      if (bolElement) {
        // Clone the element to avoid modifying the original
        const clonedElement = bolElement.cloneNode(true);
        htmlContent = clonedElement.outerHTML;
      }

      const result = await bolApi.createBOL({
        bookingId: booking.bookingId,
        bolNumber: bolNumber,
        bolData: bolData,
        htmlContent: htmlContent // Include the HTML content
      });
      
      if (result.success) {
        alert(`BOL ${bolNumber} saved successfully!\n\nYou can view this BOL anytime from the Bookings page.`);
        
        // Optionally save addresses if they're new
        if (window.confirm('Would you like to save these addresses for future use?')) {
          if (!savedAddresses.find(a => 
            a.name === bolData.shipper.name && 
            a.address === bolData.shipper.address
          )) {
            await addressBookApi.saveCompany({
              ...bolData.shipper,
              type: 'shipper'
            });
          }
          if (!savedAddresses.find(a => 
            a.name === bolData.consignee.name && 
            a.address === bolData.consignee.address
          )) {
            await addressBookApi.saveCompany({
              ...bolData.consignee,
              type: 'consignee'
            });
          }
        }
      }
    } catch (error) {
      alert('Failed to save BOL: ' + error.message);
    }
    setGenerating(false);
  };

  const AddressForm = ({ type, data, onChange }) => {
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
              readOnly={data.city !== ''}
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
                readOnly={data.state !== ''}
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
                readOnly={data.zip !== ''}
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
  };

  const handleAddressChange = (type, field, value) => {
    setBolData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-60"
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
          <AddressForm type="shipper" data={bolData.shipper} onChange={handleAddressChange} />
          <AddressForm type="consignee" data={bolData.consignee} onChange={handleAddressChange} />
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

        {/* BOL Preview */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div id="bol-template" ref={bolRef} className="print:bg-white">
            <BOLTemplate 
              bolData={bolData}
              booking={booking}
              isDarkMode={false}
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

      {/* Print Styles */}
      <style>{`
        @media print {
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
          }
          @page {
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
};

export default BOLBuilder;
