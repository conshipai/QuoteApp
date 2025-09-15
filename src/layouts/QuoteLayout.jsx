// QuotesModule.jsx - ADD REAL DASHBOARD
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Try loading the real dashboard
const QuoteDashboard = lazy(() => import('./pages/QuoteDashboard'));

// Keep simple layout for now
const SimpleLayout = ({ children, userRole, isDarkMode }) => (
  <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className="flex">
      <div className="w-64 bg-gray-100 p-4">
        <h2>Simple Sidebar</h2>
        <p>Role: {userRole}</p>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  </div>
);

const QuotesModule = ({ shellContext, basename }) => {
  const { user, isDarkMode = false } = shellContext || {};
  const userRole = user?.role || 'guest';

  return (
    <SimpleLayout userRole={userRole} isDarkMode={isDarkMode}>
      <Suspense fallback={<div className="p-6">Loading dashboard...</div>}>
        <Routes>
          <Route index element={<QuoteDashboard isDarkMode={isDarkMode} userRole={userRole} />} />
          <Route path="ground" element={<div>Ground Page</div>} />
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </Suspense>
    </SimpleLayout>
  );
};

export default QuotesModule;
