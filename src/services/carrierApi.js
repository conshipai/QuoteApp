// ============================================
// 4. carrierApi.js - NOW USES DATABASE
// ============================================
import axios from 'axios';
import API_BASE from '../config/api';

class CarrierAPI {
  async getCarriers(serviceType = null) {
    try {
      const params = serviceType ? { serviceType } : {};
      const { data } = await axios.get(`${API_BASE}/carriers`, { params });
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to fetch carriers');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching carriers:', error);
      throw error;
    }
  }

  async saveCarrier(carrierData) {
    try {
      const { data } = await axios.post(`${API_BASE}/carriers`, carrierData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to save carrier');
      }
      
      return data;
    } catch (error) {
      console.error('Error saving carrier:', error);
      throw error;
    }
  }

  async updateCarrier(carrierId, carrierData) {
    try {
      const { data } = await axios.put(`${API_BASE}/carriers/${carrierId}`, carrierData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to update carrier');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating carrier:', error);
      throw error;
    }
  }

  async deleteCarrier(carrierId) {
    try {
      const { data } = await axios.delete(`${API_BASE}/carriers/${carrierId}`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to delete carrier');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting carrier:', error);
      throw error;
    }
  }

  // Get carriers for a specific service type
  async getCarriersForService(serviceType) {
    return this.getCarriers(serviceType);
  }
}

export default new CarrierAPI();
