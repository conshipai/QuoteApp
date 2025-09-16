// src/pages/CostsManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Clock, Package, TrendingUp, Check, X, 
  AlertCircle, Search, Filter, Grid3x3, Send, Eye,
  ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api';
import { ShipmentLifecycle } from '../constants/shipmentLifecycle';

const CostsManagement = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [costs, setCosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending_markup');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [markupModal, setMarkupModal] = useState(null);

  // Check authorization
  const isAuthorized = userRole === 'conship_employee' || userRole === 'system_admin';

  useEffect(() => {
    if (!isAuthorized) {
      alert('Access denied. This page is for Conship employees only.');
      navigate('/app/quotes');
      return;
    }
    loadRequests();
  }, [isAuthorized]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Load FTL/Expedited requests that need markup
      const response = await fetch(`${API_BASE}/costs/pending-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRequests(data.requests || []);
        }
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
    setLoading(false);
  };

  const loadCostsForRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE}/costs/request/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCosts(data.costs || []);
          return data.costs || [];
        }
      }
    } catch (error) {
      console.error('Failed to load costs:', error);
    }
    return [];
  };

  const handleExpandRequest = async (requestId) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
      setCosts([]);
    } else {
      setExpandedRequest(requestId);
      await loadCostsForRequest(requestId);
    }
  };

  const openMarkupModal = (request, cost) => {
    setMarkupModal({
      request,
      cost,
      markupPercentage: 15, // Default 15%
      markupAmount: Math.round(cost.price * 0.15),
      finalPrice: Math.round(cost.price * 1.15),
      notes: ''
    });
  };

  const calculateMarkup = (basePrice, percentage) => {
    const markupAmount = Math.round(basePrice * (percentage / 100));
    const finalPrice = basePrice + markupAmount;
    return { markupAmount, finalPrice };
  };

  const handleMarkupChange = (field, value) => {
    if (!markupModal) return;
    
    const basePrice = markupModal.cost.price;
    let updates = { ...markupModal };

    if (field === 'markupPercentage') {
      const percentage = parseFloat(value) || 0;
      const { markupAmount, finalPrice } = calculateMarkup(basePrice, percentage);
      updates = {
        ...updates,
        markupPercentage: percentage,
        markupAmount,
        finalPrice
      };
    } else if (field === 'finalPrice') {
      const finalPrice = parseFloat(value) || basePrice;
      const markupAmount = finalPrice - basePrice;
      const markupPercentage = (markupAmount / basePrice) * 100;
      updates = {
        ...updates,
        finalPrice,
        markupAmount,
        markupPercentage: Math.round(markupPercentage * 10) / 10
      };
    } else {
      updates[field] = value;
    }

    setMarkupModal(updates);
  };

  const submitQuoteToCustomer = async () => {
    if (!markupModal) return;

    try {
      const payload = {
        requestId: markupModal.request._id,
        costId: markupModal.cost.id,
        carrierId: markupModal.cost.carrierId,
        carrierName: markupModal.cost.carrierName,
        rawCost: markupModal.cost.price,
        markupPercentage: markupModal.markupPercentage,
        markupAmount: markupModal.markupAmount,
        finalPrice: markupModal.finalPrice,
        transitDays: markupModal.cost.transitDays,
        notes: markupModal.notes,
        markedUpBy: localStorage.getItem('user_email') || 'employee'
      };

      const response = await fetch(`${API_BASE}/costs/apply-markup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Quote sent to customer successfully!');
          setMarkupModal(null);
          loadRequests();
        }
      }
    } catch (error) {
      console.error('Failed to submit quote:', error);
      alert('Failed to submit quote');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.formData?.originCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.formData?.destCity?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-conship-purple border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading cost requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className={`w-6 h-6 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cost Management Center
            </h1>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review carrier submissions and apply markup (Conship Employees Only)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Review</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {requests.filter(r => r.status === 'pending_markup').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Awaiting Carriers</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {requests.filter(r => r.status === 'pending_carrier_response').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Today</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {requests.filter(r => r.status === ShipmentLifecycle.QUOTE_READY).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Markup</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  15%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by request number or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending_carrier_response">Awaiting Carriers</option>
              <option value="pending_markup">Ready for Markup</option>
              <option value="quoted">Completed</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request._id} className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              {/* Request Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => handleExpandRequest(request._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-1">
                      {expandedRequest === request._id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {request.requestNumber}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'pending_markup'
                            ? 'bg-yellow-100 text-yellow-700'
                            : request.status === 'pending_carrier_response'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {request.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          {request.serviceType?.toUpperCase()}
                        </span>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {request.formData?.originCity}, {request.formData?.originState} → 
                        {request.formData?.destCity}, {request.formData?.destState}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                    {costs.length > 0 && expandedRequest === request._id && (
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {costs.length} carrier responses
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content - Carrier Costs */}
              {expandedRequest === request._id && (
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                  {costs.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Clock className="w-12 h-12 mx-auto mb-2" />
                      <p>Waiting for carrier responses...</p>
                      <p className="text-sm mt-1">Carriers have 30 minutes to respond</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Carrier Submissions:
                      </h4>
                      
                      {costs.map(cost => (
                        <div key={cost.id} className={`p-4 rounded border ${
                          isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {cost.carrierName}
                                </h5>
                                {cost.status === ShipmentLifecycle.QUOTE_READY && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                                    SENT TO CUSTOMER
                                  </span>
                                )}
                              </div>
                              <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className="mr-4">Cost: ${cost.price}</span>
                                <span className="mr-4">Transit: {cost.transitDays} days</span>
                                <span>Submitted: {new Date(cost.submittedAt).toLocaleTimeString()}</span>
                              </div>
                              {cost.notes && (
                                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Notes: {cost.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {cost.status !== ShipmentLifecycle.QUOTE_READY && (
                                <button
                                  onClick={() => openMarkupModal(request, cost)}
                                  className={`px-4 py-2 rounded flex items-center gap-2 ${
                                    isDarkMode 
                                      ? 'bg-conship-orange text-white hover:bg-orange-600' 
                                      : 'bg-conship-purple text-white hover:bg-purple-700'
                                  }`}
                                >
                                  <Grid3x3 className="w-4 h-4" />
                                  Apply Markup
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No cost requests found
          </div>
        )}
      </div>

      {/* Markup Modal */}
      {markupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-lg w-full rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Apply Markup & Send to Customer
            </h2>

            <div className={`p-4 rounded mb-4 ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carrier:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {markupModal.cost.carrierName}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Base Cost:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${markupModal.cost.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transit Days:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {markupModal.cost.transitDays} days
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Markup Percentage (%)
                </label>
                <input
                  type="number"
                  value={markupModal.markupPercentage}
                  onChange={(e) => handleMarkupChange('markupPercentage', e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Final Price to Customer
                </label>
                <input
                  type="number"
                  value={markupModal.finalPrice}
                  onChange={(e) => handleMarkupChange('finalPrice', e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-750' : 'bg-yellow-50'}`}>
                <div className="flex justify-between text-sm">
                  <span>Markup Amount:</span>
                  <span className="font-medium">${markupModal.markupAmount}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Profit Margin:</span>
                  <span className="font-medium">{markupModal.markupPercentage}%</span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={markupModal.notes}
                  onChange={(e) => handleMarkupChange('notes', e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Any notes about this markup decision..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitQuoteToCustomer}
                className={`flex-1 px-4 py-2 rounded font-medium flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-conship-orange text-white hover:bg-orange-600' 
                    : 'bg-conship-purple text-white hover:bg-purple-700'
                }`}
              >
                <Send className="w-4 h-4" />
                Send Quote to Customer
              </button>
              <button
                onClick={() => setMarkupModal(null)}
                className={`px-4 py-2 rounded font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostsManagement;
