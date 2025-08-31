import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import LocationSection from '../../components/ground/LocationSection';
import CommodityList from '../../components/ground/CommodityList';
import AccessorialOptions from '../../components/ground/AccessorialOptions';
import { calculateDensity } from '../../components/ground/constants';

const Ground = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState({ origin: false, dest: false });
  
  const [formData, setFormData] = useState({
    originZip: '',
    originCity: '',
    originState: '',
    destZip: '',
    destCity: '',
    destState: '',
    pickupDate: '',
    commodities: [{
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
    }],
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false
  });

  const handleCommodityChange = (index, field, value) => {
    const newCommodities = [...formData.commodities];
    newCommodities[index][field] = value;
    
    if (['weight', 'length', 'width', 'height', 'quantity'].includes(field)) {
      const densityData = calculateDensity(newCommodities[index]);
      newCommodities[index] = {
        ...newCommodities[index],
        ...densityData
      };
    }
    
    setFormData({ ...formData, commodities: newCommodities });
  };

  const addCommodity = () => {
    setFormData({
      ...formData,
      commodities: [...formData.commodities, {
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
      }]
    });
  };

  const removeCommodity = (index) => {
    if (formData.commodities.length > 1) {
      const newCommodities = formData.commodities.filter((_, i) => i !== index);
      setFormData({ ...formData, commodities: newCommodities });
    }
  };

  const toggleClassOverride = (index) => {
    const newCommodities = [...formData.commodities];
    newCommodities[index].useOverride = !newCommodities[index].useOverride;
    if (!newCommodities[index].useOverride) {
      newCommodities[index].overrideClass = '';
    }
    setFormData({ ...formData, commodities: newCommodities });
  };

  const handleAccessorialChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!formData.originZip) errors.push('Origin ZIP required');
    if (!formData.destZip) errors.push('Destination ZIP required');
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
    console.log('Submitting LTL Quote:', formData);
    setTimeout(() => {
      setLoading(false);
      alert('Quote submitted! (Mock response)');
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            LTL Freight Quote
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Density-based pricing with dimension requirements
          </p>
        </div>

        {/* Origin & Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LocationSection
            type="origin"
            zip={formData.originZip}
            city={formData.originCity}
            state={formData.originState}
            onZipChange={(value) => setFormData({...formData, originZip: value})}
            onCityChange={(value) => setFormData({...formData, originCity: value})}
            onStateChange={(value) => setFormData({...formData, originState: value})}
            isDarkMode={isDarkMode}
            loading={zipLoading.origin}
          />
          
          <LocationSection
            type="destination"
            zip={formData.destZip}
            city={formData.destCity}
            state={formData.destState}
            onZipChange={(value) => setFormData({...formData, destZip: value})}
            onCityChange={(value) => setFormData({...formData, destCity: value})}
            onStateChange={(value) => setFormData({...formData, destState: value})}
            isDarkMode={isDarkMode}
            loading={zipLoading.dest}
          />
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
            onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
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
    </div>
  );
};

export default Ground;
