import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, MapPin, Truck, AlertCircle } from 'lucide-react';

const Ground = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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
      class: '50',
      weight: '',
      pieces: '1',
      description: ''
    }],
    
    // Accessorials
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false
  });

  // Freight classes for dropdown
  const freightClasses = [
    '50', '55', '60', '65', '70', '77.5', '85', '92.5', 
    '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'
  ];

  const handleCommodityChange = (index, field, value) => {
    const newCommodities = [...formData.commodities];
    newCommodities[index][field] = value;
    setFormData({ ...formData, commodities: newCommodities });
  };

  const addCommodity = () => {
    setFormData({
      ...formData,
      commodities: [...formData.commodities, {
        class: '50',
        weight: '',
        pieces: '1',
        description: ''
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
    setLoading(true);
    // TODO: Add validation
    // TODO: Call API
    console.log('Submitting LTL Quote:', formData);
    setTimeout(() => {
      setLoading(false);
      alert('Quote submitted! (Mock response)');
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            LTL Freight Quote
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Less Than Truckload shipping quote
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

        {/* Commodities */}
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

          {formData.commodities.map((commodity, index) => (
            <div key={index} className={`p-4 mb-3 rounded border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Class
                  </label>
                  <select
                    value={commodity.class}
                    onChange={(e) => handleCommodityChange(index, 'class', e.target.value)}
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {freightClasses.map(fc => (
                      <option key={fc} value={fc}>{fc}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={commodity.weight}
                    onChange={(e) => handleCommodityChange(index, 'weight', e.target.value)}
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pieces
                  </label>
                  <input
                    type="number"
                    value={commodity.pieces}
                    onChange={(e) => handleCommodityChange(index, 'pieces', e.target.value)}
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Description
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commodity.description}
                      onChange={(e) => handleCommodityChange(index, 'description', e.target.value)}
                      className={`flex-1 px-2 py-1 rounded border text-sm ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="General freight"
                    />
                    {formData.commodities.length > 1 && (
                      <button
                        onClick={() => removeCommodity(index)}
                        className="px-2 py-1 text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
