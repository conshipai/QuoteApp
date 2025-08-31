import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));

const Ground = ({ isDarkMode, userRole }) => {
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Ground LTL Quote - IT WORKS!
      </h1>
      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        If you see this, routing is working!
      </p>
    </div>
  );
};

const QuotesModule = ({ shellContext, basename }) => {
  const { user, isDarkMode, token } = shellContext || {};
  const userRole = useUserRole({ user });
  const location = useLocation();
  
  // DEBUG: Log the current path
  useEffect(() => {
    console.log('QuotesModule - Current location:', location.pathname);
    console.log('QuotesModule - Basename:', basename);
  }, [location, basename]);
  
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
          {/* Try both patterns */}
          <Route path="/" element={<QuoteDashboard isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="/ground" element={<Ground isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="/air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} />} />
          
          {/* Also try without leading slash */}
          <Route path="ground" element={<Ground isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} />} />
          
          {/* Catch all - show what path we're getting */}
          <Route path="*" element={
            <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <h1>Route not found</h1>
              <p>Current path: {location.pathname}</p>
              <p>Basename: {basename || 'not set'}</p>
            </div>
          } />
        </Routes>
      </Suspense>
    </QuoteLayout>
  );
};

export default QuotesModule;
