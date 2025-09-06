// src/components/shared/QuoteDocumentUpload.jsx
import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, Download, AlertCircle } from 'lucide-react';
import documentApi from '../../services/documentApi';

const QuoteDocumentUpload = ({ quoteId, isDarkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');

  const documentTypes = [
    'dangerous_goods_declaration',
    'sds_sheet',
    'battery_certification',
    'packing_list',
    'commercial_invoice',
    'other'
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!docType) {
      alert('Please select a document type first');
      return;
    }

    // Your backend allows up to 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }

    setUploading(true);

    try {
      const result = await documentApi.uploadDocument(file, quoteId, docType);
      
      setDocuments(prev => [...prev, {
        id: result.key,
        name: file.name,
        type: docType,
        size: file.size,
        url: result.fileUrl,
        uploadedAt: new Date().toISOString()
      }]);
      
      setDocType('');
      event.target.value = '';
      alert('Document uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Quote Documents
      </h3>

      <div className="mb-4 flex items-center gap-3">
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
            <option key={type} value={type}>
              {type.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>

        <label className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 ${
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

      <div className={`text-xs mb-4 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <AlertCircle className="w-3 h-3" />
        Max file size: 20MB. Supported: PDF, JPG, PNG
      </div>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No documents uploaded yet
          </p>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${
                  doc.type === 'sds_sheet' 
                    ? 'text-yellow-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {doc.name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.type.replace(/_/g, ' ').toUpperCase()} • {(doc.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
                title="View/Download"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuoteDocumentUpload;
