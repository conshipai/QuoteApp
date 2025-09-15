// QuotesModule.jsx - TEST WITHOUT NAVLINK
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simplified QuoteLayout without NavLink for testing
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

  const TestDashboard = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Works!</h1>
    </div>
  );

  return (
    <SimpleLayout userRole={userRole} isDarkMode={isDarkMode}>
      <Routes>
        <Route index element={<TestDashboard />} />
        <Route path="ground" element={<div>Ground Page</div>} />
        <Route path="history" element={<div>History Page</div>} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </SimpleLayout>
  );
};

export default QuotesModule;
