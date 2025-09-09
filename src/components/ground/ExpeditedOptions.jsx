// src/components/ground/ExpeditedOptions.jsx
import React from 'react';
import { Truck, Clock, Users, Building } from 'lucide-react';

const ExpeditedOptions = ({ 
  formData,
  onChange,
  isDarkMode 
}) => {
  const truckTypes = [
    'Sprinter Van',
    'Gooseneck',
    'Box Truck',
    '53\' Van',
    'Step Deck',
    'Flatbed',
    'Reefer'
  ];

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center mb-4">
        <Truck className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Expedited Service Options
        </h2>
      </div>

      {/* Truck Type Selection */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Truck Type Required *
        </label>
        <select
          value={formData.truckType || ''}
          onChange={(e) => handleFieldChange('truckType', e.target.value)}
          className={`w-full px-3 py-2 rounded border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        >
          <option value="">Select truck type...</option>
          {truckTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Service Type - Dedicated vs Team Drivers */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Service Type *
        </label>
        <div className="flex gap-4">
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="radio"
              name="serviceMode"
              value="dedicated"
              checked={formData.serviceMode === 'dedicated'}
              onChange={(e) => handleFieldChange('serviceMode', e.target.value)}
              className="mr-2"
            />
            <Users className="w-4 h-4 mr-1" />
            Dedicated Driver
          </label>
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="radio"
              name="serviceMode"
              value="team"
              checked={formData.serviceMode === 'team'}
              onChange={(e) => handleFieldChange('serviceMode', e.target.value)}
              className="mr-2"
            />
            <Users className="w-4 h-4 mr-1" />
            Team Drivers
          </label>
        </div>
      </div>

      {/* Timing */}
      <div className="mb-4">
        <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <input
            type="checkbox"
            checked={formData.asap || false}
            onChange={(e) => handleFieldChange('asap', e.target.checked)}
            className="mr-2"
          />
          <Clock className="w-4 h-4 mr-1 text-red-500" />
          As Soon As Possible (ASAP)
        </label>
      </div>

      {/* Pickup Hours */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Building className="inline w-4 h-4 mr-1" />
          Pickup Facility Hours
        </label>
        <div className="flex items-center gap-3">
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={formData.pickup24Hour || false}
              onChange={(e) => {
                handleFieldChange('pickup24Hour', e.target.checked);
                if (e.target.checked) {
                  handleFieldChange('pickupHours', '24/7');
                }
              }}
              className="mr-2"
            />
            24 Hour Facility
          </label>
          {!formData.pickup24Hour && (
            <input
              type="text"
              placeholder="e.g., Mon-Fri 8AM-5PM"
              value={formData.pickupHours || ''}
              onChange={(e) => handleFieldChange('pickupHours', e.target.value)}
              className={`flex-1 px-3 py-1 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          )}
        </div>
      </div>

      {/* Delivery Hours */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Building className="inline w-4 h-4 mr-1" />
          Delivery Facility Hours
        </label>
        <div className="flex items-center gap-3">
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={formData.delivery24Hour || false}
              onChange={(e) => {
                handleFieldChange('delivery24Hour', e.target.checked);
                if (e.target.checked) {
                  handleFieldChange('deliveryHours', '24/7');
                }
              }}
              className="mr-2"
            />
            24 Hour Facility
          </label>
          {!formData.delivery24Hour && (
            <input
              type="text"
              placeholder="e.g., Mon-Fri 8AM-5PM"
              value={formData.deliveryHours || ''}
              onChange={(e) => handleFieldChange('deliveryHours', e.target.value)}
              className={`flex-1 px-3 py-1 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          )}
        </div>
      </div>

      {/* Load Type - Legal Truckload vs Custom */}
      <div className={`p-4 rounded border ${isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}`}>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Load Configuration
        </label>
        <div className="space-y-2">
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="radio"
              name="loadType"
              value="legal"
              checked={formData.loadType === 'legal'}
              onChange={(e) => {
                handleFieldChange('loadType', e.target.value);
                if (e.target.value === 'legal') {
                  // Set default legal load values
                  handleFieldChange('legalLoadWeight', '45000'); // Default max legal weight in lbs
                }
              }}
              className="mr-2"
            />
            Legal Truckload (Max legal weight/dimensions)
          </label>
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="radio"
              name="loadType"
              value="custom"
              checked={formData.loadType === 'custom' || !formData.loadType}
              onChange={(e) => handleFieldChange('loadType', e.target.value)}
              className="mr-2"
            />
            Custom (Enter specific pieces and weights)
          </label>
        </div>

        {formData.loadType === 'legal' && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              Legal truckload selected: Max weight 45,000 lbs (can be adjusted based on truck type)
            </p>
            <input
              type="number"
              placeholder="Weight (lbs)"
              value={formData.legalLoadWeight || '45000'}
              onChange={(e) => handleFieldChange('legalLoadWeight', e.target.value)}
              className={`mt-2 px-3 py-1 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>lbs</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpeditedOptions;
