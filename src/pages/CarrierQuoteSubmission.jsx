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
        `${process.env.REACT_APP_API_URL}/api/ground-quotes/carrier/view/${token}`
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
        `${process.env.REACT_APP_API_URL}/api/ground-quotes/carrier/submit/${token}`,
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
        `${process.env.REACT_APP_API_URL}/api/ground-quotes/carrier/decline/${token}`,
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
            <div classNam
