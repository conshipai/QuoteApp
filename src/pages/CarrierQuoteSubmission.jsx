// src/pages/CarrierQuoteSubmission.jsx - NEW
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Truck, Clock, MapPin, Package, AlertCircle, 
  DollarSign, CheckCircle, X, Loader, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';

const CarrierQuoteSubmission = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Quote form state
  const [quoteData, setQuoteData] = useState({
    // Option 1: Detailed breakdown
    linehaul: '',
    fuelSurcharge: '',
    fuelPercentage: '',
    detention: '',
    layover: '',
    tarp: '',
    teamDriver: '',
    totalAccessorials: '',
    
    // Option 2: Simple total
    totalCost: '',
    
    // Common fields
    transitDays: '',
    freeTimeLoadingHours: '2',
    freeTimeUnloadingHours: '2',
    detentionRatePerHour: '',
    equipmentType: '',
    equipmentNotes: '',
    specialConditions: '',
    internalNotes: '',
    guaranteed: false
  });
  
  const [useDetailedPricing, setUseDetailedPricing] = useState(false);
  
  useEffect(() => {
    fetchRequestDetails();
  }, [token]);
  
  const fetchRequestDetails = async () => {
    try {
      const response = await axios.get(
        `https://api.gcc.conship.ai/api/ground-quotes/carrier/view/${token}`
      );
      
      if (response.data.success) {
        setRequest(response.data.request);
        
        // Pre-fill equipment type if specified
        if (response.data.request.formData?.equipmentType) {
          setQuoteData(prev => ({
            ...prev,
            equipmentType: response.data.request.formData.equipmentType
          }));
        }
        
        // Check if already submitted
        if (response.data.request.hasSubmitted) {
          setSubmitted(true);
        }
      }
    } catch (err) {
      if (err.response?.status === 410) {
        setError('This link has expired.');
      } else if (err.response?.status === 404) {
        setError('Invalid link.');
      } else {
        setError('Unable to load quote request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const calculateTotal = () => {
    if (!useDetailedPricing) {
      return parseFloat(quoteData.totalCost) || 0;
    }
    
    const linehaul = parseFloat(quoteData.linehaul) || 0;
    const fuel = parseFloat(quoteData.fuelSurcharge) || 0;
    const accessorials = parseFloat(quoteData.totalAccessorials) || 0;
    const detention = parseFloat(quoteData.detention) || 0;
    const layover = parseFloat(quoteData.layover) || 0;
    const tarp = parseFloat(quoteData.tarp) || 0;
    const teamDriver = parseFloat(quoteData.teamDriver) || 0;
    
    return linehaul + fuel + accessorials + detention + layover + tarp + teamDriver;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const total = calculateTotal();
    if (total <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }
    
    if (!quoteData.transitDays) {
      alert('Please enter transit days');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submitData = {
        ...quoteData,
        totalCost: total
      };
      
      const response = await axios.post(
        `https://api.gcc.conship.ai/api/ground-quotes/carrier/submit/${token}`,
        submitData
      );
      
      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      alert('Failed to submit quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this quote request?')) {
      return;
    }
    
    try {
      await axios.post(
        `https://api.gcc.conship.ai/api/ground-quotes/carrier/decline/${token}`,
        { reason: 'Unable to service this lane' }
      );
      setSubmitted(true);
    } catch (err) {
      alert('Failed to decline. Please try again.');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quote request...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Request</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  // Already submitted state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your response has been recorded for request #{request?.requestNumber}
          </p>
        </div>
      </div>
    );
  }
  
  // Check if expired
  if (request?.isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Time Expired</h2>
          <p className="text-gray-600">
            The response deadline for this quote request has passed.
          </p>
        </div>
      </div>
    );
  }
  
  const formData = request?.formData || {};
  const totalWeight = formData.commodities?.reduce((sum, c) => sum + (c.quantity * c.weight), 0) || 0;
  const totalPieces = formData.commodities?.reduce((sum, c) => sum + parseInt(c.quantity), 0) || 0;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quote Request #{request.requestNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                {request.serviceType?.toUpperCase()} Service
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Response Deadline</p>
              <p className="text-lg font-semibold text-purple-600">
                {request.minutesRemaining} minutes remaining
              </p>
            </div>
          </div>
          
          {request.serviceType === 'expedited' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">EXPEDITED SERVICE</p>
                <p className="text-sm text-red-700">
                  Required delivery: {new Date(formData.deliveryDate).toLocaleDateString()} at {formData.deliveryTime}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Shipment Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            Shipment Details
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Pickup Location</p>
                <p className="font-medium">
                  {formData.originCity}, {formData.originState} {formData.originZip}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Date: {new Date(formData.pickupDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Delivery Location</p>
                <p className="font-medium">
                  {formData.destCity}, {formData.destState} {formData.destZip}
                </p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="font-medium">{totalWeight.toLocaleString()} lbs</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Total Pieces</p>
                <p className="font-medium">{totalPieces}</p>
              </div>
              
              {formData.equipmentType && (
                <div>
                  <p className="text-sm text-gray-600">Equipment Required</p>
                  <p className="font-medium">{formData.equipmentType}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Stops */}
          {request.additionalStops?.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-900 mb-2">Milk Run - Additional Stops:</p>
              {request.additionalStops.map((stop, i) => (
                <p key={i} className="text-sm text-yellow-800">
                  {stop.sequence}. {stop.type === 'pickup' ? 'Pickup' : 'Delivery'}: 
                  {stop.city}, {stop.state} {stop.zipCode}
                </p>
              ))}
            </div>
          )}
          
          {/* Commodities */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">Commodities</h3>
            <div className="space-y-2">
              {formData.commodities?.map((item, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.description || 'General Freight'}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unitType} • {item.weight} lbs each • 
                        {item.length}"×{item.width}"×{item.height}"
                      </p>
                    </div>
                    {item.hazmat && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        HAZMAT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {formData.specialInstructions && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Special Instructions:</p>
              <p className="text-sm text-blue-800 mt-1">{formData.specialInstructions}</p>
            </div>
          )}
        </div>
        
        {/* Quote Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Your Quote
          </h2>
          
          {/* Pricing Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={useDetailedPricing}
                onChange={(e) => setUseDetailedPricing(e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm">Use detailed pricing breakdown</span>
            </label>
          </div>
          
          {useDetailedPricing ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linehaul Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quoteData.linehaul}
                  onChange={(e) => setQuoteData({...quoteData, linehaul: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Surcharge
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quoteData.fuelSurcharge}
                  onChange={(e) => setQuoteData({...quoteData, fuelSurcharge: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Accessorials
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quoteData.totalAccessorials}
                  onChange={(e) => setQuoteData({...quoteData, totalAccessorials: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calculated Total
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Quote Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={quoteData.totalCost}
                onChange={(e) => setQuoteData({...quoteData, totalCost: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-lg font-semibold"
                placeholder="Enter total amount"
                required
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transit Days *
              </label>
              <input
                type="number"
                value={quoteData.transitDays}
                onChange={(e) => setQuoteData({...quoteData, transitDays: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Type
              </label>
              <select
                value={quoteData.equipmentType}
                onChange={(e) => setQuoteData({...quoteData, equipmentType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select...</option>
                <option value="dry_van">Dry Van</option>
                <option value="reefer">Refrigerated</option>
                <option value="flatbed">Flatbed</option>
                <option value="step_deck">Step Deck</option>
                <option value="lowboy">Lowboy</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Time - Loading (hours)
              </label>
              <input
                type="number"
                value={quoteData.freeTimeLoadingHours}
                onChange={(e) => setQuoteData({...quoteData, freeTimeLoadingHours: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Time - Unloading (hours)
              </label>
              <input
                type="number"
                value={quoteData.freeTimeUnloadingHours}
                onChange={(e) => setQuoteData({...quoteData, freeTimeUnloadingHours: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detention Rate (per hour)
              </label>
              <input
                type="number"
                step="0.01"
                value={quoteData.detentionRatePerHour}
                onChange={(e) => setQuoteData({...quoteData, detentionRatePerHour: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="75.00"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quoteData.guaranteed}
                  onChange={(e) => setQuoteData({...quoteData, guaranteed: e.target.checked})}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm">Guaranteed Service</span>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Conditions / Notes
            </label>
            <textarea
              rows="3"
              value={quoteData.specialConditions}
              onChange={(e) => setQuoteData({...quoteData, specialConditions: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Any special conditions or notes about this quote..."
            />
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Quote'}
            </button>
            
            <button
              type="button"
              onClick={handleDecline}
              disabled={submitting}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Decline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarrierQuoteSubmission;
