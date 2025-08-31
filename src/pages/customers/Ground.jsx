import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, MapPin, Truck, AlertCircle, Calculator } from 'lucide-react';

const Ground = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState({ origin: false, dest: false });
  
  // Form state
  const [formData, setFormData] = useState({
    // Origin
    originZip: '',
    originCity: '',
    originState: '',
    
    // Destination
    destZip: '',
    destCity: '',
    destState: '',
    
    // Pickup Date
    pickupDate: '',
    
    // Commodities with dimensions
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
    
    // Accessorials
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false
  });

  // Fetch city/state from ZIP using free API
  const fetchZipData = async (zip, type) => {
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) return;
    
    // Set loading state
    setZipLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          
          if (type === 'origin') {
            setFormData(prev => ({
              ...prev,
              originCity: place['place name'],
              originState: place['state abbreviation']
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              destCity: place['place name'],
              destState: place['state abbreviation']
            }));
          }
        }
      } else if (response.status === 404) {
        // Invalid ZIP code
        if (type === 'origin') {
          setFormData(prev => ({
            ...prev,
            originCity: '',
            originState: ''
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            destCity: '',
            destState: ''
          }));
        }
        console.log(`Invalid ZIP code: ${zip}`);
      }
    } catch (error) {
      console.error('Failed to fetch ZIP data:', error);
    } finally {
      setZipLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle ZIP input changes
  const handleZipChange = (value, type) => {
    // Only allow numbers
    const cleanedValue = value.replace(/\D/g, '').slice(0, 5);
    
    if (type === 'origin') {
      setFormData(prev => ({ ...prev, originZip: cleanedValue }));
      if (cleanedValue.length === 5) {
        fetchZipData(cleanedValue, 'origin');
      } else {
        // Clear city/state if ZIP is incomplete
        setFormData(prev => ({ ...prev, originCity: '', originState: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, destZip: cleanedValue }));
      if (cleanedValue.length === 5) {
        fetchZipData(cleanedValue, 'dest');
      } else {
        setFormData(prev => ({ ...prev, destCity: '', destState: '' }));
      }
    }
  };

  // Unit types
  const unitTypes = ['Pallets', 'Boxes', 'Crates', 'Skids', 'Barrels', 'Bundles', 'Rolls', 'Bags'];
  
  // Freight classes
  const freightClasses = [
    '50', '55', '60', '65', '70', '77.5', '85', '92.5', 
    '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'
  ];

  // Density to freight class mapping (lbs per cubic foot)
  const getDensityClass = (density) => {
    if (density >= 50) return '50';
    if (density >= 35) return '55';
    if (density >= 30) return '60';
    if (density >= 22.5) return '65';
    if (density >= 15) return '70';
    if (density >= 13.5) return '77.5';
    if (density >= 12) return '85';
    if (density >= 10.5) return '92.5';
    if (density >= 9) return '100';
    if (density >= 8) return '110';
    if (density >= 7) return '125';
    if (density >= 6) return '150';
    if (density >= 5) return '175';
    if (density >= 4) return '200';
    if (density >= 3) return '250';
    if (density >= 2) return '300';
    if (density >= 1) return '400';
    return '500';
  };

  // Calculate density when dimensions or weight change
  const calculateDensity = (commodity) => {
    const weight = parseFloat(commodity.weight) || 0;
    const length = parseFloat(commodity.length) || 0;
    const width = parseFloat(commodity.width) || 0;
    const height = parseFloat(commodity.height) || 0;
    const quantity = parseInt(commodity.quantity) || 1;
    
    if (weight > 0 && length > 0 && width > 0 && height > 0) {
      // Calculate cubic feet for all pieces
      const cubicFeet = (length * width * height * quantity) / 1728; // Convert cubic inches to cubic feet
      const density = weight / cubicFeet;
      const calculatedClass = getDensityClass(density);
      
      return {
        density: density.toFixed(2),
        cubicFeet: cubicFeet.toFixed(2),
        calculatedClass
      };
    }
    
    return {
      density: null,
      cubicFeet: null,
      calculatedClass: ''
    };
  };

  const handleCommodityChange = (index, field, value) => {
    const newCommodities = [...formData.commodities];
    newCommodities[index][field] = value;
    
    // If dimensions or weight changed, recalculate density
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

  const handleSubmit = async () => {
    // Validation
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
            Density-based pricing with automatic location lookup
          </p>
        </div>

        {/* Origin & Destination - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Origin */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center mb-4">
              <MapPin className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Origin
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ZIP Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength="5"
                    value={formData.originZip}
                    onChange={(e) => handleZipChange(e.target.value, 'origin')}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="29201"
                  />
                  {zipLoading.origin && (
                    <div className="absolute right-2 top-2.5">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.originCity}
                    onChange={(e) => setFormData({...formData, originCity: e.target.value})}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${formData.originZip.length === 5 ? 'bg-opacity-50' : ''}`}
                    placeholder="Columbia"
                    readOnly={formData.originZip.length === 5}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    State *
                  </label>
                  <input
                    type="text"
                    maxLength="2"
                    value={formData.originState}
                    onChange={(e) => setFormData({...formData, originState: e.target.value.toUpperCase()})}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${formData.originZip.length === 5 ? 'bg-opacity-50' : ''}`}
                    placeholder="SC"
                    readOnly={formData.originZip.length === 5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center mb-4">
              <MapPin className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Destination
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ZIP Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength="5"
                    value={formData.destZip}
                    onChange={(e) => handleZipChange(e.target.value, 'dest')}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="23838"
                  />
                  {zipLoading.dest && (
                    <div className="absolute right-2 top-2.5">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.destCity}
                    onChange={(e) => setFormData({...formData, destCity: e.target.value})}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${formData.destZip.length === 5 ? 'bg-opacity-50' : ''}`}
                    placeholder="Chesterfield"
                    readOnly={formData.destZip.length === 5}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    State *
                  </label>
                  <input
                    type="text"
                    maxLength="2"
                    value={formData.destState}
                    onChange={(e) => setFormData({...formData, destState: e.target.value.toUpperCase()})}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${formData.destZip.length === 5 ? 'bg-opacity-50' : ''}`}
                    placeholder="VA"
                    readOnly={formData.destZip.length === 5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REST OF YOUR EXISTING CODE for Pickup Date, Commodities, Accessorials, etc. */}
        {/* ... (keeping the rest as is) ... */}

      </div>
    </div>
  );
};

export default Ground;
