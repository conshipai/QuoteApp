import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const LocationSection = ({ 
  type,
  zip,
  city,
  state,
  onZipChange,
  onCityChange,
  onStateChange,
  isDarkMode,
  loading: externalLoading = false,
  onSetLoading,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const title = type === 'origin' ? 'Origin' : 'Destination';
  const placeholders = {
    zip: type === 'origin' ? '77002' : '75201',
    city: type === 'origin' ? 'Houston' : 'Dallas',
    state: type === 'origin' ? 'TX' : 'TX'
  };

  const fetchZipData = async (zipCode) => {
    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return;
    }

    const setLoadingState = (loading) => {
      setIsLoading(loading);
      if (typeof onSetLoading === 'function') {
        onSetLoading(loading);
      }
    };

    setLoadingState(true);
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          const cityName = place['place name'] || '';
          const stateAbbr = place['state abbreviation'] || '';
          
          // Update city and state - make sure we're calling the callbacks
          if (cityName && typeof onCityChange === 'function') {
            onCityChange(cityName);
          }
          if (stateAbbr && typeof onStateChange === 'function') {
            onStateChange(stateAbbr);
          }
        }
      } else if (response.status === 404) {
        // Invalid ZIP - clear city/state
        if (typeof onCityChange === 'function') onCityChange('');
        if (typeof onStateChange === 'function') onStateChange('');
      }
    } catch (error) {
      console.error('Failed to fetch ZIP data:', error);
      // Don't clear on error, keep existing values
    } finally {
      setLoadingState(false);
    }
  };

  // Fetch city/state when ZIP changes to 5 digits
  useEffect(() => {
    if (zip && zip.length === 5) {
      fetchZipData(zip);
    }
  }, [zip]);

  const handleZipChange = (e) => {
    const inputValue = e.target.value;
    // Only allow digits
    const digitsOnly = inputValue.replace(/\D/g, '').slice(0, 5);
    
    // Update ZIP immediately
    if (typeof onZipChange === 'function') {
      onZipChange(digitsOnly);
    }

    // Clear city/state if incomplete ZIP
    if (digitsOnly.length < 5) {
      if (typeof onCityChange === 'function') onCityChange('');
      if (typeof onStateChange === 'function') onStateChange('');
    }
  };

  const handleCityChange = (e) => {
    if (typeof onCityChange === 'function') {
      onCityChange(e.target.value);
    }
  };

  const handleStateChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 2);
    if (typeof onStateChange === 'function') {
      onStateChange(value);
    }
  };

  const loading = externalLoading || isLoading;

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
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="postal-code"
              maxLength={5}
              value={zip || ''}
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
              value={city || ''}
              onChange={handleCityChange}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={placeholders.city}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              State *
            </label>
            <input
              type="text"
              maxLength={2}
              value={state || ''}
              onChange={handleStateChange}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={placeholders.state}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
