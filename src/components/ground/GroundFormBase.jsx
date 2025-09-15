// src/components/ground/GroundFormBase.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Building2, X, AlertCircle, Info } from 'lucide-react';
import LocationSection from './LocationSection';
import CommodityList from './CommodityList';
import AccessorialOptions from './AccessorialOptions';
import AddressBook from '../shared/AddressBook';
import addressBookApi from '../../services/addressBookApi';
import { calculateDensity } from './constants';

const GroundFormBase = ({ 
  serviceType,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  error,
  isDarkMode,
  children, // For service-specific sections
  availableCarriers = []
}) => {
  const [zipLoading, setZipLoading] = useState({ origin: false, dest: false });
  const [showAddressBook, setShowAddressBook] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const result = await addressBookApi.getCompanies();
      if (result?.success) {
        setSavedAddresses(result.companies || []);
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
    
    const updates = {};
    if (type === 'origin') {
      updates.originZip = company.zip || '';
      updates.originCity = company.city || '';
      updates.originState = company.state || '';
      updates.originAddress = company.address || '';
      updates.originCompany = company.name || '';
    } else {
      updates.destZip = company.zip || '';
      updates.destCity = company.city || '';
      updates.destState = company.state || '';
      updates.destAddress = company.address || '';
      updates.destCompany = company.name || '';
    }
    
    // Update all fields at once
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    setShowAddressBook(null);
  };

  // Create stable callbacks for location updates
  const handleOriginZipChange = useCallback((value) => {
    console.log('handleOriginZipChange called with:', value);
    setFormData(prev => ({
      ...prev,
      originZip: value
    }));
  }, [setFormData]);

  const handleOriginCityChange = useCallback((value) => {
    console.log('handleOriginCityChange called with:', value);
    setFormData(prev => ({
      ...prev,
      originCity: value
    }));
  }, [setFormData]);

  const handleOriginStateChange = useCallback((value) => {
    console.log('handleOriginStateChange called with:', value);
    setFormData(prev => ({
      ...prev,
      originState: value
    }));
  }, [setFormData]);

  const handleDestZipChange = useCallback((value) => {
    console.log('handleDestZipChange called with:', value);
    setFormData(prev => ({
      ...prev,
      destZip: value
    }));
  }, [setFormData]);

  const handleDestCityChange = useCallback((value) => {
    console.log('handleDestCityChange called with:', value);
    setFormData(prev => ({
      ...prev,
      destCity: value
    }));
  }, [setFormData]);

  const handleDestStateChange = useCallback((value) => {
    console.log('handleDestStateChange called with:', value);
    setFormData(prev => ({
      ...prev,
      destState: value
    }));
  }, [setFormData]);

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

      // Recalculate density when dimensions or weight change (IMPORTANT FOR LTL)
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
    notes: '',
    useMetric: false
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

  // Determine if commodity list should be shown
  const shouldShowCommodityList = () => {
    // LTL ALWAYS shows commodity list
    if (serviceType === 'ltl') {
      return true;
    }
    // FTL/Expedited show commodity list only for custom loads
    if ((serviceType === 'ftl' || serviceType === 'expedited') && formData.loadType !== 'legal') {
      return true;
    }
    return false;
  };

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
              onClick={onCancel}
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
            {serviceType === 'ltl' 
              ? 'Fill in the form below to generate instant LTL quotes. Dimensions are required for accurate freight class calculation.'
              : serviceType === 'ftl'
              ? 'Request FTL quotes from multiple carriers'
              : 'Request expedited quotes for time-critical shipments'}
          </p>
        </div>

        {/* LTL-specific info banner */}
        {serviceType === 'ltl' && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">LTL Quote Requirements:</p>
              <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                <li>All commodity dimensions are required for freight class calculation</li>
                <li>Freight class is automatically calculated based on density</li>
                <li>You can override the calculated class if needed</li>
                <li>Quotes are generated instantly from multiple carriers</li>
              </ul>
            </div>
          </div>
        )}

        {/* Info Banner for FTL/Expedited */}
        {(serviceType === 'ftl' || serviceType === 'expedited') && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">How {serviceType.toUpperCase()} Quotes Work:</p>
              <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                <li>Your request will be sent to {availableCarriers.length || 'multiple'} qualified carriers</li>
                <li>Carriers have {serviceType === 'expedited' ? '15' : '30'} minutes to submit their best rates</li>
                <li>You'll review all submissions and select the best option</li>
              </ul>
            </div>
          </div>
        )}

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
              onZipChange={handleOriginZipChange}
              onCityChange={handleOriginCityChange}
              onStateChange={handleOriginStateChange}
              isDarkMode={isDarkMode}
              loading={zipLoading.origin}
              onSetLoading={(loading) =>
                setZipLoading((prev) => ({ ...prev, origin: loading }))
              }
            />
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
              onZipChange={handleDestZipChange}
              onCityChange={handleDestCityChange}
              onStateChange={handleDestStateChange}
              isDarkMode={isDarkMode}
              loading={zipLoading.dest}
              onSetLoading={(loading) =>
                setZipLoading((prev) => ({ ...prev, dest: loading }))
              }
            />
          </div>
        </div>

        {/* Pickup Date Section */}
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
            onChange={(e) => setFormData((prev) => ({ ...prev, pickupDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className={`px-3 py-2 rounded border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Service-Specific Options (passed as children) */}
        {children}

        {/* Commodity List - Clear conditional for LTL */}
        {shouldShowCommodityList() && (
          <CommodityList
            commodities={formData.commodities}
            onCommodityChange={handleCommodityChange}
            onAddCommodity={addCommodity}
            onRemoveCommodity={removeCommodity}
            onToggleOverride={toggleClassOverride}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Legal Truckload Summary - Only for FTL/Expedited with legal load */}
        {formData.loadType === 'legal' && (serviceType === 'ftl' || serviceType === 'expedited') && (
          <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Legal Truckload Summary
            </h2>
            <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight: <strong>{formData.legalLoadWeight || '45,000'} lbs</strong>
                {formData.legalLoadPallets && (
                  <> • Pallets: <strong>{formData.legalLoadPallets}</strong></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Accessorials */}
        <AccessorialOptions
          accessorials={formData}
          onChange={handleAccessorialChange}
          isDarkMode={isDarkMode}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <button
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
            onClick={onSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded font-medium ${
              loading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isDarkMode
                ? 'bg-conship-orange text-white hover:bg-orange-600'
                : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            {loading 
              ? 'Sending Request...' 
              : serviceType === 'ltl'
              ? 'Generate Instant Quote'
              : serviceType === 'expedited'
              ? 'Request Expedited Quotes'
              : 'Request FTL Quotes'}
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

export default GroundFormBase;
