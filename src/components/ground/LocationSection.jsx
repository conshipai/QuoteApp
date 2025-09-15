import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const LocationSection = ({ 
  type,
  zip,
  city,
  state,
  onZipChange = () => {},
  onCityChange = () => {},
  onStateChange = () => {},
  isDarkMode,
  loading: externalLoading = false,
  onSetLoading,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localZip, setLocalZip] = useState(zip || ''); // Local state for immediate updates
  
  // Debug: Log props on mount and updates
  useEffect(() => {
    console.log(`LocationSection ${type} mounted/updated:`, {
      zip,
      city,
      state,
      localZip,
      hasCallbacks: {
        onZipChange: typeof onZipChange === 'function',
        onCityChange: typeof onCityChange === 'function',
        onStateChange: typeof onStateChange === 'function'
      }
    });
  }, [type, zip, city, state, localZip]);

  // Sync external zip changes to local state
  useEffect(() => {
    setLocalZip(zip || '');
  }, [zip]);
  
  const title = type === 'origin' ? 'Origin' : 'Destination';
  const placeholders = {
    zip: type === 'origin' ? '29201' : '23838',
    city: type === 'origin' ? 'Columbia' : 'Chesterfield',
    state: type === 'origin' ? 'SC' : 'VA'
  };

  const fetchZipData = async (zipCode) => {
    console.log('fetchZipData called with:', zipCode);
    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      console.log('Invalid ZIP for fetch:', zipCode);
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
      console.log('Fetching from API for ZIP:', zipCode);
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Data received:', data);
        
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          const cityName = place['place name'] || '';
          const stateName = place['state abbreviation'] || '';
          
          console.log('Setting city:', cityName, 'state:', stateName);
          onCityChange(cityName);
          onStateChange(stateName);
        }
      } else if (response.status === 404) {
        console.log(`Invalid ZIP code: ${zipCode}`);
        onCityChange('');
        onStateChange('');
      }
    } catch (error) {
      console.error('Failed to fetch ZIP data:', error);
      onCityChange('');
      onStateChange('');
    } finally {
      setLoadingState(false);
    }
  };

  // Watch for ZIP changes from external sources (like address book)
  useEffect(() => {
    if (zip && zip.length === 5 && !city && !state) {
      fetchZipData(zip);
    }
  }, [zip]);

  const handleZipChange = (e) => {
    const inputValue = e.target.value;
    console.log('ZIP input value:', inputValue); // Debug log
    
    // Only allow digits
    const digitsOnly = inputValue.replace(/\D/g, '').slice(0, 5);
    console.log('ZIP digits only:', digitsOnly); // Debug log
    console.log('Calling onZipChange with:', digitsOnly); // Debug parent call
    
    // Update local state immediately for responsive UI
    setLocalZip(digitsOnly);
    
    // Update parent state - ensure it's called
    if (typeof onZipChange === 'function') {
      onZipChange(digitsOnly);
    } else {
      console.error('onZipChange is not a function!');
    }

    // Clear city/state when typing
    if (digitsOnly.length < 5) {
      onCityChange('');
      onStateChange('');
    } else if (digitsOnly.length === 5) {
      // Fetch city/state when complete
      console.log('Fetching data for ZIP:', digitsOnly);
      fetchZipData(digitsOnly);
    }
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    onCityChange(newCity);
  };

  const handleStateChange = (e) => {
    const newState = e.target.value.toUpperCase().slice(0, 2);
    onStateChange(newState);
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
              value={localZip}
              onChange={handleZipChange}
              onInput={(e) => console.log('ZIP onInput:', e.target.value)} // Additional debug
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
              } ${localZip && localZip.length === 5 && city ? 'bg-opacity-50' : ''}`}
              placeholder={placeholders.city}
              readOnly={!!(localZip && localZip.length === 5 && city)}
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
              } ${localZip && localZip.length === 5 && state ? 'bg-opacity-50' : ''}`}
              placeholder={placeholders.state}
              readOnly={!!(localZip && localZip.length === 5 && state)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
