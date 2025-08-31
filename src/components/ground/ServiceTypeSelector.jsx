import React from 'react';
import { Truck, Package, Clock } from 'lucide-react';

const ServiceTypeSelector = ({ onSelect, isDarkMode }) => {
  const services = [
    {
      id: 'ltl',
      title: 'LTL',
      subtitle: 'Less Than Truckload',
      description: 'For shipments that don\'t require a full trailer',
      icon: Package,
      color: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    },
    {
      id: 'ftl',
      title: 'FTL',
      subtitle: 'Full Truckload',
      description: 'Dedicated trailer for your shipment',
      icon: Truck,
      color: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    },
    {
      id: 'expedited',
      title: 'Expedited',
      subtitle: 'Time-Critical Shipping',
      description: 'Guaranteed delivery times for urgent shipments',
      icon: Clock,
      color: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Ground Service Type
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose the service that best fits your shipping needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onSelect(service.id)}
                className={`
                  p-6 rounded-lg border-2 transition-all duration-200 text-left
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-conship-orange' 
                    : 'bg-white border-gray-200 hover:border-conship-purple'
                  }
                  ${service.color}
                  transform hover:scale-105 hover:shadow-lg
                `}
              >
                <div className="flex items-start mb-4">
                  <Icon className={`w-8 h-8 ${
                    isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
                  }`} />
                </div>
                
                <h3 className={`text-xl font-bold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {service.title}
                </h3>
                
                <p className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {service.subtitle}
                </p>
                
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className={`mt-12 p-6 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Not sure which service to choose?
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <span className={`font-semibold mr-2 ${
                isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
              }`}>LTL:</span>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Best for 1-6 pallets or shipments under 10,000 lbs
              </span>
            </div>
            
            <div className="flex items-start">
              <span className={`font-semibold mr-2 ${
                isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
              }`}>FTL:</span>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Best for 10+ pallets, over 10,000 lbs, or when you need the entire trailer
              </span>
            </div>
            
            <div className="flex items-start">
              <span className={`font-semibold mr-2 ${
                isDarkMode ? 'text-conship-orange' : 'text-conship-purple'
              }`}>Expedited:</span>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Best when delivery time is critical and cost is secondary
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
