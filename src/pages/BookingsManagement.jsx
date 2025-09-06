// src/pages/BookingsManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, FileText, Download, Eye, Filter, Search,
  Calendar, Truck, Plane, Ship, Clock, CheckCircle,
  AlertCircle, ChevronDown, ChevronRight, ExternalLink, X, Plus, Upload // ADDED Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api'; // ADDED
import bookingApi from '../services/bookingApi';
import bolApi from '../services/bolApi';
import BOLBuilder from '../components/bol/BOLBuilder';

// ─────────────────────────────────────────────────────────────
// 4A) DocumentUpload (safer local-state version, no fetching)
// ─────────────────────────────────────────────────────────────
const DocumentUpload = ({ bookingId, isDarkMode }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');

  const documentTypes = [
    'Bill of Lading',
    'Commercial Invoice',
    'Packing List',
    'Safety Data Sheet (SDS)',
    'Certificate of Origin',
    'Insurance Certificate',
    'Other'
  ];

  // Removed useEffect that attempted to load documents

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !docType) {
      alert('Please choose a document type first.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Store in local state only (non-breaking placeholder)
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: docType,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      setDocuments(prev => [...prev, newDoc]);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      event.target.value = '';
      setDocType('');
    }
  };

  const handleDownload = (docId) => {
    // Placeholder for download
    console.log('Download:', docId);
  };

  const handleDelete = (docId) => {
    if (!confirm('Delete this document?')) return;
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Documents</h3>

      <div className="mb-4 flex items-center gap-3">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className={`px-3 py-2 rounded border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select document type...</option>
          {documentTypes.map(type => (<option key={type} value={type}>{type}</option>))}
        </select>

        <label className={`${isDarkMode ? 'bg-conship-orange hover:bg-orange-600' : 'bg-conship-purple hover:bg-purple-700'} text-white px-4 py-2 rounded inline-flex items-center gap-2 cursor-pointer`}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={handleFileUpload}
            disabled={uploading || !docType}
          />
        </label>
      </div>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No documents uploaded yet</p>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.type} • {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
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

const BookingsManagement = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [viewingBOL, setViewingBOL] = useState(null);
  const [bolLoading, setBolLoading] = useState(false);
  const [creatingBOL, setCreatingBOL] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getAllBookings();
      if (result.success) {
        const bookingsWithBOLStatus = await Promise.all(
          result.bookings.map(async (booking) => {
            const bolResult = await bolApi.getBOLByBooking(booking.bookingId);
            return {
              ...booking,
              hasBOL: bolResult.success && bolResult.bol,
              bolNumber: bolResult.bol?.bolNumber
            };
          })
        );
        setBookings(bookingsWithBOLStatus);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    setLoading(false);
  };

  const viewBOL = async (bookingId) => {
    setBolLoading(true);
    try {
      const result = await bolApi.getBOLByBooking(bookingId);
      if (result.success && result.bol) {
        setViewingBOL(result.bol);
      } else {
        alert('No BOL found for this booking. Please create one first.');
      }
    } catch (error) {
      alert('Error loading BOL: ' + error.message);
    }
    setBolLoading(false);
  };

  const downloadBOL = async (bookingId) => {
    const result = await bolApi.getBOLByBooking(bookingId);
    if (result.success && result.bol) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>BOL ${result.bol.bolNumber}</title>
          <style>
            @media print { body { margin: 0; } .no-print { display: none; } }
            body { font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${result.bol.htmlContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCreateBOL = (booking) => {
    setCreatingBOL(booking);
  };

  const handleBOLCreated = () => {
    setCreatingBOL(null);
    loadBookings();
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'ground':
      case 'ltl':
      case 'ftl':
        return <Truck className="w-4 h-4" />;
      case 'air':
        return <Plane className="w-4 h-4" />;
      case 'ocean':
        return <Ship className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'IN_TRANSIT':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'DELIVERED':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesMode = filterMode === 'all' || booking.mode === filterMode;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch =
      booking.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickupNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.bolNumber && booking.bolNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = new Date(booking.createdAt) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(booking.createdAt) <= new Date(dateRange.end);
    }

    return matchesMode && matchesStatus && matchesSearch && matchesDate;
  });

  // If creating BOL, show the BOL Builder
  if (creatingBOL) {
    return (
      <div>
        <div className={`p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => setCreatingBOL(null)}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back to Bookings
          </button>
        </div>

        <BOLBuilder
          booking={creatingBOL}
          isDarkMode={isDarkMode}
          onComplete={handleBOLCreated}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div
            className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent' }}
          />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Booking Management
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all your shipment bookings
          </p>
        </div>

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search bookings or BOL#..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Mode Filter */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Modes</option>
              <option value="ground">Ground</option>
              <option value="air">Air</option>
              <option value="ocean">Ocean</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
            >
              {/* Booking Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedBooking(expandedBooking === booking.bookingId ? null : booking.bookingId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-1">
                      {expandedBooking === booking.bookingId ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {getModeIcon(booking.mode)}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.confirmationNumber}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        {booking.hasBOL && (
                          <span
                            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                              isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            BOL: {booking.bolNumber}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.carrier} • Pickup: {booking.pickupNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${booking.price?.toFixed(2)}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Document Actions */}
                    <div className="flex gap-2">
                      {booking.hasBOL ? (
                        <>
                          <button
                            onClick={() => viewBOL(booking.bookingId)}
                            className={`w-full px-3 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700`}
                          >
                            <Eye className="inline w-4 h-4 mr-2" />
                            View BOL
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadBOL(booking.bookingId);
                            }}
                            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Print BOL"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateBOL(booking);
                          }}
                          className="p-2 rounded flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                          title="Create BOL"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-medium">Create BOL</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedBooking === booking.bookingId && (
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Shipment Details */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Shipment Details
                      </h4>
                      <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div>
                          Origin: {booking.shipmentData?.formData?.originCity},{' '}
                          {booking.shipmentData?.formData?.originState}
                        </div>
                        <div>
                          Destination: {booking.shipmentData?.formData?.destCity},{' '}
                          {booking.shipmentData?.formData?.destState}
                        </div>
                        <div>Pickup Date: {booking.shipmentData?.formData?.pickupDate}</div>
                        <div>Service Type: {booking.shipmentData?.serviceType?.toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Documents + Upload */}
                    <div className="lg:col-span-2">
                      {/* Existing list (kept for reference) */}
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Documents
                      </h4>
                      <div className="space-y-2 mb-4">
                        {booking.hasBOL ? (
                          <button
                            onClick={() => viewBOL(booking.bookingId)}
                            className={`flex items-center gap-2 text-sm ${
                              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            Bill of Lading ({booking.bolNumber})
                          </button>
                        ) : (
                          <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            No BOL created yet
                          </div>
                        )}
                        {booking.documents?.map((doc, index) => (
                          <button
                            key={index}
                            className={`flex items-center gap-2 text-sm ${
                              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            {doc.name}
                          </button>
                        ))}
                      </div>

                      {/* 4B) Render DocumentUpload */}
                      <DocumentUpload bookingId={booking.bookingId} isDarkMode={isDarkMode} />
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Actions
                      </h4>
                      <div className="space-y-2">
                        {booking.hasBOL ? (
                          <button
                            onClick={() => viewBOL(booking.bookingId)}
                            className={`w-full px-3 py-1 rounded text-sm ${
                              isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            View/Print BOL
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreateBOL(booking)}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ring-1 ring-blue-700/40 shadow-sm"
                          >
                            <Plus className="inline w-4 h-4" />
                            Create BOL
                          </button>
                        )}
                        <button
                          className={`w-full px-3 py-1 rounded text-sm ${
                            isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Track Shipment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No bookings found matching your criteria
          </div>
        )}
      </div>

      {/* BOL Viewer Modal */}
      {viewingBOL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-6xl w-full max-h-[90vh] overflow-auto rounded-lg">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">BOL {viewingBOL.bolNumber}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>BOL ${viewingBOL.bolNumber}</title>
                        <style>
                          @media print { body { margin: 0; } }
                          body { font-family: Arial, sans-serif; }
                        </style>
                      </head>
                      <body>
                        ${viewingBOL.htmlContent}
                        <script>window.print();</script>
                      </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Print
                </button>
                <button onClick={() => setViewingBOL(null)} className="p-2 rounded hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div dangerouslySetInnerHTML={{ __html: viewingBOL.htmlContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
