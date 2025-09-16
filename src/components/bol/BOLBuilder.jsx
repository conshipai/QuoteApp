// src/components/bol/BOLBuilder.jsx (or similar)
import React, { useState } from 'react';
import { FileText, Download, Loader } from 'lucide-react';
import bolApi from '../../services/bolApi';

const BOLBuilder = ({ booking, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [bolData, setBolData] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateBOL = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call backend to generate BOL
      const result = await bolApi.generateBOL(booking.bookingId);
      
      if (result.success) {
        setBolData(result);
        // Open PDF in new tab
        const pdfUrl = `${process.env.REACT_APP_API_URL || 'https://api.gcc.conship.ai'}${result.fileUrl}`;
        window.open(pdfUrl, '_blank');
      } else {
        setError(result.error || 'Failed to generate BOL');
      }
    } catch (error) {
      console.error('BOL generation error:', error);
      setError('Failed to generate BOL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBOL = () => {
    if (bolData?.fileUrl) {
      const pdfUrl = `${process.env.REACT_APP_API_URL || 'https://api.gcc.conship.ai'}${bolData.fileUrl}`;
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Bill of Lading
          </h2>

          {/* Booking Info Summary */}
          <div className={`mb-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Booking ID: {booking.bookingId}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Carrier: {booking.carrier || 'TBD'}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Route: {booking.shipmentData?.formData?.originCity} → {booking.shipmentData?.formData?.destCity}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* BOL Status */}
          {bolData && (
            <div className={`mb-6 p-4 rounded ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                ✓ BOL Generated Successfully
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                BOL Number: {bolData.bolNumber}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {!bolData ? (
              <button
                onClick={handleGenerateBOL}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded font-medium ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : isDarkMode 
                      ? 'bg-conship-orange text-white hover:bg-orange-600' 
                      : 'bg-conship-purple text-white hover:bg-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate BOL
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownloadBOL}
                  className={`flex items-center gap-2 px-6 py-2 rounded font-medium ${
                    isDarkMode 
                      ? 'bg-conship-orange text-white hover:bg-orange-600' 
                      : 'bg-conship-purple text-white hover:bg-purple-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  View BOL PDF
                </button>
                
                <button
                  onClick={handleGenerateBOL}
                  className={`flex items-center gap-2 px-6 py-2 rounded font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Regenerate
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className={`mt-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Next Steps:
            </h3>
            <ol className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>1. Generate the BOL PDF</li>
              <li>2. Print or email to carrier</li>
              <li>3. Have shipper sign at pickup</li>
              <li>4. Keep copy for records</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOLBuilder;
