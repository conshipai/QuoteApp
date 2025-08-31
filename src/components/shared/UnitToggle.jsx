import React from 'react';

const UnitToggle = ({ value, onChange, isDarkMode }) => {
  return (
    <div className={`rounded-lg shadow-sm p-6 mb-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-medium ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Measurement Units
        </h2>
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${
            value === 'imperial' 
              ? isDarkMode ? 'text-conship-orange font-medium' : 'text-conship-purple font-medium'
              : isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Imperial (lbs/in)
          </span>
          <button
            type="button"
            onClick={() => onChange(value === 'imperial' ? 'metric' : 'imperial')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-conship-orange' : 'bg-conship-purple'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value === 'metric' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className={`text-sm ${
            value === 'metric' 
              ? isDarkMode ? 'text-conship-orange font-medium' : 'text-conship-purple font-medium'
              : isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Metric (kg/cm)
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnitToggle;
