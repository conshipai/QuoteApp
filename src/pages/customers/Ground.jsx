import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, MapPin, Truck, AlertCircle, Calculator } from 'lucide-react';

const Ground = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Density to Class mapping (NMFC standard)
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
    
    // Commodities (start with one)
    commodities: [{
      handlingUnit: 'Pallets',
      pieces: '1',
      weight: '',
      length: '',
      width: '',
      height: '',
      description: '',
      class: '50',
      calculatedClass: '',
      density: '',
      useCalculatedClass: true
    }],
    
    // Accessorials
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false
  });

  // Handling unit types
  const handlingUnits = [
    'Pallets',
    'Boxes',
    'Crates',
    'Skids',
    'Barrels',
    'Bundles',
    'Cartons',
    'Rolls',
    'Bags'
  ];

  // Freight classes for dropdown
  const freightClasses = [
    '50', '55', '60', '65', '70', '77.5', '85', '92.5', 
    '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'
  ];

  // Calculate density and class when dimensions or weight change
  const calculateDensity = (commodity) => {
    const weight = parseFloat(commodity.weight) || 0;
    const length = parseFloat(commodity.length) || 0;
    const width = parseFloat(commodity.width) || 0;
    const height = parseFloat(commodity.height) || 0;
    const pieces = parseFloat(commodity.pieces) || 1;
    
    if (weight > 0 && length > 0 && width > 0 && height > 0) {
      // Calculate cubic feet for all pieces
      const cubicInches = length * width * height * pieces;
      const cubicFeet = cubicInches / 1728; // Convert to cubic feet
      
      // Calculate density (lbs per cubic foot)
      const density = weight / cubicFeet;
      
      // Get recommended class based on density
      const recommendedClass = getDensityClass(density);
      
      return {
        density: density.toFixed(2),
        calculatedClass: recommendedClass,
        cubicFeet: cubicFeet.toFixed(2)
      };
    }
    
    return {
      density: '',
      calculatedClass: '',
      cubicFeet: ''
    };
  };

  const handleCommodityChange = (index, field, value) => {
    const newCommodities = [...formData.commodities];
    newCommodities[index][field] = value;
    
    // If dimensions or weight changed, recalculate density
    if (['weight', 'length', 'width', 'height', 'pieces'].includes(field)) {
      const calculated = calculateDensity(newCommodities[index]);
      newCommodities[index].density = calculated.density;
      newCommodities[index].calculatedClass = calculated.calculatedClass;
      
      // If using calculated class, update the class field
      if (newCommodities[index].useCalculatedClass && calculated.calculatedClass) {
        newCommodities[index].class = calculated.calculatedClass;
      }
    }
    
    setFormData({ ...formData, commodities: newCommodities });
  };

  const toggleUseCalculatedClass = (index) => {
    const newCommodities = [...formData.commodities];
    newCommodities[index].useCalculatedClass = !newCommodities[index].useCalculatedClass;
    
    // If switching to calculated, update class
    if (newCommodities[index].useCalculatedClass && newCommodities[index].calculatedClass) {
      newCommodities[index].class = newCommodities[index].calculatedClass;
    }
    
    setFormData({ ...formData, commodities: newCommodities });
  };

  const addCommodity = () => {
    setFormData({
      ...formData,
      commodities: [...formData.commodities, {
        handlingUnit: 'Pallets',
        pieces: '1',
        weight: '',
        length: '',
        width: '',
        height: '',
        description: '',
        class: '50',
        calculatedClass: '',
        density: '',
        useCalculatedClass: true
      }]
    });
  };

  const removeCommodity = (index) => {
    if (formData.commodities.length > 1) {
      const newCommodities = formData.commodities.filter((_, i) => i !== index);
      setFormData({ ...formData, commodities: newCommodities });
    }
  };

  const handleSubmit = async () => {
    // Validate that all commodities have dimensions
    const missingDims = formData.commodities.some(c => 
      !c.weight || !c.length || !c.width || !c.height
    );
    
    if (missingDims) {
      alert('All commodities must have weight and dimensions');
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
            Less Than Truckload shipping quote with density-based pricing
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
                <input
                  type="text"
                  maxLength="5"
                  value={formData.originZip}
                  onChange={(e) => setFormData({...formData, originZip: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="29201"
                />
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
                    }`}
                    placeholder="Columbia"
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
                    }`}
                    placeholder="SC"
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
                <input
                  type="text"
                  maxLength="5"
                  value={formData.destZip}
                  onChange={(e) => setFormData({...formData, destZip: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="23838"
                />
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
                    }`}
                    placeholder="Chesterfield"
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
                    }`}
                    placeholder="VA"
                  />
                </div>
              </div>
            </div>
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
            onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
            className={`px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Commodities with Dimensions */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Package className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Commodities
              </h2>
            </div>
            <button
              onClick={addCommodity}
              className={`px-3 py-1 text-sm rounded ${
                isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
              }`}
            >
              + Add Item
            </button>
          </div>

          <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-start">
              <AlertCircle className={`w-4 h-4 mt-0.5 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Dimensions are required for accurate pricing. Class will be calculated based on density.
              </p>
            </div>
          </div>

          {formData.commodities.map((commodity, index) => (
            <div key={index} className={`p-4 mb-4 rounded-lg border ${
              isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              {/* Row 1: Handling Unit, Pieces, Weight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Handling Unit *
                  </label>
                  <select
                    value={commodity.handlingUnit}
                    onChange={(e) => handleCommodityChange(index, 'handlingUnit', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {handlingUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Number of {commodity.handlingUnit} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={commodity.pieces}
                    onChange={(e) => handleCommodityChange(index, 'pieces', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    value={commodity.weight}
                    onChange={(e) => handleCommodityChange(index, 'weight', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Total weight"
                  />
                </div>
              </div>

              {/* Row 2: Dimensions per unit */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Length (in) per {commodity.handlingUnit} *
                  </label>
                  <input
                    type="number"
                    value={commodity.length}
                    onChange={(e) => handleCommodityChange(index, 'length', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="48"
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Width (in) per {commodity.handlingUnit} *
                  </label>
                  <input
                    type="number"
                    value={commodity.width}
                    onChange={(e) => handleCommodityChange(index, 'width', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="40"
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Height (in) per {commodity.handlingUnit} *
                  </label>
                  <input
                    type="number"
                    value={commodity.height}
                    onChange={(e) => handleCommodityChange(index, 'height', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="48"
                  />
                </div>
              </div>

              {/* Row 3: Description and Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={commodity.description}
                    onChange={(e) => handleCommodityChange(index, 'description', e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="General freight"
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Freight Class
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={commodity.class}
                      onChange={(e) => handleCommodityChange(index, 'class', e.target.value)}
                      disabled={commodity.useCalculatedClass}
                      className={`flex-1 px-2 py-2 rounded border text-sm ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${commodity.useCalculatedClass ? 'opacity-60' : ''}`}
                    >
                      {freightClasses.map(fc => (
                        <option key={fc} value={fc}>{fc}</option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => toggleUseCalculatedClass(index)}
                      className={`px-3 py-2 rounded text-xs font-medium ${
                        commodity.useCalculatedClass
                          ? isDarkMode 
                            ? 'bg-green-900/30 text-green-400 border border-green-800' 
                            : 'bg-green-100 text-green-700 border border-green-300'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 border border-gray-600'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                      title={commodity.useCalculatedClass ? 'Using calculated class' : 'Using manual class'}
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Calculated Info */}
              {commodity.density && (
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-6">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Density: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {commodity.density} lbs/ft³
                        </strong>
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Calculated Class: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {commodity.calculatedClass}
                        </strong>
                      </span>
                      {commodity.useCalculatedClass && (
                        <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} text-xs`}>
                          ✓ Using calculated class
                        </span>
                      )}
                    </div>
                    
                    {formData.commodities.length > 1 && (
                      <button
                        onClick={() => removeCommodity(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Remove button if no density calculated */}
              {!commodity.density && formData.commodities.length > 1 && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => removeCommodity(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Item
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Accessorials */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center mb-4">
            <Truck className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Additional Services
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.liftgatePickup}
                onChange={(e) => setFormData({...formData, liftgatePickup: e.target.checked})}
                className="mr-2"
              />
              Liftgate - Pickup
            </label>
            
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.liftgateDelivery}
                onChange={(e) => setFormData({...formData, liftgateDelivery: e.target.checked})}
                className="mr-2"
              />
              Liftgate - Delivery
            </label>
            
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.residentialDelivery}
                onChange={(e) => setFormData({...formData, residentialDelivery: e.target.checked})}
                className="mr-2"
              />
              Residential Delivery
            </label>
            
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.insideDelivery}
                onChange={(e) => setFormData({...formData, insideDelivery: e.target.checked})}
                className="mr-2"
              />
              Inside Delivery
            </label>
            
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.limitedAccessPickup}
                onChange={(e) => setFormData({...formData, limitedAccessPickup: e.target.checked})}
                className="mr-2"
              />
              Limited Access - Pickup
            </label>
            
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.limitedAccessDelivery}
                onChange={(e) => setFormData({...formData, limitedAccessDelivery: e.target.checked})}
                className="mr-2"
              />
              Limited Access - Delivery
            </label>
          </div>
        </div>

        {/* Submit Button */}
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
