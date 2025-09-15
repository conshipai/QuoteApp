// --- keep your existing imports ---
import React, { Suspense, lazy, useEffect } from 'react';  // ADD useEffect
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

// Your component function starts here
const QuotesModule = () => {  // or whatever your component is named
  const { isDarkMode } = useShellAuth();
  const userRole = useUserRole();

  // ADD THIS useEffect for debugging
  useEffect(() => {
    console.log('=== TOKEN DEBUG ===');
    
    if (window.shellContext?.token) {
      console.log('Raw token from shell:', window.shellContext.token);
      console.log('Token length:', window.shellContext.token.length);
      console.log('Token first 50 chars:', window.shellContext.token.substring(0, 50));
      console.log('Token includes Bearer?:', window.shellContext.token.includes('Bearer'));
      console.log('Token parts (split by .):', window.shellContext.token.split('.').length);
      
      // Try to decode if it's a JWT
      if (window.shellContext.token.split('.').length === 3) {
        try {
          const tokenWithoutBearer = window.shellContext.token.replace('Bearer ', '');
          const payload = JSON.parse(atob(tokenWithoutBearer.split('.')[1]));
          console.log('JWT payload:', payload);
          console.log('Token expires:', new Date(payload.exp * 1000));
        } catch (e) {
          console.log('Could not decode as JWT:', e.message);
        }
      }
    }

    // Also check localStorage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      console.log('localStorage token first 50 chars:', storedToken.substring(0, 50));
      console.log('localStorage token same as shell?:', storedToken === window.shellContext?.token);
    }

    // Shell API check
    console.log('=== SHELL API CHECK ===');
    console.log('window.shellAxios exists?', !!window.shellAxios);
    console.log('window.shellApi exists?', !!window.shellApi);
    console.log('window.shellAuth exists?', !!window.shellAuth);
    console.log('window.shellContext exists?', !!window.shellContext);

    // Test direct request
    async function testDirectRequest() {
      const token = window.shellContext?.token || localStorage.getItem('auth_token');
      
      console.log('=== DIRECT REQUEST TEST ===');
      
      // Try with Bearer prefix
      try {
        const response1 = await fetch('https://api.gcc.conship.ai/api/quotes/recent', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('With "Bearer token":', response1.status);
        if (response1.status === 401) {
          const error = await response1.json();
          console.log('Error response:', error);
        }
      } catch (e) {
        console.log('Request 1 failed:', e);
      }
    }

    // Run test after a short delay
    setTimeout(testDirectRequest, 1000);
  }, []); // Empty dependency array means this runs once when component mounts

  // Rest of your component code continues here...
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Your routes... */}
      </Routes>
    </Suspense>
  );
};

export default QuotesModule;
