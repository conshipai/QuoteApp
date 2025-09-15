// QuotesModule.jsx - WITH LAYOUT
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuoteLayout from './layouts/QuoteLayout';

const QuotesModule = ({ shellContext, basename }) => {
  const { user, isDarkMode = false } = shellContext || {};
  const userRole = user?.role || 'guest';

  const TestDashboard = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Works!</h1>
    </div>
  );

  return (
    <QuoteLayout userRole={userRole} isDarkMode={isDarkMode}>
      <Routes>
        <Route index element={<TestDashboard />} />
        <Route path="ground" element={<div>Ground Page</div>} />
        <Route path="history" element={<div>History Page</div>} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </QuoteLayout>
  );
};

export default QuotesModule;
