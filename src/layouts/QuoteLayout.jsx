import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  Plane, 
  Ship, 
  Truck, 
  Package,
  ChevronLeft,
  ChevronRight,
  Import,
  Share2,
  Menu,
  X
} from 'lucide-react';

const QuoteLayout = ({ children, userRole, isDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isForeignAgent = userRole === 'foreign_agent';

  // Navigation items based on user role
  const navItems = [
    {
      path: '/quotes',
      label: 'Dashboard',
      icon: Home,
      color: 'purple',
      available: true
    },
    {
      path: '/quotes/air-import',
      label: 'Air Import',
      icon: Plane,
      subIcon: Import,
      color: 'blue',
      available: true
    },
    {
      path: '/quotes/air-export',
      label: 'Air Export',
      icon: Plane,
      subIcon: Share2,
      color: 'blue',
      available: !isForeignAgent
    },
    {
      path: '/quotes/ocean-import',
      label: 'Ocean Import',
      icon: Ship,
      subIcon: Import,
      color: 'teal',
      available: true
    },
    {
      path: '/quotes/ocean-export',
      label: 'Ocean Export',
      icon: Ship,
      subIcon: Share2,
      color: 'teal',
      available: !isForeignAgent
    },
    {
      path: '/quotes/ground',
      label: 'Ground Domestic',
      icon: Truck,
      color: 'green',
      available: !isForeignAgent
    },
    {
      path: '/quotes/project',
      label: 'Project Cargo',
      icon: Package,
      color: 'orange',
      available: !isForeignAgent
    }
  ].filter(item => item.available);

  const getNavItemClasses = (item) => {
    const isActive = location.pathname === item.path;
    const baseClasses = `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200`;
    
    if (isActive) {
      if (isDarkMode) {
        return `${baseClasses} bg-conship-purple text-white`;
      }
      return `${baseClasses} bg-conship-purple text-white`;
    }
    
    if (isDarkMode) {
      return `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    return `${baseClasses} text-gray-700 hover:bg-gray-100 hover:text-conship-purple`;
  };

  return (
    <div className="flex h-full">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 shadow-md'
        }`}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar - Desktop */}
      <div className={`hidden lg:block transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r ${
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="p-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className={`font-bold text-lg transition-all duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
            } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: "'Orbitron', monospace" }}>
              QUOTES
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
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
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {SubIcon && (
                      <SubIcon className="w-3 h-3 absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  {sidebarOpen && (
                    <span className="transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Role Indicator */}
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
                {isForeignAgent ? 'Foreign Agent' : 'Customer'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className={`lg:hidden fixed inset-0 z-40 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className="p-4 pt-16">
            <h2 className={`font-bold text-lg mb-8 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontFamily: "'Orbitron', monospace" }}>
              QUOTES
            </h2>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const SubIcon = item.subIcon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavItemClasses(item)}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {SubIcon && (
                        <SubIcon className="w-3 h-3 absolute -bottom-1 -right-1" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default QuoteLayout;
