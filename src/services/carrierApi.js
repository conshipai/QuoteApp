// ============================================
// 3. carrierApi.js - FIXED TO USE CENTRALIZED API
// ============================================
import api from './api';

class CarrierAPI {
  async getCarriers(serviceType = null) {
    try {
      const params = serviceType ? { serviceType } : {};
      const { data } = await api.get('/carriers', { params });
      
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
      const { data } = await api.post('/carriers', carrierData);
      
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
      const { data } = await api.put(`/carriers/${carrierId}`, carrierData);
      
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
      const { data } = await api.delete(`/carriers/${carrierId}`);
      
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
