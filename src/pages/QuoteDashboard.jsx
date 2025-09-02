// src/pages/quotes/QuoteDashboard.jsx
import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Package,
  Activity,
  Users,
  Loader2
} from 'lucide-react';
import RecentQuotes from '../components/dashboard/RecentQuotes';  // ✅ Added import

const QuoteDashboard = ({ isDarkMode, userRole }) => {
  const isForeignAgent = userRole === 'foreign_agent';

  // Test connection to api.gcc.conship.ai
  const testBackendConnection = async () => {
    console.log('Testing connection to api.gcc.conship.ai...');
    try {
      const response = await fetch('https://api.gcc.conship.ai/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connected!', data);
        alert('SUCCESS! Connected to api.gcc.conship.ai');
      } else {
        console.log('❌ Backend responded with:', response.status);
        alert(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      alert('Failed to connect to api.gcc.conship.ai');
    }
  };

  // Widget placeholders - these will be replaced with actual widgets later
  const widgets = [
    {
      id: 'recent-quotes',
      title: 'Recent Quotes',
      icon: Clock,
      color: 'purple',
      value: '12',
      subtitle: 'Last 7 days'
    },
    {
      id: 'pending-approval',
      title: 'Pending Approval',
      icon: Package,
      color: 'orange',
      value: '3',
      subtitle: 'Awaiting review'
    },
    {
      id: 'quote-value',
      title: 'Total Quote Value',
      icon: DollarSign,
      color: 'green',
      value: '$48,250',
      subtitle: 'This month'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      icon: TrendingUp,
      color: 'blue',
      value: '68%',
      subtitle: '+5% from last month'
    },
    {
      id: 'active-customers',
      title: isForeignAgent ? 'Active Buyers' : 'Active Customers',
      icon: Users,
      color: 'purple',
      value: '24',
      subtitle: 'Currently active'
    },
    {
      id: 'performance',
      title: 'Performance Score',
      icon: Activity,
      color: 'orange',
      value: '94%',
      subtitle: 'Efficiency rating'
    }
  ];

  const getWidgetColorClasses = (color) => {
    const colorMap = {
      purple: {
        bg: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100',
        text: isDarkMode ? 'text-purple-400' : 'text-conship-purple',
        icon: isDarkMode ? 'text-purple-400' : 'text-conship-purple'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100',
        text: isDarkMode ? 'text-orange-400' : 'text-conship-orange',
        icon: isDarkMode ? 'text-orange-400' : 'text-conship-orange'
      },
      green: {
        bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
        text: isDarkMode ? 'text-green-400' : 'text-green-600',
        icon: isDarkMode ? 'text-green-400' : 'text-green-600'
      },
      blue: {
        bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
        text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        icon: isDarkMode ? 'text-blue-400' : 'text-blue-600'
      }
    };
    return colorMap[color] || colorMap.purple;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 
            className={`text-2xl font-bold tracking-wider mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            QUOTE COMMAND CENTER
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isForeignAgent 
              ? 'Manage import quotes for your buyers' 
              : 'Create and manage freight quotes'
            }
          </p>
        </div>

        {/* Test API Connection Button */}
        <button 
          onClick={testBackendConnection}
          className="px-4 py-2 h-10 self-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Test API Connection
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          const colors = getWidgetColorClasses(widget.color);
          
          return (
            <div
              key={widget.id}
              className={`p-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
              
              <h3 className={`text-2xl font-bold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {widget.value}
              </h3>
              
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {widget.title}
              </p>
              
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {widget.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Bar */}
      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <p className={`text-2xl font-bold ${
            isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
          }`}>
            {isForeignAgent ? '2' : '6'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Available Services
          </p>
        </div>
        
        <div className="text-center">
          <p className={`text-2xl font-bold ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`}>
            98%
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Success Rate
          </p>
        </div>
        
        <div className="text-center">
          <p className={`text-2xl font-bold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            1.2h
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Avg Response Time
          </p>
        </div>
        
        <div className="text-center">
          <p className={`text-2xl font-bold ${
            isDarkMode ? 'text-purple-400' : 'text-conship-purple'
          }`}>
            156
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Quotes
          </p>
        </div>
      </div>

      {/* Recent Quotes Section - ADD THIS */}
      <div className="mt-8">
        <RecentQuotes isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default QuoteDashboard;
