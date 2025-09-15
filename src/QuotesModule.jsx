// QuotesModule.jsx - SAFE VERSION
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';
import CarrierQuoteSubmission from './pages/CarrierQuoteSubmission';
import CostsManagement from './pages/CostsManagement';
import { useShellAuth } from './hooks/useShellAuth';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));
const Ground = lazy(() => import('./pages/Ground'));
const BookingsManagement = lazy(() => import('./pages/BookingsManagement'));
const QuoteHistory = lazy(() => import('./pages/QuoteHistory'));
const AddressBookPage = lazy(() => import('./pages/AddressBookPage'));
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage'));
const GroundQuoteResults = lazy(() => import('./components/ground/QuoteResults'));
const QuoteDebug = lazy(() => import('./components/debug/QuoteStatusDashboard'));

const QuotesModule = () => {
  // Use hooks with fallbacks
  const authData = useShellAuth() || {};
  const isDarkMode = authData.isDarkMode ?? false;
  const userRole = useUserRole() || 'guest';

  useEffect(() => {
    console.log('QuotesModule initialized:', {
      isDarkMode,
      userRole,
      hasToken: !!authData.token,
      user: authData.user?.email
    });
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<QuoteLayout isDarkMode={isDarkMode} />}>
          <Route index element={<QuoteDashboard isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="ground" element={<Ground isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="ground/results/:requestId" element={<GroundQuoteResults isDarkMode={isDarkMode} />} />
          <Route path="air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="bookings" element={<BookingsManagement isDarkMode={isDarkMode} />} />
          <Route path="bookings/:bookingId" element={<BookingsManagement isDarkMode={isDarkMode} />} />
          <Route path="history" element={<QuoteHistory isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="address-book" element={<AddressBookPage isDarkMode={isDarkMode} />} />
          <Route path="products" element={<ProductCatalogPage isDarkMode={isDarkMode} />} />
          <Route path="costs" element={<CostsManagement isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="debug" element={<QuoteDebug isDarkMode={isDarkMode} />} />
        </Route>
        <Route path="carrier/quote/:token" element={<CarrierQuoteSubmission />} />
      </Routes>
    </Suspense>
  );
};

export default QuotesModule;
