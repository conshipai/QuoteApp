import React from 'react';
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
  return (
    <div className={`p-4 mb-4 rounded-lg border ${
      isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'
    }`}>
      {/* Item Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Item {index + 1}
        </h3>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      {/* Your commodity fields here - unit type, quantity, weight, dims, etc. */}
      {/* This keeps the component focused on just one commodity */}
    </div>
  );
};

export default CommodityItem;
