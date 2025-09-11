import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck,
  Grid3x3,
  Home,
  Plane, 
  Ship, 
  Truck, 
  Package,
  ChevronLeft,
  ChevronRight,
  Import,
  Share2,
  History,
  Book,     // Added for Address Book
  Users,    // Alternative icon option
  Bug       // Added for Debug Dashboard
} from 'lucide-react';

const QuoteLayout = ({ children, userRole, isDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isForeignAgent = userRole === 'foreign_agent';

  // Navigation items based on user role
  const navItems = [
    // Dashboard at top
    {
      path: '/app/quotes',
      label: 'Dashboard',
      icon: Home,
      color: 'purple',
      available: true
    },
    // NEW: Address Book link (visible to everyone)
    {
      path: '/app/quotes/address-book',
      label: 'Address Book',
      icon: Book,
      color: 'blue',
      available: true
    },
    {
      path: '/app/quotes/costs',
      label: 'Costs',
      icon: Grid3x3, // Import from lucide-react
      color: 'yellow',
      available: userRole === 'conship_employee' || userRole === 'system_admin'
    },
    // Bookings link
    {
      path: '/app/quotes/bookings',
      label: 'Bookings',
      icon: Package,
      color: 'indigo',
      available: true
    },
    {
      path: '/app/quotes/product-catalog',
      label: 'Product Catalog',
      icon: Package,
      color: 'green',
      available: true
    },
    {
      path: '/app/quotes/carriers',
      label: 'Carriers',
      icon: ShieldCheck,
      color: 'red',
      available: userRole === 'conship_employee' || userRole === 'system_admin'
    },
    // Quote History
    {
      path: '/app/quotes/history',
      label: 'Quote History',
      icon: History,
      color: 'amber',
      available: true
    },
    // Service types
    {
      path: '/app/quotes/ground',
      label: 'Ground Domestic',
      icon: Truck,
      color: 'green',
      available: !isForeignAgent
    },
    {
      path: '/app/quotes/air-import',
      label: 'Air Import',
      icon: Plane,
      subIcon: Import,
      color: 'blue',
      available: true
    },
    {
      path: '/app/quotes/air-export',
      label: 'Air Export',
      icon: Plane,
      subIcon: Share2,
      color: 'blue',
      available: !isForeignAgent
    },
    {
      path: '/app/quotes/ocean-import',
      label: 'Ocean Import',
      icon: Ship,
      subIcon: Import,
      color: 'teal',
      available: true
    },
    {
      path: '/app/quotes/ocean-export',
      label: 'Ocean Export',
      icon: Ship,
      subIcon: Share2,
      color: 'teal',
      available: !isForeignAgent
    },
    {
      path: '/app/quotes/project',
      label: 'Project Cargo',
      icon: Package,
      color: 'orange',
      available: !isForeignAgent
    }
  ].filter(item => item.available);

  // Issue 1: Fix Navigation Highlighting
  const getNavItemClasses = (item) => {
    // Exact match for dashboard; prefix match for others
    const isActive = item.path === '/app/quotes'
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

    const baseClasses = `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200`;

    if (isActive) {
      return `${baseClasses} bg-conship-purple text-white`;
    }
    if (isDarkMode) {
      return `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    return `${baseClasses} text-gray-700 hover:bg-gray-100 hover:text-conship-purple`;
  };

  return (
    <div className="flex h-full relative">
      {/* Sidebar - Always visible, responsive width */}
      <div className={`transition-all duration-300 flex-shrink-0 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r ${
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="p-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2
              className={`font-bold text-lg transition-all duration-300 overflow-hidden ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
              } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              QUOTES
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const SubIcon = item.subIcon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={getNavItemClasses(item)}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5" />
                    {SubIcon && (
                      <SubIcon className="w-3 h-3 absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  {sidebarOpen && (
                    <span className="transition-all duration-300 whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Issue 2: Fix User Role Display */}
          {sidebarOpen && (
            <div className={`mt-8 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Logged in as
              </p>
              <p className={`text-sm font-bold mt-1 ${
                isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
              }`}>
                {userRole === 'system_admin' ? 'System Admin' :
                 userRole === 'conship_employee' ? 'Conship Employee' :
                 isForeignAgent ? 'Foreign Agent' : 'Customer'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Debug Button - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => navigate('/app/quotes/debug')}
          className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
            isDarkMode 
              ? 'bg-red-600 text-white hover:bg-red-500' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title="Debug Dashboard"
        >
          <Bug className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default QuoteLayout;
