import React from 'react';
import { AlertCircle } from 'lucide-react';
import { UNIT_TYPES, FREIGHT_CLASSES } from './constants';

const CommodityItem = ({ 
  commodity,
  index,
  onChange,
  onRemove,
  onToggleOverride,
  canRemove,
  isDarkMode 
}) => {
  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border ${
      isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Item {index + 1}
        </h3>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      {/* First Row: Unit Type, Quantity, Weight */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Unit Type *
          </label>
          <select
            value={commodity.unitType}
            onChange={(e) => handleChange('unitType', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {UNIT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Quantity *
          </label>
          <input
            type="number"
            min="1"
            value={commodity.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
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
            onChange={(e) => handleChange('weight', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Total weight"
          />
        </div>
      </div>

      {/* Second Row: Dimensions */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Length (inches) *
          </label>
          <input
            type="number"
            value={commodity.length}
            onChange={(e) => handleChange('length', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="48"
          />
        </div>
        
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Width (inches) *
          </label>
          <input
            type="number"
            value={commodity.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="40"
          />
        </div>
        
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Height (inches) *
          </label>
          <input
            type="number"
            value={commodity.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="48"
          />
        </div>
      </div>

      {/* Third Row: Description and Class */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Description
          </label>
          <input
            type="text"
            value={commodity.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-2 py-1.5 rounded border text-sm ${
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
            {commodity.useOverride ? (
              <select
                value={commodity.overrideClass}
                onChange={(e) => handleChange('overrideClass', e.target.value)}
                className={`flex-1 px-2 py-1.5 rounded border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select class</option>
                {FREIGHT_CLASSES.map(fc => (
                  <option key={fc} value={fc}>{fc}</option>
                ))}
              </select>
            ) : (
              <div className={`flex-1 px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}>
                {commodity.calculatedClass || 'Enter dims to calculate'}
              </div>
            )}
            <button
              type="button"
              onClick={() => onToggleOverride(index)}
              className={`px-2 py-1 text-xs rounded ${
                commodity.useOverride
                  ? 'bg-yellow-500 text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={commodity.useOverride ? 'Use calculated class' : 'Override class'}
            >
              {commodity.useOverride ? 'Manual' : 'Auto'}
            </button>
          </div>
        </div>
      </div>

      {/* Density Info */}
      {commodity.density && (
        <div className={`text-xs p-2 rounded ${
          isDarkMode ? 'bg-gray-900' : 'bg-blue-50'
        }`}>
          <div className="flex gap-4">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Density: <strong>{commodity.density} lbs/ft³</strong>
            </span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Cubic Feet: <strong>{commodity.cubicFeet}</strong>
            </span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Calculated Class: <strong>{commodity.calculatedClass}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommodityItem;
