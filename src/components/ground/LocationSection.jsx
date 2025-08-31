// src/components/ground/LocationSection.jsx
import React from 'react';
import { MapPin } from 'lucide-react';

const LocationSection = ({ 
  type,
  zip = '',  // Default to empty string
  city = '',
  state = '',
  onZipChange,
  onCityChange,
  onStateChange,
  isDarkMode,
  loading = false,
  onSetLoading = () => {}  // Default no-op function
}) => {
  const title = type === 'origin' ? 'Origin' : 'Destination';
  const placeholders = {
    zip: type === 'origin' ? '29201' : '23838',
    city: type === 'origin' ? 'Columbia' : 'Chesterfield',
    state: type === 'origin' ? 'SC' : 'VA'
  };

  // Fetch city/state from ZIP
  const fetchZipData = async (zipCode) => {
    if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) return;
    
    // Safe to call even if not provided
    onSetLoading(true);
    
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          onCityChange(place['place name']);
          onStateChange(place['state abbreviation']);
        }
      } else if (response.status === 404) {
        onCityChange('');
        onStateChange('');
      }
    } catch (error) {
      console.error('Failed to fetch ZIP data:', error);
      // Clear fields on error
      onCityChange('');
      onStateChange('');
    } finally {
      onSetLoading(false);
    }
  };

  // Simplified handler
  const handleZipChange = (e) => {
    const value = e.target.value;
    
    // Strip non-digits and limit to 5
    const cleanValue = value.replace(/\D/g, '').slice(0, 5);
    
    // Always update the value
    onZipChange(cleanValue);
    
    // Fetch when we have 5 digits
    if (cleanValue.length === 5) {
      fetchZipData(cleanValue);
    } else {
      // Clear city/state for incomplete ZIPs
      onCityChange('');
      onStateChange('');
    }
  };

  // Debug helper - remove after testing
  console.log(`LocationSection ${type} - zip value:`, zip, typeof zip);
  
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
              value={zip}
              onChange={handleZipChange}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={placeholders.zip}
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
              } ${zip.length === 5 && city ? 'bg-opacity-50' : ''}`}
              placeholder={placeholders.city}
              readOnly={zip.length === 5 && city !== ''}
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
              } ${zip.length === 5 && state ? 'bg-opacity-50' : ''}`}
              placeholder={placeholders.state}
              readOnly={zip.length === 5 && state !== ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
