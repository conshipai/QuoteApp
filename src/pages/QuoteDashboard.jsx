// src/pages/quotes/QuoteDashboard.jsx
import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Package,
  Activity,
  Users,
} from 'lucide-react';

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

  // Test creating a booking
  const testBookingAPI = async () => {
    console.log('Testing booking API...');
    try {
      const testBooking = {
        quoteData: {
          service_details: {
            carrier: 'Test Carrier'
          },
          final_price: 100.00
        },
        requestId: 'test-request-123',
        shipmentData: {
          formData: {
            originCity: 'Las Vegas',
            originState: 'NV',
            destCity: 'Los Angeles',
            destState: 'CA'
          }
        }
      };

      const response = await fetch('https://api.gcc.conship.ai/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testBooking)
      });

      const data = await response.json();
      console.log('Booking API response:', data);

      if (data.success) {
        alert(`SUCCESS! Created booking: ${data.booking.confirmationNumber}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Booking API error:', error);
      alert('Failed to test booking API');
    }
  };

  // --- widgets config omitted for brevity (unchanged) ---

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

        {/* Test Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={testBackendConnection}
            className="px-4 py-2 h-10 self-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Test API Connection
          </button>
          <button 
            onClick={testBookingAPI}
            className="px-4 py-2 h-10 self-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Booking API
          </button>
        </div>
      </div>

      {/* Widgets Grid (unchanged) */}
      {/* ... */}
    </div>
  );
};

export default QuoteDashboard;
