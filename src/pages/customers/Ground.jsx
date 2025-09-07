// src/pages/customers/Ground.jsx - FIXED VERSION
import quoteApi from '../../services/quoteApi';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, X, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState(null);
  const [zipLoading, setZipLoading] = useState({ origin: false, dest: false });
  const [showAddressBook, setShowAddressBook] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(null);

  // Form state - with default test values for easier testing
  const [formData, setFormData] = useState({
    // Origin - Default test values
    originZip: '77002',
    originCity: 'Houston',
    originState: 'TX',
    originAddress: '',
    originCompany: '',
    // Destination - Default test values
    destZip: '75201',
    destCity: 'Dallas',
    destState: 'TX',
    destAddress: '',
    destCompany: '',
    // Pickup - Default to tomorrow
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    // Commodities - Default test commodity
    commodities: [
      {
        unitType: 'Pallets',
        quantity: '2',
        weight: '1000',
        length: '48',
        width: '40',
        height: '48',
        description: 'General Freight',
        calculatedClass: '',
        overrideClass: '',
        useOverride: false,
        density: null,
        cubicFeet: null,
        nmfc: '',
        hazmat: false,
        hazmatDetails: null,
        notes: ''
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

  // Calculate density on component mount for default values
  useEffect(() => {
    if (formData.commodities[0].weight && formData.commodities[0].length) {
      const densityData = calculateDensity(formData.commodities[0]);
      setFormData(prev => ({
        ...prev,
        commodities: [{
          ...prev.commodities[0],
          ...densityData
        }]
      }));
    }
  }, []);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const result = await addressBookApi.getCompanies();
      if (result?.success) {
        setSavedAddresses(result.companies || []);

        // Auto-fill with default shipper if exists
        const defaultShipper = (result.companies || []).find(
          (c) => c.type === 'shipper' && c.isDefault
        );
        if (defaultShipper) handleAddressSelect(defaultShipper, 'origin');
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleAddressSelect = (company, type) => {
    if (!company) return;
    if (type === 'origin') {
      setFormData((prev) => ({
        ...prev,
        originZip: company.zip || '',
        originCity: company.city || '',
        originState: company.state || '',
        originAddress: company.address || '',
        originCompany: company.name || ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        destZip: company.zip || '',
        destCity: company.city || '',
        destState: company.state || '',
        destAddress: company.address || '',
        destCompany: company.name || ''
      }));
    }
    setShowAddressBook(null);
  };

  const handleCommodityChange = (index, field, value) => {
    setFormData((prev) => {
      const newCommodities = [...prev.commodities];

      if (field === 'hazmat') {
        newCommodities[index] = {
          ...newCommodities[index],
          hazmat: value,
          hazmatDetails: value
            ? {
                unNumber: '',
                properShippingName: '',
                hazardClass: '',
                packingGroup: '',
                emergencyPhone: '1-800-424-9300'
              }
            : null
        };
      } else if (field === 'hazmatDetails') {
        newCommodities[index] = {
          ...newCommodities[index],
          hazmatDetails: value
        };
      } else if (field.startsWith('hazmatDetails.')) {
        const hazmatField = field.replace('hazmatDetails.', '');
        newCommodities[index] = {
          ...newCommodities[index],
          hazmatDetails: {
            ...(newCommodities[index].hazmatDetails || {}),
            [hazmatField]: value
          }
        };
      } else {
        newCommodities[index][field] = value;
      }

      // Recalculate density when dimensions or weight change
      if (['weight', 'length', 'width', 'height', 'quantity'].includes(field)) {
        const densityData = calculateDensity(newCommodities[index]);
        newCommodities[index] = { ...newCommodities[index], ...densityData };
      }

      return { ...prev, commodities: newCommodities };
    });
  };

  const defaultCommodity = {
    unitType: 'Pallets',
    quantity: '1',
    weight: '',
    length: '',
    width: '',
    height: '',
    description: '',
    nmfc: '',
    calculatedClass: '',
    overrideClass: '',
    useOverride: false,
    density: null,
    cubicFeet: null,
    hazmat: false,
    hazmatDetails: null,
    notes: ''
  };

  const addCommodity = () => {
    setFormData((prev) => ({
      ...prev,
      commodities: [...prev.commodities, { ...defaultCommodity }]
    }));
  };

  const removeCommodity = (index) => {
    setFormData((prev) => {
      if (prev.commodities.length <= 1) return prev;
      return {
        ...prev,
        commodities: prev.commodities.filter((_, i) => i !== index)
      };
    });
  };

  const toggleClassOverride = (index) => {
    setFormData((prev) => {
      const newCommodities = [...prev.commodities];
      newCommodities[index].useOverride = !newCommodities[index].useOverride;
      if (!newCommodities[index].useOverride) {
        newCommodities[index].overrideClass = '';
      }
      return { ...prev, commodities: newCommodities };
    });
  };

  const handleAccessorialChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Enhanced handleSubmit with better error handling
  const handleSubmit = async () => {
    console.log('🚀 Starting quote submission...');
    setError(null);
    
    // Validation
    const errors = [];
    if (!formData.originZip) errors.push('Origin ZIP required');
    if (!formData.originCity) errors.push('Origin city required');
    if (!formData.originState) errors.push('Origin state required');
    if (!formData.destZip) errors.push('Destination ZIP required');
    if (!formData.destCity) errors.push('Destination city required');
    if (!formData.destState) errors.push('Destination state required');
    if (!formData.pickupDate) errors.push('Pickup date required');

    formData.commodities.forEach((item, idx) => {
      if (!item.weight) errors.push(`Item ${idx + 1}: Weight required`);
      if (!item.length || !item.width || !item.height) {
        errors.push(`Item ${idx + 1}: All dimensions required`);
      }
      if (item.hazmat && item.hazmatDetails) {
        if (!item.hazmatDetails.unNumber) errors.push(`Item ${idx + 1}: UN Number required for hazmat`);
        if (!item.hazmatDetails.properShippingName) errors.push(`Item ${idx + 1}: Proper shipping name required for hazmat`);
        if (!item.hazmatDetails.hazardClass) errors.push(`Item ${idx + 1}: Hazard class required for hazmat`);
      }
    });

    if (errors.length > 0) {
      const errorMessage = 'Please fix the following errors:\n' + errors.join('\n');
      setError(errorMessage);
      alert(errorMessage);
      return;
    }

    setLoading(true);
    console.log('📦 Form data being submitted:', formData);
    console.log('🏷️ Service type:', serviceType);

    try {
      const completeFormData = {
        ...formData,
        originCompany: formData.originCompany || '',
        originAddress: formData.originAddress || '',
        destCompany: formData.destCompany || '',
        destAddress: formData.destAddress || ''
      };

      console.log('📤 Calling API with complete form data...');
      const result = await quoteApi.createGroundQuoteRequest(
        completeFormData,
        serviceType
      );

      console.log('📥 API Response:', result);

      if (result?.success && result?.requestId) {
        console.log('✅ Quote created successfully!');
        console.log('Request ID:', result.requestId);
        console.log('Request Number:', result.requestNumber);
        
        // Save to localStorage for backup
        localStorage.setItem(
          `quote_formdata_${result.requestId}`,
          JSON.stringify(completeFormData)
        );
        
        // Save the complete quote data
        const completeQuoteData = {
          requestId: result.requestId,
          requestNumber: result.requestNumber,
          serviceType: serviceType,
          formData: completeFormData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(
          `quote_complete_${result.requestId}`,
          JSON.stringify(completeQuoteData)
        );
        
        console.log('💾 Quote data saved to localStorage');

        // Set the quote request data
        setQuoteRequest({
          requestId: result.requestId,
          requestNumber: result.requestNumber
        });
        
        // Navigate to results
        console.log('🔄 Showing results...');
        setShowResults(true);
        setError(null);
      } else {
        // Handle unexpected response format
        const errorMsg = result?.error || 'Unexpected response format from server';
        console.error('❌ Quote creation failed:', errorMsg);
        setError(errorMsg);
        alert('Failed to create quote: ' + errorMsg);
      }
    } catch (error) {
      console.error('❌ Error during quote submission:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      alert('Error creating quote: ' + errorMessage);
    } finally {
      setLoading(false);
      console.log('✅ Quote submission process completed');
    }
  };

  // Service type selection
  if (!serviceType) {
    return (
      <ServiceTypeSelector onSelect={setServiceType} isDarkMode={isDarkMode} />
    );
  }

  // Show results
  if (showResults && quoteRequest) {
    console.log('📊 Rendering quote results with:', quoteRequest);
    return (
      <GroundQuoteResults
        requestId={quoteRequest.requestId}
        requestNumber={quoteRequest.requestNumber}
        serviceType={serviceType}
        formData={formData}
        onBack={() => {
          console.log('⬅️ Going back to form');
          setShowResults(false);
          setQuoteRequest(null);
          setError(null);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Main form render
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
            Fill in the form below to generate your freight quote
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error creating quote</p>
              <p className="text-sm mt-1 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`mb-4 p-3 rounded text-xs ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p>Debug Info:</p>
            <p>Service Type: {serviceType}</p>
            <p>Show Results: {showResults ? 'true' : 'false'}</p>
            <p>Quote Request: {quoteRequest ? `${quoteRequest.requestId}` : 'null'}</p>
            <p>Loading: {loading ? 'true' : 'false'}</p>
          </div>
        )}

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
              onZipChange={(v) => setFormData((p) => ({ ...p, originZip: v }))}
              onCityChange={(v) => setFormData((p) => ({ ...p, originCity: v }))}
              onStateChange={(v) => setFormData((p) => ({ ...p, originState: v }))}
              isDarkMode={isDarkMode}
              loading={zipLoading.origin}
              onSetLoading={(loading) =>
                setZipLoading((prev) => ({ ...prev, origin: loading }))
              }
            />

            {formData.originCompany && (
              <div className={`mt-2 px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
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
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        originCompany: '',
                        originAddress: ''
                      }))
                    }
                    className="p-1 rounded hover:bg-gray-600"
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
              onZipChange={(v) => setFormData((p) => ({ ...p, destZip: v }))}
              onCityChange={(v) => setFormData((p) => ({ ...p, destCity: v }))}
              onStateChange={(v) => setFormData((p) => ({ ...p, destState: v }))}
              isDarkMode={isDarkMode}
              loading={zipLoading.dest}
              onSetLoading={(loading) =>
                setZipLoading((prev) => ({ ...prev, dest: loading }))
              }
            />

            {formData.destCompany && (
              <div className={`mt-2 px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
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
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        destCompany: '',
                        destAddress: ''
                      }))
                    }
                    className="p-1 rounded hover:bg-gray-600"
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pickupDate: e.target.value }))
            }
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
            {loading ? 'Generating Quote...' : 'Generate Quote'}
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
                className="p-2 rounded hover:bg-gray-700"
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
