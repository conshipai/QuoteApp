// ============================================
// 1. addressBookApi.js - NOW USES DATABASE
// ============================================
import axios from 'axios';
import API_BASE from '../config/api';

class AddressBookAPI {
  async getCompanies() {
    try {
      const { data } = await axios.get(`${API_BASE}/address-book/companies`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to fetch companies');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async saveCompany(companyData) {
    try {
      const { data } = await axios.post(`${API_BASE}/address-book/companies`, companyData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to save company');
      }
      
      return data;
    } catch (error) {
      console.error('Error saving company:', error);
      throw error;
    }
  }

  async updateCompany(companyId, companyData) {
    try {
      const { data } = await axios.put(`${API_BASE}/address-book/companies/${companyId}`, companyData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to update company');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  async deleteCompany(companyId) {
    try {
      const { data } = await axios.delete(`${API_BASE}/address-book/companies/${companyId}`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to delete company');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }
}

export default new AddressBookAPI();
