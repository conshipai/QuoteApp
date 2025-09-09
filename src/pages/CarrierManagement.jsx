// src/pages/CarrierManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Search, Edit2, Trash2, Mail, Phone, 
  ShieldCheck, X, Save, Filter, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import carrierApi from '../services/carrierApi';

const CarrierManagement = ({ isDarkMode, userRole }) => {
  const navigate = useNavigate();
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState(null);

  // Check if user is authorized (Conship employee only)
  const isAuthorized = userRole === 'conship_employee' || userRole === 'system_admin';

  useEffect(() => {
    if (!isAuthorized) {
      alert('Access denied. This page is for Conship employees only.');
      navigate('/app/quotes');
      return;
    }
    loadCarriers();
  }, [isAuthorized]);

  const loadCarriers = async () => {
    setLoading(true);
    try {
      const result = await carrierApi.getCarriers();
      if (result.success) {
        setCarriers(result.carriers);
      }
    } catch (error) {
      console.error('Failed to load carriers:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (carrierId) => {
    if (window.confirm('Are you sure you want to delete this carrier?')) {
      await carrierApi.deleteCarrier(carrierId);
      await loadCarriers();
    }
  };

  const filteredCarriers = carriers.filter(carrier => {
    const matchesSearch = carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          carrier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || carrier.services.includes(filterService);
    return matchesSearch && matchesService && carrier.active;
  });

  // Carrier Form Component
  const CarrierForm = ({ carrier, onSave, onCancel }) => {
    const [formData, setFormData] = useState(carrier || {
      name: '',
      email: '',
      phone: '',
      services: [],
      equipment: [],
      lanes: [],
      active: true,
      notes: ''
    });

    const serviceOptions = [
      { value: 'ltl', label: 'LTL' },
      { value: 'ftl', label: 'FTL' },
      { value: 'expedited', label: 'Expedited' }
    ];

    const equipmentOptions = [
      { value: 'dry_van', label: 'Dry Van' },
      { value: 'flatbed', label: 'Flatbed' },
      { value: 'reefer', label: 'Refrigerated' },
      { value: 'step_deck', label: 'Step Deck' },
      { value: 'lowboy', label: 'Lowboy' },
      { value: 'box_truck', label: 'Box Truck' },
      { value: 'sprinter', label: 'Sprinter Van' }
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name || !formData.email) {
        alert('Name and email are required');
        return;
      }

      if (formData.services.length === 0) {
        alert('Please select at least one service type');
        return;
      }

      if (carrier?.id) {
        await carrierApi.updateCarrier(carrier.id, formData);
      } else {
        await carrierApi.saveCarrier(formData);
      }
      
      await loadCarriers();
      onSave();
    };

    const toggleService = (service) => {
      const newServices = formData.services.includes(service)
        ? formData.services.filter(s => s !== service)
        : [...formData.services, service];
      setFormData({ ...formData, services: newServices });
    };

    const toggleEquipment = (equipment) => {
      const newEquipment = formData.equipment.includes(equipment)
        ? formData.equipment.filter(e => e !== equipment)
        : [...formData.equipment, equipment];
      setFormData({ ...formData, equipment: newEquipment });
    };

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
        <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {carrier ? 'Edit Carrier' : 'Add New Carrier'}
            </h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Carrier Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Service Types */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Service Types * (Select all that apply)
              </label>
              <div className="space-y-2">
                {serviceOptions.map(service => (
                  <label key={service.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.value)}
                      onChange={() => toggleService(service.value)}
                      className="mr-2"
                    />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {service.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment Types (only show if FTL is selected) */}
            {formData.services.includes('ftl') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Equipment Types (for FTL)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {equipmentOptions.map(equip => (
                    <label key={equip.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.equipment.includes(equip.value)}
                        onChange={() => toggleEquipment(equip.value)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {equip.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Special instructions, preferred lanes, etc."
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Active Status */}
            <div>
              <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="mr-2"
                />
                Active Carrier
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded font-medium ${
                  isDarkMode 
                    ? 'bg-conship-orange text-white hover:bg-orange-600' 
                    : 'bg-conship-purple text-white hover:bg-purple-700'
                }`}
              >
                <Save className="inline w-4 h-4 mr-2" />
                {carrier ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`px-4 py-2 rounded font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className={`w-6 h-6 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Carrier Management
            </h1>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage carriers for FTL and Expedited quotes (Conship Employees Only)
          </p>
        </div>

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search carriers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Services</option>
              <option value="ltl">LTL Only</option>
              <option value="ftl">FTL Only</option>
              <option value="expedited">Expedited Only</option>
            </select>

            <button
              onClick={() => setShowAddForm(true)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Carrier
            </button>
          </div>
        </div>

        {/* Carriers List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full mx-auto mb-2"
                 style={{borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent'}} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading carriers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCarriers.map(carrier => (
              <div
                key={carrier.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } shadow-sm`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className={`w-5 h-5 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {carrier.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCarrier(carrier)}
                      className={`p-1 rounded ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(carrier.id)}
                      className={`p-1 rounded ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {carrier.email}
                  </div>
                  {carrier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {carrier.phone}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {carrier.services.map(service => (
                      <span
                        key={service}
                        className={`px-2 py-0.5 rounded text-xs ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        {service.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  {carrier.equipment.length > 0 && (
                    <div className="text-xs">
                      Equipment: {carrier.equipment.join(', ')}
                    </div>
                  )}

                  {carrier.notes && (
                    <div className="text-xs italic mt-2">
                      {carrier.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredCarriers.length === 0 && !loading && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {searchTerm || filterService !== 'all' 
              ? 'No carriers match your filters'
              : 'No carriers added yet. Click "Add Carrier" to get started.'}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingCarrier) && (
        <CarrierForm
          carrier={editingCarrier}
          onSave={() => {
            setShowAddForm(false);
            setEditingCarrier(null);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingCarrier(null);
          }}
        />
      )}
    </div>
  );
};

export default CarrierManagement;
