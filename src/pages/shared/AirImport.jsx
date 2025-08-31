import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IncotermSelector from '../../components/shared/IncotermSelector';
import UnitToggle from '../../components/shared/UnitToggle';
import ValidationErrors from '../../components/shared/ValidationErrors';
import QuoteActions from '../../components/shared/QuoteActions';
import OriginSection from '../../components/air/OriginSection';
import DestinationSection from '../../components/air/DestinationSection';
import AircraftTypeSelector from '../../components/air/AircraftTypeSelector';
import CargoPieceManager from '../../components/shared/CargoPieceManager';
import PickupServices from '../../components/air/PickupServices';

const AirImport = ({ isDarkMode, userRole, apiClient }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [incoterm, setIncoterm] = useState('EXW');
  const [unitSystem, setUnitSystem] = useState('imperial');
  const [originData, setOriginData] = useState({
    zip: '',
    airport: '',
    city: '',
    state: '',
    gateway: ''
  });
  const [destination, setDestination] = useState({
    airport: '',
    country: ''
  });
  const [aircraftType, setAircraftType] = useState('passenger');
  const [cargoPieces, setCargoPieces] = useState([{
    id: 'piece-1',
    quantity: 1,
    weight: '',
    weightKg: '',
    length: '',
    width: '',
    height: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    commodity: '',
    cargoType: 'General'
  }]);
  const [services, setServices] = useState([]);

  const handleSubmit = async () => {
    // Validate and submit
    setLoading(true);
    try {
      // Your submit logic here
      console.log('Submitting quote...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/quotes');
    } catch (error) {
      setErrors({ submit: 'Failed to submit quote' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Air Import Quote
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate an air freight import quote
          </p>
        </div>

        <ValidationErrors errors={errors} isDarkMode={isDarkMode} />
        
        <IncotermSelector
          value={incoterm}
          onChange={setIncoterm}
          userRole={userRole}
          direction="import"
          isDarkMode={isDarkMode}
          errors={errors}
        />

        <OriginSection
          incoterm={incoterm}
          originData={originData}
          onUpdate={setOriginData}
          isDarkMode={isDarkMode}
          errors={errors}
        />

        <DestinationSection
          destination={destination}
          onUpdate={setDestination}
          isDarkMode={isDarkMode}
          errors={errors}
        />

        <AircraftTypeSelector
          value={aircraftType}
          onChange={setAircraftType}
          isDarkMode={isDarkMode}
        />

        <UnitToggle
          value={unitSystem}
          onChange={setUnitSystem}
          isDarkMode={isDarkMode}
        />

        <CargoPieceManager
          cargoPieces={cargoPieces}
          onUpdatePieces={setCargoPieces}
          unitSystem={unitSystem}
          isDarkMode={isDarkMode}
          errors={errors}
        />

        <PickupServices
          services={services}
          onUpdate={setServices}
          isDarkMode={isDarkMode}
        />

        <QuoteActions
          onSubmit={handleSubmit}
          onCancel={() => navigate('/quotes')}
          loading={loading}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default AirImport;
