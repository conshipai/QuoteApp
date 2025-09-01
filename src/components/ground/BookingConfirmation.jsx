import React, { useState } from 'react';
import { Check, Printer, FileText, Truck, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingConfirmation = ({ booking, onCreateBOL, isDarkMode }) => {
  const navigate = useNavigate();
  const { confirmationNumber, pickupNumber, carrier, price, shipmentData } = booking;
  const formData = shipmentData.formData;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Success Banner */}
        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                Booking Confirmed!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                Confirmation: {confirmationNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Shipment Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carrier</p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{carrier}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pickup Number</p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pickupNumber}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Cost</p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${price.toFixed(2)}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pickup Date</p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(formData.pickupDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.originCity}, {formData.originState} → {formData.destCity}, {formData.destState}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Next Steps
          </h3>
          
          <ol className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Create and print the Bill of Lading (BOL)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Prepare shipment with proper labels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Driver will arrive on {new Date(formData.pickupDate).toLocaleDateString()}</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onCreateBOL(booking)}
            className={`flex-1 px-6 py-3 rounded font-medium flex items-center justify-center gap-2 ${
              isDarkMode 
                ? 'bg-conship-orange text-white hover:bg-orange-600' 
                : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Create BOL
          </button>
          
          <button
            onClick={() => navigate('/app/quotes/bookings')}
            className={`px-6 py-3 rounded font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
