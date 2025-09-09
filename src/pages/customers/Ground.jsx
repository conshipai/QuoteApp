// src/pages/customers/Ground.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quoteApi from '../../services/quoteApi';
import carrierApi from '../../services/carrierApi';
import ServiceTypeSelector from '../../components/ground/ServiceTypeSelector';
import GroundFormBase from '../../components/ground/GroundFormBase';
import GroundQuoteResults from '../../components/ground/QuoteResults';
import ExpeditedOptions from '../../components/ground/ExpeditedOptions';
import FTLOptions from '../../components/ground/FTLOptions';
import { calculateDensity } from '../../components/ground/constants';

const Ground = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  
  // Main state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState(null);
  const [availableCarriers, setAvailableCarriers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(null);

  // Default form data - FIXED: loadType only for FTL/Expedited
  const getDefaultFormData = () => ({
    // Origin
    originZip: '77002',
    originCity: 'Houston',
    originState: 'TX',
    originAddress: '',
    originCompany: '',
    // Destination
    destZip: '75201',
    destCity: 'Dallas',
    destState: 'TX',
    destAddress: '',
    destCompany: '',
    // Dates
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    // Service-specific fields - NO loadType for LTL
    // loadType: undefined, // Will be set only for FTL/Expedited
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
    serviceMode: '',
    asap: false,
    // Commodities - Always required for LTL
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
        notes: ''
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

  // Load carriers when service type changes
  useEffect(() => {
    if (serviceType === 'ftl' || serviceType === 'expedited') {
      loadAvailableCarriers();
    }
  }, [serviceType]);

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

  const loadAvailableCarriers = async () => {
    try {
      const result = await carrierApi.getCarriersForService(serviceType);
      if (result?.success) {
        setAvailableCarriers(result.carriers || []);
        console.log(`Found ${result.carriers.length} carriers for ${serviceType}`);
      }
    } catch (err) {
      console.error('Failed to load carriers:', err);
    }
  };

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

    // Service-specific validation
    if (serviceType === 'expedited') {
      if (!formData.truckType) errors.push('Truck type required for expedited');
      if (!formData.serviceMode) errors.push('Service mode (dedicated/team) required');
      if (!formData.asap && (!formData.pickupHours && !formData.pickup24Hour)) {
        errors.push('Pickup hours required');
      }
    }

    if (serviceType === 'ftl') {
      if (!formData.equipmentType) errors.push('Equipment type required for FTL');
    }

    // FIXED: LTL ALWAYS requires commodity details with dimensions
    if (serviceType === 'ltl') {
      if (formData.commodities.length === 0) {
        errors.push('At least one commodity required for LTL');
      }
      
      // Validate each commodity for LTL - dimensions are REQUIRED
      formData.commodities.forEach((item, idx) => {
        if (!item.weight) errors.push(`Item ${idx + 1}: Weight required for freight class calculation`);
        if (!item.length || !item.width || !item.height) {
          errors.push(`Item ${idx + 1}: All dimensions required for freight class calculation`);
        }
        if (!item.quantity) errors.push(`Item ${idx + 1}: Quantity required`);
        
        // Hazmat validation
        if (item.hazmat && item.hazmatDetails) {
          if (!item.hazmatDetails.unNumber) errors.push(`Item ${idx + 1}: UN Number required for hazmat`);
          if (!item.hazmatDetails.properShippingName) errors.push(`Item ${idx + 1}: Shipping name required for hazmat`);
          if (!item.hazmatDetails.hazardClass) errors.push(`Item ${idx + 1}: Hazard class required for hazmat`);
        }
      });
    }

    // FTL/Expedited validation for load configuration
    if ((serviceType === 'ftl' || serviceType === 'expedited') && formData.loadType === 'legal') {
      if (!formData.legalLoadWeight) errors.push('Weight required for legal truckload');
    } else if ((serviceType === 'ftl' || serviceType === 'expedited') && formData.loadType === 'custom') {
      // Validate commodities for custom loads
      if (formData.commodities.length === 0) {
        errors.push('At least one commodity required for custom load');
      }
      
      formData.commodities.forEach((item, idx) => {
        if (!item.weight) errors.push(`Item ${idx + 1}: Weight required`);
        if (!item.quantity) errors.push(`Item ${idx + 1}: Quantity required`);
        // Dimensions optional for FTL/Expedited custom loads
      });
    }

    return errors;
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting quote submission...');
    console.log('📦 Service Type:', serviceType);
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
    console.log('📦 Form data being submitted:', formData);

    try {
      // FIXED: Prepare the complete form data - loadType only for FTL/Expedited
      const completeFormData = {
        ...formData,
        serviceType,
        // Only set loadType for FTL/Expedited, undefined for LTL
        loadType: serviceType === 'ltl' ? undefined : (formData.loadType || 'custom'),
        // For legal truckload, create a single commodity entry
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

      console.log('📤 Calling API with cleaned data...');
      const result = await quoteApi.createGroundQuoteRequest(
        completeFormData,
        serviceType
      );

      console.log('📥 API Response:', result);

      if (result?.success && result?.requestId) {
        console.log('✅ Quote created successfully!');
        
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
      console.error('❌ Error:', error);
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

  // Service type selection
  if (!serviceType) {
    return <ServiceTypeSelector onSelect={setServiceType} isDarkMode={isDarkMode} />;
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
      availableCarriers={availableCarriers}
    >
      {/* Service-specific options - FIXED: Pass loadType handler for FTL/Expedited only */}
      {serviceType === 'expedited' && (
        <ExpeditedOptions
          formData={formData}
          onChange={(field, value) => {
            // Set loadType only for expedited
            if (field === 'loadType' && serviceType === 'expedited') {
              setFormData(prev => ({ ...prev, [field]: value }));
            } else {
              setFormData(prev => ({ ...prev, [field]: value }));
            }
          }}
          isDarkMode={isDarkMode}
        />
      )}
      
      {serviceType === 'ftl' && (
        <FTLOptions
          formData={formData}
          onChange={(field, value) => {
            // Set loadType only for FTL
            if (field === 'loadType' && serviceType === 'ftl') {
              setFormData(prev => ({ ...prev, [field]: value }));
            } else {
              setFormData(prev => ({ ...prev, [field]: value }));
            }
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </GroundFormBase>
  );
};

export default Ground;
