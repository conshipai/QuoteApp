import React from 'react';

const Ground = ({ isDarkMode, userRole }) => {
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Ground LTL Quote
      </h1>
      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Ground shipping quote form will go here
      </p>
      
      {/* We'll add the actual form next */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <p>Form coming soon...</p>
      </div>
    </div>
  );
};

export default Ground;
