// src/components/ground/FTLOptions.jsx
import React from 'react';
import { Truck, Building, Package } from 'lucide-react';

const FTLOptions = ({ 
  formData,
  onChange,
  isDarkMode 
}) => {
  const truckTypes = [
    '53\' Dry Van',
    '48\' Trailer',
    'Flatbed',
    'Step Deck',
    'Reefer',
    'Conestoga',
    'Power Only'
  ];

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center mb-4">
        <Truck className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Full Truckload (FTL) Options
        </h2>
      </div>

      {/* Equipment Type */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Equipment Type Required
        </label>
        <select
          value={formData.equipmentType || ''}
          onChange={(e) => handleFieldChange('equipmentType', e.target.value)}
          className={`w-full px-3 py-2 rounded border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select equipment type...</option>
          {truckTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
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
              placeholder="e.g., Mon-Fri 7AM-3PM"
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
              placeholder="e.g., Mon-Fri 7AM-3PM"
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

      {/* Load Configuration */}
      <div className={`p-4 rounded border ${isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}`}>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Package className="inline w-4 h-4 mr-1" />
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
                  handleFieldChange('legalLoadWeight', '45000'); // Default max legal weight
                  handleFieldChange('legalLoadPallets', '26'); // Standard pallet count for 53' trailer
                }
              }}
              className="mr-2"
            />
            Legal Truckload (Standard full trailer load)
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
            Custom Load (Enter specific pieces and weights)
          </label>
        </div>

        {formData.loadType === 'legal' && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              Standard legal truckload specifications:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Weight (lbs)
                </label>
                <input
                  type="number"
                  value={formData.legalLoadWeight || '45000'}
                  onChange={(e) => handleFieldChange('legalLoadWeight', e.target.value)}
                  className={`w-full px-3 py-1 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pallet Count
                </label>
                <input
                  type="number"
                  value={formData.legalLoadPallets || '26'}
                  onChange={(e) => handleFieldChange('legalLoadPallets', e.target.value)}
                  placeholder="26"
                  className={`w-full px-3 py-1 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {formData.loadType === 'custom' && (
          <div className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-gray-750' : 'bg-yellow-50'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-yellow-700'}`}>
              ℹ️ Please enter specific commodity details in the Freight Details section below
            </p>
          </div>
        )}
      </div>

      {/* Additional FTL Options */}
      <div className="mt-4 space-y-2">
        <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <input
            type="checkbox"
            checked={formData.dropTrailer || false}
            onChange={(e) => handleFieldChange('dropTrailer', e.target.checked)}
            className="mr-2"
          />
          Drop Trailer Service
        </label>
        <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <input
            type="checkbox"
            checked={formData.teamService || false}
            onChange={(e) => handleFieldChange('teamService', e.target.checked)}
            className="mr-2"
          />
          Team Service Required (for expedited FTL)
        </label>
      </div>
    </div>
  );
};

export default FTLOptions;
