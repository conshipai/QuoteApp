// src/services/addressBookApi.js
import api from './api';

class AddressBookApi {
  async getCompanies() {
    try {
      const response = await axios.get('/api/address-book/companies');
      if (response.data.success) {
        return response.data.companies;
      }
      throw new Error('Failed to fetch companies');
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async saveCompany(companyData) {
    try {
      // Convert frontend format to backend format
      const data = {
        types: Array.isArray(companyData.types) ? companyData.types : [companyData.type],
        name: companyData.name,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip: companyData.zip,
        phone: companyData.phone,
        contact: companyData.contact,
        email: companyData.email,
        notes: companyData.notes,
        isDefault: companyData.isDefault || false
      };

      const response = await axios.post('/api/address-book/companies', data);
      return response.data.company;
    } catch (error) {
      console.error('Error saving company:', error);
      throw error;
    }
  }

  async updateCompany(id, companyData) {
    try {
      const data = {
        types: Array.isArray(companyData.types) ? companyData.types : [companyData.type],
        name: companyData.name,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip: companyData.zip,
        phone: companyData.phone,
        contact: companyData.contact,
        email: companyData.email,
        notes: companyData.notes,
        isDefault: companyData.isDefault || false
      };

      const response = await axios.put(`/api/address-book/companies/${id}`, data);
      return response.data.company;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  async deleteCompany(id) {
    try {
      await axios.delete(`/api/address-book/companies/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      return false;
    }
  }
}

const addressBookApi = new AddressBookApi();
export default addressBookApi;
