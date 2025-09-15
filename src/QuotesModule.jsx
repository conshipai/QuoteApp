// QuotesModule.jsx - FIXED VERSION
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';
import CarrierQuoteSubmission from './pages/CarrierQuoteSubmission';
import CostsManagement from './pages/CostsManagement';
import { useShellAuth } from './hooks/useShellAuth';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));
const Ground = lazy(() => import('./pages/Ground')); // Use your new Ground
const BookingsManagement = lazy(() => import('./pages/BookingsManagement'));
const QuoteHistory = lazy(() => import('./pages/QuoteHistory'));
const AddressBookPage = lazy(() => import('./pages/AddressBookPage'));
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage'));
const GroundQuoteResults = lazy(() => import('./components/ground/QuoteResults'));
const QuoteDebug = lazy(() => import('./components/debug/QuoteStatusDashboard'));

// Simple placeholder for unfinished pages
const Placeholder = ({ title, isDarkMode }) => (
  <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
    <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>This page is under construction</p>
  </div>
);

// IMPORTANT: Accept shellContext and basename as props
const QuotesModule = ({ shellContext, basename }) => {
  // Initialize shell auth
  useShellAuth();

  // Get values from shellContext (passed by the shell)
  const { user, isDarkMode } = shellContext || {};
  const userRole = useUserRole({ user }); // Pass user object to hook

  // Show loading if no user role yet
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
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Loading...
            </div>
          </div>
        }
      >
        <Routes>
          {/* Routes WITHOUT leading slashes - relative to basename */}
          <Route index element={<QuoteDashboard isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="ground" element={<Ground isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="ground/results/:requestId" element={<GroundQuoteResults isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="air-export" element={<Placeholder title="Air Export" isDarkMode={isDarkMode} />} />
          <Route path="ocean-import" element={<Placeholder title="Ocean Import" isDarkMode={isDarkMode} />} />
          <Route path="ocean-export" element={<Placeholder title="Ocean Export" isDarkMode={isDarkMode} />} />
          <Route path="bookings" element={<BookingsManagement isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="history" element={<QuoteHistory isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="address-book" element={<AddressBookPage isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="product-catalog" element={<ProductCatalogPage isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="costs" element={<CostsManagement isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="debug" element={<QuoteDebug isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="carrier/quote/:token" element={<CarrierQuoteSubmission />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </Suspense>
    </QuoteLayout>
  );
};

export default QuotesModule;
