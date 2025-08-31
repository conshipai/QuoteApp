import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import CommodityItem from './CommodityItem';

const CommodityList = ({ 
  commodities,
  onCommodityChange,
  onAddCommodity,
  onRemoveCommodity,
  onToggleOverride,
  isDarkMode 
}) => {
  return (
    <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Package className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Freight Details
          </h2>
        </div>
        <button
          onClick={onAddCommodity}
          className={`px-3 py-1 text-sm rounded ${
            isDarkMode 
              ? 'bg-conship-orange text-white hover:bg-orange-600' 
              : 'bg-conship-purple text-white hover:bg-purple-700'
          }`}
        >
          + Add Item
        </button>
      </div>

      {commodities.map((commodity, index) => (
        <CommodityItem
          key={index}
          commodity={commodity}
          index={index}
          onChange={onCommodityChange}
          onRemove={onRemoveCommodity}
          onToggleOverride={onToggleOverride}
          canRemove={commodities.length > 1}
          isDarkMode={isDarkMode}
        />
      ))}

      <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
        isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
      }`}>
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          Dimensions are required for accurate pricing. Class is automatically calculated based on density 
          but can be overridden if you have a specific commodity class.
        </p>
      </div>
    </div>
  );
};

export default CommodityList;
