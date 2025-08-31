import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';
import useUserRole from './hooks/useUserRole';

// Lazy load pages
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));
const AirImport = lazy(() => import('./pages/shared/AirImport'));
const AirExport = lazy(() => import('./pages/customers/AirExport'));
const OceanImport = lazy(() => import('./pages/shared/OceanImport'));
const OceanExport = lazy(() => import('./pages/customers/OceanExport'));
const Ground = lazy(() => import('./pages/customers/Ground'));
const Project = lazy(() => import('./pages/customers/Project'));

const QuotesModule = ({ user, isDarkMode, apiClient, ...props }) => {
  const userRole = useUserRole({ user, ...props });
  
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
          <Route path="/air-import" element={<AirImport isDarkMode={isDarkMode} userRole={userRole} apiClient={apiClient} />} /
