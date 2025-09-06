import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));
const Ground = lazy(() => import('./pages/customers/Ground'));
const BookingsManagement = lazy(() => import('./pages/BookingsManagement'));
const QuoteHistory = lazy(() => import('./pages/QuoteHistory'));
const AddressBookPage = lazy(() => import('./pages/AddressBookPage'));  // NEW
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage'));

// Create placeholder components for routes that don't have pages yet
const Placeholder = ({ title, isDarkMode }) => (
  <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </h1>
    <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      This page is under construction
    </p>
  </div>
);

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
          {/* All routes WITHOUT leading slashes - relative to basename */}
          <Route index element={<QuoteDashboard isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="address-book" element={<AddressBookPage isDarkMode={isDarkMode} userRole={userRole} />} />  {/* NEW */}
          <Route path="product-catalog" element={<ProductCatalogPage isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="bookings" element={<BookingsManagement isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="history" element={<QuoteHistory isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="ground" element={<Ground isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="air-export" element={<Placeholder title="Air Export" isDarkMode={isDarkMode} />} />
          <Route path="ocean-import" element={<Placeholder title="Ocean Import" isDarkMode={isDarkMode} />} />
          <Route path="ocean-export" element={<Placeholder title="Ocean Export" isDarkMode={isDarkMode} />} />
          <Route path="project" element={<Placeholder title="Project Cargo" isDarkMode={isDarkMode} />} />
          <Route path="ground/results/:requestId" element={<GroundQuoteResults isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </Suspense>
    </QuoteLayout>
  );
};

export default QuotesModule;
