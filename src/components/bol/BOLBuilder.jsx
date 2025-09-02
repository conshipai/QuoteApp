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

  // ✅ Clean, React-safe print that relies on @media print CSS
  const handlePrint = () => {
    const node = document.getElementById('bol-template');
    if (!node) {
      alert('BOL content is not ready to print.');
      return;
    }
    // Optional: Set a helpful print title (some browsers use it in headers)
    const prevTitle = document.title;
    document.title = bolData.bolNumber || 'Bill of Lading';
    window.print();
    document.title = prevTitle;
  };

  const handleSave = async () => {
    setGenerating(true);
    try {
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
        {/* Header Controls (hidden in print) */}
        <div className="mb-6 flex justify-between items-center print:hidden">
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {generating ? 'Saving...' : 'Save BOL'}
            </button>
          </div>
        </div>

        {/* Form Fields for editing (add as needed) */}
        {/* ... */}

        {/* BOL Preview (this is the ONLY thing printed) */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div id="bol-template" ref={bolRef} className="print:bg-white">
            <BOLTemplate 
              bolData={bolData}
              booking={booking}
              isDarkMode={false}  // Force white for print
            />
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Ensure colors/logos render nicely */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }

          /* Hide everything that's not the template */
          body * {
            visibility: hidden;
          }
          #bol-template, #bol-template * {
            visibility: visible;
          }

          /* Position at the top-left and use full width for the page */
          #bol-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Remove default margins some browsers add */
          @page {
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
};

export default BOLBuilder;
