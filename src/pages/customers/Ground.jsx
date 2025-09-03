// src/pages/customers/Ground.jsx
import quoteApi from '../../services/quoteApi';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, X } from 'lucide-react';
import LocationSection from '../../components/ground/LocationSection';
import CommodityList from '../../components/ground/CommodityList';
import AccessorialOptions from '../../components/ground/AccessorialOptions';
import ServiceTypeSelector from '../../components/ground/ServiceTypeSelector';
import GroundQuoteResults from '../../components/ground/QuoteResults';
import AddressBook from '../../components/shared/AddressBook';
import addressBookApi from '../../services/addressBookApi';
import { calculateDensity } from '../../components/ground/constants';

const Ground = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();

  // UI state
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState(null);
  const [zipLoading, setZipLoading] = useState({ origin: false, dest: false });
  const [showAddressBook, setShowAddressBook] = useState(null); // 'origin' or 'destination' or null
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Origin
    originZip: '',
    originCity: '',
    originState: '',
    originAddress: '',
    originCompany: '',
    // Destination
    destZip: '',
    destCity: '',
    destState: '',
    destAddress: '',
    destCompany: '',
    // Pickup
    pickupDate: '',
    // Commodities
    commodities: [
      {
        unitType: 'Pallets',
        quantity: '1',
        weight: '',
        length: '',
        width: '',
        height: '',
        description: '',
        calculatedClass: '',
        overrideClass: '',
        useOverride: false,
        density: null,
        cubicFeet: null
      }
    ],
    // Accessorials
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false
  });

  // Load saved addresses on component mount
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    const result = await addressBookApi.getCompanies();
    if (result.success) {
      setSavedAddresses(result.companies);
      
      // Auto-fill with default shipper if exists
      const defaultShipper = result.companies.find(c => c.type === 'shipper' && c.isDefault);
      if (defaultShipper) {
        handleAddressSelect(defaultShipper, 'origin');
      }
    }
  };

  const handleAddressSelect = (company, type) => {
    if (type === 'origin') {
      setFormData(prev => ({
        ...prev,
        originZip: company.zip,
        originCity: company.city,
        originState: company.state,
        originAddress: company.address,
        originCompany: company.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        destZip: company.zip,
        destCity: company.city,
        destState: company.state,
        destAddress: company.address,
        destCompany: company.name
      }));
    }
    setShowAddressBook(null);
  };

  // ----- Handlers -----
  const handleCommodityChange = (index, field, value) => {
    setFormData(prev => {
      const newCommodities = [...prev.commodities];
      newCommodities[index][field] = value;

      if (['weight', 'length', 'width', 'height', 'quantity'].includes(field)) {
        const densityData = calculateDensity(newCommodities[index]);
        newCommodities[index] = { ...newCommodities[index], ...densityData };
      }

      return { ...prev, commodities: newCommodities };
    });
  };

  const addCommodity = () => {
    setFormData(prev => ({
      ...prev,
      commodities: [
        ...prev.commodities,
        {
          unitType: 'Pallets',
          quantity: '1',
          weight: '',
          length: '',
          width: '',
          height: '',
          description: '',
          calculatedClass: '',
          overrideClass: '',
          useOverride: false,
          density: null,
          cubicFeet: null
        }
      ]
    }));
  };

  const removeCommodity = (index) => {
    setFormData(prev => {
      if (prev.commodities.length > 1) {
        const newCommodities = prev.commodities.filter((_, i) => i !== index);
        return { ...prev, commodities: newCommodities };
      }
      return prev;
    });
  };

  const toggleClassOverride = (index) => {
    setFormData(prev => {
      const newCommodities = [...prev.commodities];
      newCommodities[index].useOverride = !newCommodities[index].useOverride;
      if (!newCommodities[index].useOverride) {
        newCommodities[index].overrideClass = '';
      }
      return { ...prev, commodities: newCommodities };
    });
  };

  const handleAccessorialChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // ===== Updated handleSubmit to use real API method =====
  const handleSubmit = async () => {
    const errors = [];
    if (!formData.originZip) errors.push('Origin ZIP required');
    if (!formData.originCity) errors.push('Origin city required');
    if (!formData.originState) errors.push('Origin state required');
    if (!formData.destZip) errors.push('Destination ZIP required');
    if (!formData.destCity) errors.push('Destination city required');
    if (!formData.destState) errors.push('Destination state required');
    if (!formData.pickupDate) errors.push('Pickup date required');

    formData.commodities.forEach((item, index) => {
      if (!item.weight) errors.push(`Item ${index + 1}: Weight required`);
      if (!item.length || !item.width || !item.height) {
        errors.push(`Item ${index + 1}: All dimensions required`);
      }
    });

    if (errors.length > 0) {
      alert('Please fix:\n' + errors.join('\n'));
      return;
    }

    setLoading(true);

    // Include ALL form data including company/address info
    const completeFormData = {
      ...formData,
      // Ensure all address fields are included
      originCompany: formData.originCompany || '',
      originAddress: formData.originAddress || '',
      destCompany: formData.destCompany || '',
      destAddress: formData.destAddress || ''
    };

    // USE THE NEW API METHOD with complete data
    const result = await quoteApi.createGroundQuoteRequest(completeFormData, serviceType);

    if (result.success) {
      // Store the complete form data for later use in booking
      localStorage.setItem(`quote_formdata_${result.requestId}`, JSON.stringify(completeFormData));
      
      setQuoteRequest({
        requestId: result.requestId,
        requestNumber: result.requestNumber
      });
      setShowResults(true);
    } else {
      alert('Failed to create quote request: ' + (result.error || 'Unknown error'));
    }

    setLoading(false);
  };

  // Enhanced LocationSection component with Address Book button
  const EnhancedLocationSection = ({ type, ...props }) => {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => setShowAddressBook(type)}
            className={`px-3 py-1 rounded flex items-center gap-2 text-sm ${
              isDarkMode 
                ? 'bg-conship-orange text-white hover:bg-orange-600' 
                : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
            title="Select from Address Book"
          >
            <Building2 className="w-4 h-4" />
            Address Book
          </button>
        </div>
        <LocationSection type={type} {...props} />
        
        {/* Show company name if selected from address book */}
        {((type === 'origin' && formData.originCompany) || 
          (type === 'destination' && formData.destCompany)) && (
          <div className={`mt-2 px-3 py-2 rounded ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {type === 'origin' ? formData.originCompany : formData.destCompany}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {type === 'origin' ? formData.originAddress : formData.destAddress}
                </p>
              </div>
              <button
                onClick={() => {
                  if (type === 'origin') {
                    setFormData(prev => ({
                      ...prev,
                      originCompany: '',
                      originAddress: ''
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      destCompany: '',
                      destAddress: ''
                    }));
                  }
                }}
                className={`p-1 rounded hover:bg-gray-600`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----- Early returns -----

  // 1) No service type selected: show selector
  if (!serviceType) {
    return (
      <ServiceTypeSelector
        onSelect={setServiceType}
        isDarkMode={isDarkMode}
      />
    );
  }

  // 2) Show results page (GroundQuoteResults)
  if (showResults && quoteRequest) {
    return (
      <GroundQuoteResults
        requestId={quoteRequest.requestId}
        requestNumber={quoteRequest.requestNumber}
        serviceType={serviceType}
        formData={formData}
        onBack={() => {
          setShowResults(false);
          setQuoteRequest(null);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // 3) Main screen (form)
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {serviceType.toUpperCase()} Freight Quote
            </h1>
            <button
              onClick={() => setServiceType(null)}
              className={`text-sm px-3 py-1 rounded ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ← Change Service Type
            </button>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select from address book or enter 5-digit ZIP codes for automatic city/state lookup
          </p>
        </div>

        {/* Origin & Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Origin */}
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => setShowAddressBook('origin')}
                className={`px-3 py-1 rounded flex items-center gap-2 text-sm ${
                  isDarkMode 
                    ? 'bg-conship-orange text-white hover:bg-orange-600' 
                    : 'bg-conship-purple text-white hover:bg-purple-700'
                }`}
                title="Select from Address Book"
              >
                <Building2 className="w-4 h-4" />
                Address Book
              </button>
            </div>
            <LocationSection
              type="origin"
              zip={formData.originZip}
              city={formData.originCity}
              state={formData.originState}
              onZipChange={(value) => setFormData(prev => ({ ...prev, originZip: value }))}
              onCityChange={(value) => setFormData(prev => ({ ...prev, originCity: value }))}
              onStateChange={(value) => setFormData(prev => ({ ...prev, originState: value }))}
              isDarkMode={isDarkMode}
              loading={zipLoading.origin}
              onSetLoading={(loading) => setZipLoading(prev => ({ ...prev, origin: loading }))}
            />
            
            {/* Show company name if selected from address book */}
            {formData.originCompany && (
              <div className={`mt-2 px-3 py-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formData.originCompany}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.originAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        originCompany: '',
                        originAddress: ''
                      }));
                    }}
                    className={`p-1 rounded hover:bg-gray-600`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => setShowAddressBook('destination')}
                className={`px-3 py-1 rounded flex items-center gap-2 text-sm ${
                  isDarkMode 
                    ? 'bg-conship-orange text-white hover:bg-orange-600' 
                    : 'bg-conship-purple text-white hover:bg-purple-700'
                }`}
                title="Select from Address Book"
              >
                <Building2 className="w-4 h-4" />
                Address Book
              </button>
            </div>
            <LocationSection
              type="destination"
              zip={formData.destZip}
              city={formData.destCity}
              state={formData.destState}
              onZipChange={(value) => setFormData(prev => ({ ...prev, destZip: value }))}
              onCityChange={(value) => setFormData(prev => ({ ...prev, destCity: value }))}
              onStateChange={(value) => setFormData(prev => ({ ...prev, destState: value }))}
              isDarkMode={isDarkMode}
              loading={zipLoading.dest}
              onSetLoading={(loading) => setZipLoading(prev => ({ ...prev, dest: loading }))}
            />
            
            {/* Show company name if selected from address book */}
            {formData.destCompany && (
              <div className={`mt-2 px-3 py-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formData.destCompany}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.destAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        destCompany: '',
                        destAddress: ''
                      }));
                    }}
                    className={`p-1 rounded hover:bg-gray-600`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pickup Date */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center mb-4">
            <Calendar className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Pickup Date
            </h2>
          </div>

          <input
            type="date"
            value={formData.pickupDate}
            onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className={`px-3 py-2 rounded border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Commodities */}
        <CommodityList
          commodities={formData.commodities}
          onCommodityChange={handleCommodityChange}
          onAddCommodity={addCommodity}
          onRemoveCommodity={removeCommodity}
          onToggleOverride={toggleClassOverride}
          isDarkMode={isDarkMode}
        />

        {/* Accessorials */}
        <AccessorialOptions
          accessorials={formData}
          onChange={handleAccessorialChange}
          isDarkMode={isDarkMode}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/app/quotes')}
            className={`px-6 py-2 rounded font-medium ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded font-medium ${
              loading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-conship-orange text-white hover:bg-orange-600'
                  : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Quote'}
          </button>
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
                Select {showAddressBook === 'origin' ? 'Origin' : 'Destination'} Address
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
              type={showAddressBook === 'origin' ? 'shipper' : 'consignee'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Ground;
