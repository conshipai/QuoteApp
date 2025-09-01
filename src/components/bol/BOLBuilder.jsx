// src/components/bol/BOLBuilder.jsx
import React, { useState, useRef } from 'react';
import { FileText, Download, Save, Plus, Trash2 } from 'lucide-react';
import AddressBook from '../shared/AddressBook';
import bolApi from '../../services/bolApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BOLPreview from './BOLPreview';

const BOLBuilder = ({ booking, isDarkMode }) => {
  const { confirmationNumber, pickupNumber, carrier, shipmentData } = booking;
  const formData = shipmentData.formData;

  const previewRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [savedMeta, setSavedMeta] = useState(null);
  
  // ... (keep your existing state: showShipperSelect, showConsigneeSelect, bolData)

  const validate = () => {
    const errors = [];
    if (!bolData.shipper?.name) errors.push('Shipper name required');
    if (!bolData.shipper?.address) errors.push('Shipper address required');
    if (!bolData.shipper?.phone) errors.push('Shipper phone required');
    if (!bolData.consignee?.name) errors.push('Consignee name required');
    if (!bolData.consignee?.address) errors.push('Consignee address required');
    if (!bolData.consignee?.phone) errors.push('Consignee phone required');
    
    if (errors.length > 0) {
      return errors.join('\n');
    }
    return null;
  };

  const generateBOL = async () => {
    const err = validate();
    if (err) {
      alert('Please fix the following:\n' + err);
      return;
    }

    try {
      setGenerating(true);

      // Generate BOL number
      const bolNumber = `BOL-${Date.now().toString().slice(-8)}`;

      // Get the preview element
      const node = previewRef.current;
      if (!node) {
        alert('Preview not found');
        return;
      }

      // Convert to canvas
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      } else {
        // Handle multi-page if needed
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');
      }

      // Download PDF
      pdf.save(`${bolNumber}.pdf`);

      // Save to backend/localStorage
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      const result = await bolApi.createBOL({
        bookingId: booking.bookingId,
        bolNumber,
        bolData,
        pdfBase64
      });

      setSavedMeta({
        bolId: result.bolId,
        pdfUrl: result.pdfUrl,
        bolNumber
      });

      alert(`BOL ${bolNumber} generated and saved!`);

    } catch (error) {
      console.error('BOL generation error:', error);
      alert('Failed to generate BOL: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // ... (keep the rest of your existing JSX and handlers)

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* ... (keep your existing form JSX) */}
      
      {/* Hidden Preview (positioned off-screen) */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <BOLPreview ref={previewRef} booking={booking} bolData={bolData} />
      </div>
      
      {/* ... (keep your address book modals) */}
    </div>
  );
};

export default BOLBuilder;
