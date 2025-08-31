import React from 'react';
import { Truck } from 'lucide-react';

const AccessorialOptions = ({ 
  accessorials,
  onChange,
  isDarkMode 
}) => {
  const options = [
    { key: 'liftgatePickup', label: 'Liftgate - Pickup' },
    { key: 'liftgateDelivery', label: 'Liftgate - Delivery' },
    { key: 'residentialDelivery', label: 'Residential Delivery' },
    { key: 'insideDelivery', label: 'Inside Delivery' },
    { key: 'limitedAccessPickup', label: 'Limited Access - Pickup' },
    { key: 'limitedAccessDelivery', label: 'Limited Access - Delivery' }
  ];

  return (
    <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center mb-4">
        <Truck className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Additional Services
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map(option => (
          <label key={option.key} className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={accessorials[option.key] || false}
              onChange={(e) => onChange(option.key, e.target.checked)}
              className="mr-2"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default AccessorialOptions;
