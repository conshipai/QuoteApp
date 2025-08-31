import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));

// Create Ground component inline for now (we'll move it to a file next)
const Ground = ({ isDarkMode, userRole }) => {
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Ground LTL Quote
      </h1>
      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Create a Less Than Truckload shipment quote
      </p>
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <p>LTL Form coming next...</p>
      </div>
    </div>
  );
};

const QuotesModule = ({ shellContext, basename }) => {
  const { user, isDarkMode, token } = shellContext || {};
  const userRole = useUserRole({ user });
  
  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading quotes module...
        </div>
      </div>
    );
  }
  
  return (
    <QuoteLayout userRole={userRole} isDarkMode={isDarkMode}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading...
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<QuoteDashboard isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="/air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="/ground" element={<Ground isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </QuoteLayout>
  );
};

export default QuotesModule;
