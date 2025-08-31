import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));
// We'll create this Ground component next
const Ground = lazy(() => import('./pages/customers/Ground'));

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
          {/* Add more routes as needed */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </QuoteLayout>
  );
};

export default QuotesModule;
