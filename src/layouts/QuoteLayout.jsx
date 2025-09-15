// src/layouts/QuoteLayout.jsx - FIXED VERSION
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';  // Changed NavLink to Link
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
  Book,
  Bug
} from 'lucide-react';

const QuoteLayout = ({ children, userRole, isDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isForeignAgent = userRole === 'foreign_agent';

  // Navigation items
  const navItems = [
    {
      path: '/app/quotes',
      label: 'Dashboard',
      icon: Home,
      color: 'purple',
      available: true
    },
    // ... rest of your nav items
  ].filter(item => item.available);

  const getNavItemClasses = (item) => {
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
      {/* Sidebar */}
      <div className={`transition-all duration-300 flex-shrink-0 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r ${
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="p-4">
          {/* Navigation - Using Link instead of NavLink */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const SubIcon = item.subIcon;

              return (
                <Link
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
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default QuoteLayout;
