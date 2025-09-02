import React, { useState, useRef } from 'react';
import { FileText, Download, Save, ArrowLeft } from 'lucide-react';
import BOLTemplate from './BOLTemplate';
import bolApi from '../../services/bolApi';

const BOLBuilder = ({ booking, isDarkMode }) => {
  const bolRef = useRef();
  const [generating, setGenerating] = useState(false);
  const [bolNumber, setBolNumber] = useState(`BOL-${Date.now()}`);
  
  const [bolData, setBolData] = useState({
    bolNumber: bolNumber,
    shipper: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      contact: ''
    },
    consignee: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      contact: ''
    },
    items: booking?.shipmentData?.formData?.commodities?.map(c => ({
      quantity: c.quantity,
      unitType: c.unitType,
      description: c.description || 'General Freight',
      weight: c.weight,
      class: c.useOverride ? c.overrideClass : c.calculatedClass,
      nmfc: '',
      hazmat: false
    })) || [],
    specialInstructions: '',
    poNumber: ''
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setGenerating(true);
    try {
      // Save to backend
      const result = await bolApi.createBOL({
        bookingId: booking.bookingId,
        bolNumber: bolNumber,
        bolData: bolData
      });
      
      if (result.success) {
        alert(`BOL ${bolNumber} saved successfully!`);
      }
    } catch (error) {
      alert('Failed to save BOL: ' + error.message);
    }
    setGenerating(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Controls */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Bill of Lading Generator
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print BOL
            </button>
            <button
              onClick={handleSave}
              disabled={generating}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {generating ? 'Saving...' : 'Save BOL'}
            </button>
          </div>
        </div>

        {/* Form Fields for editing */}
        {/* Add form inputs here for editing shipper/consignee if needed */}

        {/* BOL Preview */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div ref={bolRef}>
            <BOLTemplate 
              bolData={bolData}
              booking={booking}
              isDarkMode={false}
            />
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #bol-template, #bol-template * {
            visibility: visible;
          }
          #bol-template {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BOLBuilder;
