import React from 'react';
import { MapPin } from 'lucide-react';

const LocationSection = ({ 
  type, // 'origin' or 'destination'
  zip,
  city,
  state,
  onZipChange,
  onCityChange,
  onStateChange,
  isDarkMode,
  loading
}) => {
  const title = type === 'origin' ? 'Origin' : 'Destination';
  
  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center mb-4">
        <MapPin className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
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
              value={zip}
              onChange={(e) => onZipChange(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={type === 'origin' ? '29201' : '23838'}
            />
            {loading && (
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
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={type === 'origin' ? 'Columbia' : 'Chesterfield'}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              State *
            </label>
            <input
              type="text"
              maxLength="2"
              value={state}
              onChange={(e) => onStateChange(e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={type === 'origin' ? 'SC' : 'VA'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
