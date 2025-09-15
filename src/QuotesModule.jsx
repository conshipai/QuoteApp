// QuotesModule.jsx - FIXED VERSION
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';
import CarrierQuoteSubmission from './pages/CarrierQuoteSubmission';
import CostsManagement from './pages/CostsManagement';
// import { useShellAuth } from './hooks/useShellAuth'; // COMMENT THIS OUT FOR NOW

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
  // FIX: Provide fallback values if useShellAuth doesn't work
  // const { isDarkMode } = useShellAuth(); // REMOVE THIS
  
  // TEMPORARY FIX - Use shell context directly with fallback
  const isDarkMode = window.shellContext?.theme === 'dark' || false;
  const userRole = useUserRole();

  // Add debug code in useEffect so it doesn't break the component
  useEffect(() => {
    // Only run debug after component mounts successfully
    console.log('=== TOKEN DEBUG (from QuotesModule) ===');
    
    if (window.shellContext?.token) {
      console.log('Token exists:', true);
      console.log('Token length:', window.shellContext.token.length);
      console.log('Token first 30 chars:', window.shellContext.token.substring(0, 30));
      
      // Check localStorage
      const storedToken = localStorage.getItem('auth_token');
      console.log('localStorage has token:', !!storedToken);
      
      // Make a simple test request
      fetch('https://api.gcc.conship.ai/api/quotes/recent', {
        headers: {
          'Authorization': `Bearer ${window.shellContext.token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => {
        console.log('Test request status:', res.status);
        if (res.status === 401) {
          res.json().then(data => console.log('401 response:', data));
        }
      });
    } else {
      console.log('No token in shellContext');
    }
  }, []);

  // Rest of your component...
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
