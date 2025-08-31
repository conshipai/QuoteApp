import React from 'react';
import { Info } from 'lucide-react';

const IncotermSelector = ({ 
  value, 
  onChange, 
  userRole, 
  direction,
  isDarkMode,
  errors 
}) => {
  const isForeignAgent = userRole === 'foreign_agent';
  
  // Foreign agents see inverse incoterms for imports
  const getIncotermLabel = (incoterm) => {
    if (isForeignAgent && direction === 'import') {
      // Inverse for foreign agents representing buyers
      const inverseMap = {
        'EXW': 'DDP - Delivered Duty Paid',
        'FCA': 'DAP - Delivered at Place'
      };
      return inverseMap[incoterm] || incoterm;
    }
    
    // Standard for customers
    const standardMap = {
      'EXW': 'EXW - Ex Works',
      'FCA': 'FCA - Free Carrier'
    };
    return standardMap[incoterm] || incoterm;
  };
  
  const getIncotermDescription = (incoterm) => {
    if (isForeignAgent && direction === 'import') {
      const descriptions = {
        'EXW': 'Full door-to-door service with all duties paid',
        'FCA': 'Delivery to final destination, duties not included'
      };
      return descriptions[incoterm];
    }
    
    const descriptions = {
      'EXW': 'Pickup from seller\'s location. Enter ZIP code to determine origin airport.',
      'FCA': 'Delivery to gateway airport warehouse. Select from available US gateways.'
    };
    return descriptions[incoterm];
  };

  return (
    <div className={`rounded-lg shadow-sm p-6 mb-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h2 className={`text-lg font-medium mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Incoterm Selection
      </h2>
      
      {isForeignAgent && (
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
        }`}>
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            As a foreign agent, you're arranging import on behalf of the buyer. 
            Terms shown reflect buyer's perspective.
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {['EXW', 'FCA'].map((incoterm) => (
          <label 
            key={incoterm}
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
              value === incoterm 
                ? isDarkMode 
                  ? 'border-conship-orange bg-orange-900/20' 
                  : 'border-conship-purple bg-purple-50'
                : isDarkMode
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="incoterm"
              value={incoterm}
              checked={value === incoterm}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-4 w-4 text-conship-purple"
            />
            <div className="ml-3 flex-1">
              <div className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getIncotermLabel(incoterm)}
              </div>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getIncotermDescription(incoterm)}
              </p>
            </div>
          </label>
        ))}
      </div>
      
      {errors?.incoterm && (
        <p className="mt-2 text-sm text-red-600">{errors.incoterm}</p>
      )}
    </div>
  );
};

export default IncotermSelector;
