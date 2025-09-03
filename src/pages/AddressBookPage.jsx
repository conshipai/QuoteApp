// src/pages/AddressBookPage.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddressBook from '../components/shared/AddressBook';

const AddressBookPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
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
          
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Address Book Management
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your saved shipping addresses for quick selection in quotes and BOLs
          </p>
        </div>

        {/* Address Book Component - without onSelect prop so it shows edit/delete buttons */}
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm p-6`}>
          <AddressBook isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default AddressBookPage;
