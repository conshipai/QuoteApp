// src/services/addressBookApi.js
import api from './api';

class AddressBookApi {
  async getCompanies() {
    try {
      const response = await api.get('/address-book/companies');
      // Return the full structure that AddressBook.jsx expects
      return {
        success: response.data.success,
        companies: response.data.companies || []
      };
    } catch (error) {
      console.error('Error fetching companies:', error);
      return {
        success: false,
        companies: []
      };
    }
  }

  async saveCompany(companyData) {
    try {
      // Ensure types is always an array with valid enum values
      const data = {
        types: Array.isArray(companyData.types) ? companyData.types : 
               companyData.type ? [companyData.type] : ['shipper'],
        name: companyData.name,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip: companyData.zip,
        phone: companyData.phone || '',
        contact: companyData.contact || '',
        email: companyData.email || '',
        notes: companyData.notes || '',
        isDefault: companyData.isDefault || false
      };

      const response = await api.post('/address-book/companies', data);
      return {
        success: true,
        company: response.data.company
      };
    } catch (error) {
      console.error('Error saving company:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to save company'
      };
    }
  }

  async updateCompany(id, companyData) {
    try {
      const data = {
        types: Array.isArray(companyData.types) ? companyData.types : 
               companyData.type ? [companyData.type] : ['shipper'],
        name: companyData.name,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip: companyData.zip,
        phone: companyData.phone || '',
        contact: companyData.contact || '',
        email: companyData.email || '',
        notes: companyData.notes || '',
        isDefault: companyData.isDefault || false
      };

      const response = await api.put(`/address-book/companies/${id}`, data);
      return {
        success: true,
        company: response.data.company
      };
    } catch (error) {
      console.error('Error updating company:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update company'
      };
    }
  }

  async deleteCompany(id) {
    try {
      await api.delete(`/address-book/companies/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting company:', error);
      return { 
        success: false,
        error: error.response?.data?.error || 'Failed to delete company'
      };
    }
  }
}

const addressBookApi = new AddressBookApi();
export default addressBookApi;
