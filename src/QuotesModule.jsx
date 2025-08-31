import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));

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
          <Route path="/*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </QuoteLayout>
  );
};

export default QuotesModule;
