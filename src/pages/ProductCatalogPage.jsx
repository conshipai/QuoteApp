// src/pages/ProductCatalogPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Package, Plus, Search, Edit2, Trash2, 
  Upload, Download, AlertTriangle, Save, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productCatalogApi from '../services/productCatalogApi';

const ProductCatalogPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const result = await productCatalogApi.getProducts();
    if (result.success) {
      setProducts(result.products);
    }
    setLoading(false);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await productCatalogApi.deleteProduct(productId);
      if (result.success) {
        await loadProducts();
      }
    }
  };

  const handleExportCSV = () => {
    productCatalogApi.exportToCSV(products);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      const parsedProducts = productCatalogApi.parseCSV(csvText);
      if (parsedProducts.length > 0) {
        const result = await productCatalogApi.importProducts(parsedProducts);
        if (result.success) {
          alert(`Imported ${result.imported} products successfully!`);
          await loadProducts();
        }
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean)), 'Other'];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.nmfc && product.nmfc.includes(searchTerm)) ||
                          (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Product Form Component
  const ProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState(product || {
      productName: '',
      nmfc: '',
      freightClass: '',
      defaultWeight: '',
      defaultLength: '',
      defaultWidth: '',
      defaultHeight: '',
      unitType: 'Pallets',
      hazmat: false,
      hazmatDetails: null,
      category: '',
      description: '',
      notes: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.productName) {
        alert('Product name is required');
        return;
      }

      if (product?.id) {
        await productCatalogApi.updateProduct(product.id, formData);
      } else {
        await productCatalogApi.saveProduct(formData);
      }
      
      await loadProducts();
      onSave();
    };

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
        <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  NMFC #
                </label>
                <input
                  type="text"
                  value={formData.nmfc}
                  onChange={(e) => setFormData({...formData, nmfc: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Freight Class
                </label>
                <select
                  value={formData.freightClass}
                  onChange={(e) => setFormData({...formData, freightClass: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select class</option>
                  {['50', '55', '60', '65', '70', '77.5', '85', '92.5', '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'].map(fc => (
                    <option key={fc} value={fc}>{fc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={formData.defaultWeight}
                  onChange={(e) => setFormData({...formData, defaultWeight: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Length (in)
                </label>
                <input
                  type="number"
                  value={formData.defaultLength}
                  onChange={(e) => setFormData({...formData, defaultLength: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Width (in)
                </label>
                <input
                  type="number"
                  value={formData.defaultWidth}
                  onChange={(e) => setFormData({...formData, defaultWidth: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Height (in)
                </label>
                <input
                  type="number"
                  value={formData.defaultHeight}
                  onChange={(e) => setFormData({...formData, defaultHeight: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Unit Type
                </label>
                <select
                  value={formData.unitType}
                  onChange={(e) => setFormData({...formData, unitType: e.target.value})}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {['Pallets', 'Boxes', 'Crates', 'Skids', 'Barrels', 'Bundles', 'Rolls', 'Bags'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Pumps, Steel, Electronics"
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={formData.hazmat}
                  onChange={(e) => setFormData({...formData, hazmat: e.target.checked})}
                  className="mr-2"
                />
                <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                Hazardous Material
              </label>
            </div>

            {formData.hazmat && (
              <div className={`p-3 border-2 border-yellow-500 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Hazmat Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="UN Number"
                    value={formData.hazmatDetails?.unNumber || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hazmatDetails: {...(formData.hazmatDetails || {}), unNumber: e.target.value}
                    })}
                    className={`px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Proper Shipping Name"
                    value={formData.hazmatDetails?.properShippingName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hazmatDetails: {...(formData.hazmatDetails || {}), properShippingName: e.target.value}
                    })}
                    className={`px-2 py-1 rounded border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            )}

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
                {product ? 'Update' : 'Save'}
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/quotes')}
            className={`flex items-center gap-2 text-sm mb-4 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Product Catalog
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your frequently shipped products for quick selection
              </p>
            </div>
            
            <div className="flex gap-3">
              <label className={`px-3 py-2 rounded cursor-pointer flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                <Upload className="w-4 h-4" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleExportCSV}
                className={`px-3 py-2 rounded flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className={`px-3 py-2 rounded flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-conship-orange text-white hover:bg-orange-600' 
                    : 'bg-conship-purple text-white hover:bg-purple-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search products..."
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full mx-auto mb-2"
                 style={{borderColor: isDarkMode ? '#f97316' : '#7c3aed', borderTopColor: 'transparent'}} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {product.productName}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className={`p-1 rounded ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className={`p-1 rounded ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {product.nmfc && <div>NMFC: {product.nmfc}</div>}
                  {product.freightClass && <div>Class: {product.freightClass}</div>}
                  {product.defaultWeight && <div>Weight: {product.defaultWeight} lbs</div>}
                  <div>
                    {product.defaultLength && product.defaultWidth && product.defaultHeight && (
                      <span>Dims: {product.defaultLength}" × {product.defaultWidth}" × {product.defaultHeight}"</span>
                    )}
                  </div>
                  {product.category && (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {product.category}
                    </span>
                  )}
                  {product.hazmat && (
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-yellow-500 text-white">
                      <AlertTriangle className="inline w-3 h-3 mr-1" />
                      Hazmat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredProducts.length === 0 && !loading && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {searchTerm || filterCategory !== 'all' 
              ? 'No products match your filters'
              : 'No products in catalog. Click "Add Product" to get started.'}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSave={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductCatalogPage;
