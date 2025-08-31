import React from 'react';

const AirImport = ({ isDarkMode, userRole }) => {
  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Air Import
      </h1>
      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Air import quote form coming soon...
      </p>
    </div>
  );
};

export default AirImport;
