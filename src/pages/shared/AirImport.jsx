import React from 'react';
import { useNavigate } from 'react-router-dom';

const AirImport = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Air Import Quote
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Air Import module is under construction
          </p>
        </div>
        
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            This feature is coming soon. Please use Ground shipping for now.
          </p>
          <button 
            onClick={() => navigate('/quotes')}
            className={`mt-4 px-4 py-2 rounded ${isDarkMode ? 'bg-conship-orange text-white' : 'bg-conship-purple text-white'}`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirImport;
