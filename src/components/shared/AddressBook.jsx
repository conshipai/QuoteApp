import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, MapPin, Phone, User, Star } from 'lucide-react';
import addressBookApi from '../../services/addressBookApi';

const AddressBook = ({ isDarkMode, onSelect, type = 'all' }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(type);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const result = await addressBookApi.getCompanies();
    if (result.success) {
      setCompanies(result.companies);
    }
    setLoading(false);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || company.type === filterType;
    return matchesSearch && matchesType;
  });

  const CompanyForm = ({ company, onSave, onCancel }) => {
    const [formData, setFormData] = useState(company || {
      type: 'shipper',
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      contact: '',
      email: '',
      notes: '',
      isDefault: false
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (company?.id) {
        await addressBookApi.updateCompany(company.id, formData);
      } else {
        await addressBookApi.saveCompany(formData);
      }
      await loadCompanies();
      onSave();
    };

    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {company ? 'Edit Company' : 'Add New Company'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="shipper">Shipper</option>
              <option value="consignee">Consignee</option>
              <option value="thirdparty">Third Party</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact Name
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                State *
              </label>
              <input
                type="text"
                required
                maxLength="2"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ZIP *
              </label>
              <input
                type="text"
                required
                maxLength="5"
                value={formData.zip}
                onChange={(e) => setFormData({...formData, zip: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Dock hours, special instructions, etc."
              className={`w-full px-3 py-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="isDefault" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Set as default for this type
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded font-medium ${
                isDarkMode 
                  ? 'bg-conship-orange text-white hover:bg-orange-600' 
                  : 'bg-conship-purple text-white hover:bg-purple-700'
              }`}
            >
              {company ? 'Update' : 'Save'}
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
    );
  };

  if (loading) {
    return (
      <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading companies...
      </div>
    );
  }

  return (
    <div className={`${onSelect ? 'max-h-96 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Address Book
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className={`px-3 py-1 rounded flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-conship-orange text-white hover:bg-orange-600' 
                : 'bg-conship-purple text-white hover:bg-purple-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search companies..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Types</option>
            <option value="shipper">Shippers</option>
            <option value="consignee">Consignees</option>
            <option value="thirdparty">Third Party</option>
          </select>
        </div>
      </div>

      {/* Company List */}
      <div className="space-y-3">
        {filteredCompanies.map(company => (
          <div
            key={company.id}
            className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            } ${onSelect ? 'cursor-pointer' : ''}`}
            onClick={() => onSelect && onSelect(company)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className={`w-4 h-4 ${isDarkMode ? 'text-conship-orange' : 'text-conship-purple'}`} />
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {company.name}
                  </h3>
                  {company.isDefault && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    company.type === 'shipper' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : company.type === 'consignee'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  }`}>
                    {company.type}
                  </span>
                </div>
                
                <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{company.address}, {company.city}, {company.state} {company.zip}</span>
                  </div>
                  {company.contact && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{company.contact}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.notes && (
                    <div className="text-xs italic">{company.notes}</div>
                  )}
                </div>
              </div>
              
              {!onSelect && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCompany(company)}
                    className={`p-1 rounded ${
                      isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Delete this company?')) {
                        await addressBookApi.deleteCompany(company.id);
                        await loadCompanies();
                      }
                    }}
                    className={`p-1 rounded ${
                      isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredCompanies.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No companies found
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingCompany) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <CompanyForm
              company={editingCompany}
              onSave={() => {
                setShowAddForm(false);
                setEditingCompany(null);
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingCompany(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
