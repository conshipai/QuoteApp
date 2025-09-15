// src/pages/Ground.jsx - FIXED TO MATCH WORKING VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quoteApi from '../services/quoteApi';
import ServiceTypeSelector from '../components/ground/ServiceTypeSelector';
import GroundFormBase from '../components/ground/GroundFormBase';
import GroundQuoteResults from '../components/ground/QuoteResults';
import FTLOptions from '../components/ground/FTLOptions';
import ExpeditedOptions from '../components/ground/ExpeditedOptions';
import { calculateDensity } from '../components/ground/constants';

const Ground = ({ isDarkMode }) => {
  const navigate = useNavigate();
  
  // Main state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(null);

  // Default form data - matching working version
  const getDefaultFormData = () => ({
    // Origin
    originZip: '',
    originCity: '',
    originState: '',
    originAddress: '',
    originCompany: '',
    // Destination
    destZip: '',
    destCity: '',
    destState: '',
    destAddress: '',
    destCompany: '',
    // Dates
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    // Additional stops - REQUIRED BY API
    additionalStops: [],
    // Service-specific fields
    legalLoadWeight: '45000',
    legalLoadPallets: '26',
    // FTL specific
    equipmentType: '',
    pickup24Hour: false,
    pickupHours: '',
    delivery24Hour: false,
    deliveryHours: '',
    dropTrailer: false,
    teamService: false,
    // Expedited specific
    truckType: '',
    serviceMode: 'dedicated',
    asap: false,
    // Commodities
    commodities: [
      {
        unitType: 'Pallets',
        quantity: '2',
        weight: '1000',
        length: '48',
        width: '40',
        height: '48',
        description: 'General Freight',
        calculatedClass: '',
        overrideClass: '',
        useOverride: false,
        density: null,
        cubicFeet: null,
        nmfc: '',
        hazmat: false,
        hazmatDetails: null,
        notes: '',
        useMetric: false
      }
    ],
    // Accessorials
    liftgatePickup: false,
    liftgateDelivery: false,
    residentialDelivery: false,
    insideDelivery: false,
    limitedAccessPickup: false,
    limitedAccessDelivery: false,
    // Notes
    specialInstructions: ''
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  // Debug form data changes
  useEffect(() => {
    console.log('Form data updated:', {
      originCity: formData.originCity,
      originState: formData.originState,
      originZip: formData.originZip,
      destCity: formData.destCity,
      destState: formData.destState,
      destZip: formData.destZip
    });
  }, [formData]);

  // Calculate initial density for LTL
  useEffect(() => {
    if (serviceType === 'ltl' && formData.commodities[0].weight && formData.commodities[0].length) {
      const densityData = calculateDensity(formData.commodities[0]);
      setFormData(prev => ({
        ...prev,
        commodities: [{
          ...prev.commodities[0],
          ...densityData
        }]
      }));
    }
  }, [serviceType]);

  const validateForm = () => {
    const errors = [];
    
    // Basic validation
    if (!formData.originZip) errors.push('Origin ZIP required');
    if (!formData.originCity) errors.push('Origin city required');
    if (!formData.originState) errors.push('Origin state required');
    if (!formData.destZip) errors.push('Destination ZIP required');
    if (!formData.destCity) errors.push('Destination city required');
    if (!formData.destState) errors.push('Destination state required');
    if (!formData.pickupDate) errors.push('Pickup date required');

    // LTL requires commodity details with dimensions
    if (serviceType === 'ltl') {
      if (formData.commodities.length === 0) {
        errors.push('At least one commodity required for LTL');
      }
      
      formData.commodities.forEach((item, idx) => {
        if (!item.weight) errors.push(`Item ${idx + 1}: Weight required`);
        if (!item.length || !item.width || !item.height) {
          errors.push(`Item ${idx + 1}: All dimensions required for freight class calculation`);
        }
        if (!item.quantity) errors.push(`Item ${idx + 1}: Quantity required`);
      });
    }

    // Service-specific validation
    if (serviceType === 'expedited') {
      if (!formData.truckType) errors.push('Truck type required for expedited');
      if (!formData.serviceMode) errors.push('Service mode required');
    }

    if (serviceType === 'ftl') {
      if (!formData.equipmentType) errors.push('Equipment type required for FTL');
    }

    return errors;
  };

  const handleSubmit = async () => {
    console.log('Starting quote submission...');
    console.log('Service Type:', serviceType);
    console.log('Current formData state:', formData); // Debug the current state
    setError(null);
    
    // Validate
    const errors = validateForm();
    if (errors.length > 0) {
      const errorMessage = 'Please fix the following errors:\n' + errors.join('\n');
      setError(errorMessage);
      alert(errorMessage);
      return;
    }

    setLoading(true);

    try {
      // Prepare the complete form data
      const completeFormData = {
        ...formData,
        serviceType,
        additionalStops: formData.additionalStops || [], // Ensure it's always included
        loadType: serviceType === 'ltl' ? undefined : (formData.loadType || 'custom'),
        commodities: (serviceType !== 'ltl' && formData.loadType === 'legal')
          ? [{
              unitType: 'Pallets',
              quantity: formData.legalLoadPallets || '26',
              weight: formData.legalLoadWeight || '45000',
              length: '48',
              width: '40',
              height: '48',
              description: 'Legal Truckload',
              calculatedClass: '50',
              useOverride: false
            }]
          : formData.commodities
      };

      console.log('Complete form data being submitted:', completeFormData);
      const result = await quoteApi.createGroundQuoteRequest(
        completeFormData,
        serviceType
      );

      console.log('API Response:', result);

      if (result?.success && result?.requestId) {
        console.log('Quote created successfully!');
        
        // Save to localStorage
        localStorage.setItem(
          `quote_formdata_${result.requestId}`,
          JSON.stringify(completeFormData)
        );
        
        const completeQuoteData = {
          requestId: result.requestId,
          requestNumber: result.requestNumber,
          serviceType: serviceType,
          formData: completeFormData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(
          `quote_complete_${result.requestId}`,
          JSON.stringify(completeQuoteData)
        );

        // Handle navigation based on service type
        if (serviceType === 'ftl' || serviceType === 'expedited') {
          alert(`✅ ${serviceType.toUpperCase()} Quote Request Sent!\n\n` +
                `Request #${result.requestNumber}\n\n` +
                `Carriers have been notified and have 30 minutes to respond.\n` +
                `You'll be notified when quotes are ready.`);
          navigate('/app/quotes/history');
        } else {
          // LTL - show results immediately
          setQuoteRequest({
            requestId: result.requestId,
            requestNumber: result.requestNumber
          });
          setShowResults(true);
        }
        
        setError(null);
      } else {
        throw new Error(result?.error || 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      alert('Error creating quote: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setServiceType(null);
    setFormData(getDefaultFormData());
    setError(null);
  };

  const handleServiceSelect = (type) => {
    setServiceType(type);
    // Reset form data when changing service type
    setFormData(getDefaultFormData());
  };

  // Service type selection
  if (!serviceType) {
    return <ServiceTypeSelector onSelect={handleServiceSelect} isDarkMode={isDarkMode} />;
  }

  // Show results (LTL only)
  if (showResults && quoteRequest && serviceType === 'ltl') {
    return (
      <GroundQuoteResults
        requestId={quoteRequest.requestId}
        requestNumber={quoteRequest.requestNumber}
        serviceType={serviceType}
        formData={formData}
        onBack={() => {
          setShowResults(false);
          setQuoteRequest(null);
          setError(null);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Main form with service-specific options
  return (
    <GroundFormBase
      serviceType={serviceType}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      error={error}
      isDarkMode={isDarkMode}
    >
      {/* Service-specific options */}
      {serviceType === 'expedited' && (
        <ExpeditedOptions
          formData={formData}
          onChange={(field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
          }}
          isDarkMode={isDarkMode}
        />
      )}
      
      {serviceType === 'ftl' && (
        <FTLOptions
          formData={formData}
          onChange={(field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </GroundFormBase>
  );
};

export default Ground;
