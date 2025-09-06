import React, { useState } from 'react';
import { Check, Printer, FileText, Truck, Calendar, MapPin, Upload, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../config/api';

// Add DocumentUpload component inside BookingConfirmation
const DocumentUpload = ({ bookingId, requestId, isDarkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');

  const documentTypes = [
    { value: 'dangerous_goods_declaration', label: 'Dangerous Goods Declaration' },
    { value: 'sds_sheet', label: 'Safety Data Sheet (SDS)' },
    { value: 'battery_certification', label: 'Battery Certification' },
    { value: 'packing_list', label: 'Packing List' },
    { value: 'commercial_invoice', label: 'Commercial Invoice' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!docType) {
      alert('Please select a document type first');
      event.target.value = '';
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      event.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId || bookingId); // Use requestId if available, otherwise bookingId
      formData.append('documentType', docType);

      const response = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDocuments(prev => [...prev, {
          id: data.key || `doc_${Date.now()}`,
          name: file.name,
          type: docType,
          size: file.size,
          url: data.fileUrl,
          key: data.key,
          uploadedAt: new Date().toISOString()
        }]);
        
        alert('Document uploaded successfully!');
        setDocType('');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-bold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Upload Supporting Documents
      </h3>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className={`px-3 py-2 rounded border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select document type...</option>
          {documentTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <label className={`px-4 py-2 rounded cursor-pointer flex items-center justify-center gap-2 ${
          isDarkMode 
            ? 'bg-conship-orange text-white hover:bg-orange-600' 
            : 'bg-conship-purple text-white hover:bg-purple-700'
        } ${!docType || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={!docType || uploading}
          />
        </label>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Uploaded Documents:
          </p>
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {doc.name}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {documentTypes.find(t => t.value === doc.type)?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BookingConfirmation = ({ booking, onCreateBOL, isDarkMode }) => {
  const navigate = useNavigate();
  const [showDocuments, setShowDocuments] = useState(false);
  const { confirmationNumber, pickupNumber, carrier, price, shipmentData, requestId, bookingId } = booking;
  const formData = shipmentData.formData;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Success Banner */}
        <div className={`mb-6 p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-green-900/50 border-green-700'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-green-900'
              }`}>
                Booking Confirmed!
              </h2>
              <p className={isDarkMode ? 'text-green-200' : 'text-green-700'}>
                Confirmation: {confirmationNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className={`mb-6 p-6 rounded-lg shadow-sm ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Shipment Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Carrier
              </p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {carrier}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pickup Number
              </p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {pickupNumber}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Cost
              </p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pickup Date
              </p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(formData.pickupDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.originCity}, {formData.originState} → {formData.destCity}, {formData.destState}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload Section - NEW */}
        {!showDocuments && (
          <div className={`mb-6 p-6 rounded-lg shadow-sm ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center">
              <FileText className={`w-12 h-12 mx-auto mb-3 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Do you need to upload any supporting documents for this shipment?
              </p>
              <button
                onClick={() => setShowDocuments(true)}
                className={`px-4 py-2 rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Upload className="inline w-4 h-4 mr-2" />
                Upload Documents
              </button>
            </div>
          </div>
        )}

        {/* Document Upload Component - Shown when toggled */}
        {showDocuments && (
          <div className="mb-6">
            <DocumentUpload 
              bookingId={bookingId}
              requestId={requestId}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Next Steps */}
        <div className={`mb-6 p-6 rounded-lg shadow-sm ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Next Steps
          </h3>
          
          <ol className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Upload any required documents (SDS, Dangerous Goods Declaration, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Create and print the Bill of Lading (BOL)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Prepare shipment with proper labels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
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
            View All Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
