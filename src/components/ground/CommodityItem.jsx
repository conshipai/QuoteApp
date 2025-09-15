// src/components/ground/CommodityItem.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Package, Search, X, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { UNIT_TYPES, FREIGHT_CLASSES, calculateDensity } from './constants';
import productCatalogApi from '../../services/productCatalogApi';

const CommodityItem = ({ 
  commodity,
  index,
  onChange,
  onRemove,
  onToggleOverride,
  canRemove,
  isDarkMode 
}) => {
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [useMetric, setUseMetric] = useState(commodity.useMetric || false);

  // Load products when search is opened
  useEffect(() => {
    if (showProductSearch && products.length === 0) {
      loadProducts();
    }
  }, [showProductSearch]);

  // Recalculate when units change or values change
  useEffect(() => {
    if (commodity.weight && commodity.length && commodity.width && commodity.height) {
      recalculateDensity();
    }
  }, [commodity.weight, commodity.length, commodity.width, commodity.height, commodity.quantity, useMetric]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const result = await productCatalogApi.getProducts();
      if (result.success) {
        setProducts(result.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
    setLoadingProducts(false);
  };

  // Unit conversion helpers
  const convertToImperial = (value, type) => {
    if (!value || !useMetric) return value;
    if (type === 'weight') {
      return (parseFloat(value) * 2.20462).toFixed(2); // kg to lbs
    } else if (type === 'dimension') {
      return (parseFloat(value) / 2.54).toFixed(2); // cm to inches
    }
    return value;
  };

  const convertToMetric = (value, type) => {
    if (!value || useMetric) return value;
    if (type === 'weight') {
      return (parseFloat(value) / 2.20462).toFixed(2); // lbs to kg
    } else if (type === 'dimension') {
      return (parseFloat(value) * 2.54).toFixed(2); // inches to cm
    }
    return value;
  };

  const toggleUnits = () => {
    const newUseMetric = !useMetric;
    setUseMetric(newUseMetric);
    onChange(index, 'useMetric', newUseMetric);

    // Convert existing values
    if (newUseMetric) {
      // Converting to metric
      if (commodity.weight) onChange(index, 'weight', convertToMetric(commodity.weight, 'weight'));
      if (commodity.length) onChange(index, 'length', convertToMetric(commodity.length, 'dimension'));
      if (commodity.width) onChange(index, 'width', convertToMetric(commodity.width, 'dimension'));
      if (commodity.height) onChange(index, 'height', convertToMetric(commodity.height, 'dimension'));
    } else {
      // Converting to imperial
      if (commodity.weight) onChange(index, 'weight', convertToImperial(commodity.weight, 'weight'));
      if (commodity.length) onChange(index, 'length', convertToImperial(commodity.length, 'dimension'));
      if (commodity.width) onChange(index, 'width', convertToImperial(commodity.width, 'dimension'));
      if (commodity.height) onChange(index, 'height', convertToImperial(commodity.height, 'dimension'));
    }
  };

  const recalculateDensity = () => {
    // Always calculate in imperial units for freight class
    let weightLbs = parseFloat(commodity.weight) || 0;
    let lengthIn = parseFloat(commodity.length) || 0;
    let widthIn = parseFloat(commodity.width) || 0;
    let heightIn = parseFloat(commodity.height) || 0;

    // Convert to imperial if currently in metric
    if (useMetric) {
      weightLbs = weightLbs * 2.20462; // kg to lbs
      lengthIn = lengthIn / 2.54; // cm to inches
      widthIn = widthIn / 2.54;
      heightIn = heightIn / 2.54;
    }

    const imperialCommodity = {
      weight: weightLbs,
      length: lengthIn,
      width: widthIn,
      height: heightIn,
      quantity: commodity.quantity || 1
    };

    const densityData = calculateDensity(imperialCommodity);
    
    // Update the commodity with calculated values
    onChange(index, 'density', densityData.density);
    onChange(index, 'cubicFeet', densityData.cubicFeet);
    onChange(index, 'calculatedClass', densityData.calculatedClass);
  };

  const handleChange = (field, value) => {
    onChange(index, field, value);
    
    // Trigger density recalculation for dimension/weight changes
    if (['weight', 'length', 'width', 'height', 'quantity'].includes(field)) {
      setTimeout(() => recalculateDensity(), 100);
    }
  };

  const handleProductSelect = (product) => {
    // Auto-populate fields from selected product
    onChange(index, 'description', product.productName);
    onChange(index, 'nmfc', product.nmfc || '');
    
    // Use override class if product has a class defined
    if (product.freightClass) {
      onChange(index, 'overrideClass', product.freightClass);
      onChange(index, 'useOverride', true);
    }
    
    // Set default dimensions if available
    if (product.defaultWeight) onChange(index, 'weight', product.defaultWeight.toString());
    if (product.defaultLength) onChange(index, 'length', product.defaultLength.toString());
    if (product.defaultWidth) onChange(index, 'width', product.defaultWidth.toString());
    if (product.defaultHeight) onChange(index, 'height', product.defaultHeight.toString());
    if (product.unitType) onChange(index, 'unitType', product.unitType);
    
    // Set hazmat info if applicable
    if (product.hazmat) {
      onChange(index, 'hazmat', true);
      if (product.hazmatDetails) {
        onChange(index, 'hazmatDetails', product.hazmatDetails);
      }
    }
    
    // Add special notes if any
    if (product.notes) {
      const currentNotes = commodity.notes || '';
      const newNotes = currentNotes ? `${currentNotes}; ${product.notes}` : product.notes;
      onChange(index, 'notes', newNotes);
    }
    
    setShowProductSearch(false);
    setSearchTerm('');
    
    // Recalculate after setting values
    setTimeout(() => recalculateDensity(), 100);
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nmfc && p.nmfc.includes(searchTerm)) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className={`p-4 mb-4 rounded-lg border ${
        isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Item {index + 1}
          </h3>
          <div className="flex gap-2 items-center">
            {/* Unit Toggle */}
            <button
              type="button"
              onClick={toggleUnits}
              className={`px-3 py-1 text-sm rounded flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={useMetric ? 'Switch to Imperial (lbs/inches)' : 'Switch to Metric (kg/cm)'}
            >
              {useMetric ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {useMetric ? 'Metric' : 'Imperial'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowProductSearch(true)}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
              }`}
            >
              <Package className="w-3 h-3" />
              Select Product
            </button>
            {canRemove && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* First Row: Unit Type, Quantity, Weight */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Unit Type *
            </label>
            <select
              value={commodity.unitType}
              onChange={(e) => handleChange('unitType', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {UNIT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={commodity.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Weight ({useMetric ? 'kg' : 'lbs'}) *
            </label>
            <input
              type="number"
              step="0.01"
              value={commodity.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={`Total weight in ${useMetric ? 'kg' : 'lbs'}`}
            />
          </div>
        </div>

        {/* Second Row: Dimensions */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Length ({useMetric ? 'cm' : 'inches'}) *
            </label>
            <input
              type="number"
              step="0.01"
              value={commodity.length}
              onChange={(e) => handleChange('length', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={useMetric ? '122' : '48'}
            />
          </div>
          
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Width ({useMetric ? 'cm' : 'inches'}) *
            </label>
            <input
              type="number"
              step="0.01"
              value={commodity.width}
              onChange={(e) => handleChange('width', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={useMetric ? '102' : '40'}
            />
          </div>
          
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Height ({useMetric ? 'cm' : 'inches'}) *
            </label>
            <input
              type="number"
              step="0.01"
              value={commodity.height}
              onChange={(e) => handleChange('height', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={useMetric ? '122' : '48'}
            />
          </div>
        </div>

        {/* Third Row: Description, NMFC, and Class */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Description
            </label>
            <input
              type="text"
              value={commodity.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="General freight"
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              NMFC #
            </label>
            <input
              type="text"
              value={commodity.nmfc || ''}
              onChange={(e) => handleChange('nmfc', e.target.value)}
              className={`w-full px-2 py-1.5 rounded border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Freight Class
            </label>
            <div className="flex gap-2">
              {commodity.useOverride ? (
                <select
                  value={commodity.overrideClass}
                  onChange={(e) => handleChange('overrideClass', e.target.value)}
                  className={`flex-1 px-2 py-1.5 rounded border text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select class</option>
                  {FREIGHT_CLASSES.map(fc => (
                    <option key={fc} value={fc}>{fc}</option>
                  ))}
                </select>
              ) : (
                <div className={`flex-1 px-2 py-1.5 rounded border text-sm font-medium ${
                  commodity.calculatedClass
                    ? isDarkMode 
                      ? 'bg-green-900/20 border-green-700 text-green-400' 
                      : 'bg-green-50 border-green-300 text-green-700'
                    : isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-300' 
                      : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}>
                  {commodity.calculatedClass || 'Enter dims'}
                </div>
              )}
              <button
                type="button"
                onClick={() => onToggleOverride(index)}
                className={`px-2 py-1 text-xs rounded ${
                  commodity.useOverride
                    ? 'bg-yellow-500 text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={commodity.useOverride ? 'Use calculated class' : 'Override class'}
              >
                {commodity.useOverride ? 'Manual' : 'Auto'}
              </button>
            </div>
          </div>
        </div>

        {/* Hazmat Checkbox */}
        <div className="flex items-center gap-4 mb-3">
          <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={commodity.hazmat || false}
              onChange={(e) => handleChange('hazmat', e.target.checked)}
              className="mr-2"
            />
            <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
            Hazardous Material
          </label>
        </div>

        {/* Hazmat Details (if checked) */}
        {commodity.hazmat && (
          <div className={`p-3 border-2 border-yellow-500 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Hazmat Details Required
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  UN Number *
                </label>
                <input
                  type="text"
                  value={commodity.hazmatDetails?.unNumber || ''}
                  onChange={(e) => handleChange('hazmatDetails', {...(commodity.hazmatDetails || {}), unNumber: e.target.value})}
                  placeholder="UN1203"
                  className={`w-full px-2 py-1 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Proper Shipping Name *
                </label>
                <input
                  type="text"
                  value={commodity.hazmatDetails?.properShippingName || ''}
                  onChange={(e) => handleChange('hazmatDetails', {...(commodity.hazmatDetails || {}), properShippingName: e.target.value})}
                  placeholder="Gasoline"
                  className={`w-full px-2 py-1 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Hazard Class *
                </label>
                <input
                  type="text"
                  value={commodity.hazmatDetails?.hazardClass || ''}
                  onChange={(e) => handleChange('hazmatDetails', {...(commodity.hazmatDetails || {}), hazardClass: e.target.value})}
                  placeholder="3"
                  className={`w-full px-2 py-1 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Packing Group *
                </label>
                <select
                  value={commodity.hazmatDetails?.packingGroup || ''}
                  onChange={(e) => handleChange('hazmatDetails', {...(commodity.hazmatDetails || {}), packingGroup: e.target.value})}
                  className={`w-full px-2 py-1 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  24-Hour Emergency Phone
                </label>
                <input
                  type="text"
                  value={commodity.hazmatDetails?.emergencyPhone || ''}
                  onChange={(e) => handleChange('hazmatDetails', {...(commodity.hazmatDetails || {}), emergencyPhone: e.target.value})}
                  placeholder="1-800-424-9300"
                  className={`w-full px-2 py-1 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Density Info */}
        {commodity.density && (
          <div className={`text-xs p-2 rounded mt-3 ${
            isDarkMode ? 'bg-gray-900' : 'bg-blue-50'
          }`}>
            <div className="flex gap-4">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Density: <strong className="text-blue-500">{commodity.density} lbs/ft³</strong>
              </span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Cubic Feet: <strong>{commodity.cubicFeet}</strong>
              </span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Calculated Class: <strong className="text-green-600">{commodity.calculatedClass}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-3xl w-full max-h-[80vh] overflow-hidden rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } flex flex-col`}>
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Product from Catalog
              </h2>
              <button
                onClick={() => {
                  setShowProductSearch(false);
                  setSearchTerm('');
                }}
                className={`p-2 rounded hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search products by name, NMFC, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full mx-auto mb-2"
                       style={{borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent'}} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {products.length === 0 ? 'No products in catalog' : 'No products match your search'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-gray-750 border-gray-700 hover:border-conship-orange' 
                          : 'bg-gray-50 border-gray-200 hover:border-conship-purple'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {product.productName}
                          </h3>
                          <div className={`text-xs mt-1 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {product.nmfc && <div>NMFC: {product.nmfc}</div>}
                            {product.freightClass && <div>Class: {product.freightClass}</div>}
                            {product.defaultWeight && <div>Weight: {product.defaultWeight} lbs</div>}
                            {product.category && (
                              <span className={`inline-block px-2 py-0.5 rounded ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {product.hazmat && (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" title="Hazmat" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommodityItem;
