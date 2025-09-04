import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Plus, Search, Edit2, Trash2, Upload, Download, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productCatalogApi from '../services/productCatalogApi';

const ProductCatalogPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  // Basic placeholder component
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
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
          
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Product Catalog
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your frequently shipped products
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm p-6`}>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {products.length} products in catalog
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalogPage;
