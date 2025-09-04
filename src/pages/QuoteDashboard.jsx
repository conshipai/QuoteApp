import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Plane, Anchor, FileText, Clock, Plus } from 'lucide-react';
import RecentQuotes from '../components/dashboard/RecentQuotes';

const QuoteDashboard = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Ground Shipping',
      icon: Truck,
      description: 'LTL, FTL, and Expedited',
      path: '/app/quotes/ground',
      color: 'bg-blue-500'
    },
    {
      title: 'Air Freight',
      icon: Plane,
      description: 'Import and Export',
      path: '/app/quotes/air-import',
      color: 'bg-sky-500'
    },
    {
      title: 'Ocean Freight',
      icon: Anchor,
      description: 'FCL and LCL',
      path: '/app/quotes/ocean',
      color: 'bg-teal-500'
    }
  ];

  const stats = [
    { label: 'Active Quotes', value: '12', icon: FileText },
    { label: 'Pending', value: '3', icon: Clock },
    { label: 'This Month', value: '45', icon: Package }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Dashboard
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage freight quotes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Create New Quote
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-conship-orange'
                      : 'bg-white border-gray-200 hover:border-conship-purple'
                  } hover:shadow-lg`}
                >
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Quotes Component */}
          <div className="mt-8">
          <RecentQuotes isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default QuoteDashboard;
