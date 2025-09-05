// src/components/shared/QuoteDocumentUpload.jsx
import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, Download, AlertCircle } from 'lucide-react';

// IndexedDB helper functions
const DB_NAME = 'QuoteDocuments';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('quoteId', 'quoteId', { unique: false });
      }
    };
  });
};

const saveDocument = async (doc) => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return store.add(doc);
};

const getDocumentsByQuoteId = async (quoteId) => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('quoteId');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(quoteId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteDocument = async (docId) => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return store.delete(docId);
};

const QuoteDocumentUpload = ({ quoteId, isDarkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const documentTypes = [
    'Safety Data Sheet (SDS)',
    'Rate Confirmation',
    'Product Specification',
    'Packing List',
    'Purchase Order',
    'Insurance Requirements',
    'Certificate of Origin',
    'Other'
  ];

  useEffect(() => {
    loadDocuments();
  }, [quoteId]);

  const loadDocuments = async () => {
    try {
      const docs = await getDocumentsByQuoteId(quoteId);
      // Don't load the actual file data into memory, just metadata
      const docsMetadata = docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        quoteId: doc.quoteId
        // Note: not including doc.data to save memory
      }));
      setDocuments(docsMetadata);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!docType) {
      alert('Please select a document type first');
      return;
    }

    // Allow up to 10MB files
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Read file as ArrayBuffer for more efficient storage
      const arrayBuffer = await file.arrayBuffer();
      
      // Create document object
      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quoteId: quoteId,
        name: file.name,
        type: docType,
        size: file.size,
        mimeType: file.type,
        data: arrayBuffer, // Store as ArrayBuffer
        uploadedAt: new Date().toISOString()
      };

      // Save to IndexedDB
      await saveDocument(newDoc);
      
      // Update UI (without the actual data)
      const docMetadata = {
        id: newDoc.id,
        name: newDoc.name,
        type: newDoc.type,
        size: newDoc.size,
        mimeType: newDoc.mimeType,
        uploadedAt: newDoc.uploadedAt,
        quoteId: newDoc.quoteId
      };
      
      setDocuments(prev => [...prev, docMetadata]);
      
      // Reset form
      setDocType('');
      event.target.value = '';
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        alert('Document uploaded successfully!');
      }, 500);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      // Fetch the full document from IndexedDB
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(docId);
      
      request.onsuccess = () => {
        const doc = request.result;
        if (doc && doc.data) {
          // Create blob from ArrayBuffer
          const blob = new Blob([doc.data], { type: doc.mimeType });
          const url = URL.createObjectURL(blob);
          
          // Create download link
          const link = document.createElement('a');
          link.href = url;
          link.download = doc.name;
          link.click();
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      };
      
      request.onerror = () => {
        console.error('Download error:', request.error);
        alert('Failed to download document');
      };
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    
    try {
      await deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Quote Documents
      </h3>

      {/* Upload Section */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
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
              <option key={type} value={type}>{type}</option>
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
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              disabled={!docType || uploading}
            />
          </label>
        </div>

        {/* Progress bar */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <AlertCircle className="w-3 h-3" />
          Max file size: 10MB. Supported formats: PDF, Images, Word, Excel
        </div>
      </div>

      {/* Documents List */}
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
                  doc.type === 'Safety Data Sheet (SDS)' 
                    ? 'text-yellow-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {doc.name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.type} • {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className={`p-2 rounded ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-500"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuoteDocumentUpload;
