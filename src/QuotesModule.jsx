// QuotesModule.jsx - MINIMAL WORKING VERSION
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const QuotesModule = ({ shellContext, basename }) => {
  const { user, isDarkMode = false } = shellContext || {};
  const userRole = user?.role || 'guest';

  console.log('QuotesModule mounted:', { 
    userRole, 
    isDarkMode, 
    user: user?.email,
    basename 
  });

  // Simple test component
  const TestDashboard = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quotes Module Working!</h1>
      <div className="space-y-2">
        <p>User: {user?.email || 'No user'}</p>
        <p>Role: {userRole}</p>
        <p>Dark Mode: {isDarkMode ? 'Yes' : 'No'}</p>
        <p>Current Path: {window.location.pathname}</p>
      </div>
      <div className="mt-4 space-x-4">
        <a href="/app/quotes/ground" className="text-blue-500 underline">Go to Ground</a>
        <a href="/app/quotes/history" className="text-blue-500 underline">Go to History</a>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <Routes>
        <Route path="*" element={<TestDashboard />} />
      </Routes>
    </div>
  );
};

export default QuotesModule;
