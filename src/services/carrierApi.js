// src/services/carrierApi.js
class CarrierAPI {
  constructor() {
    this.storageKey = 'carrier_database';
    this.initializeDefaults();
  }

  initializeDefaults() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      const defaults = [
        {
          id: 'carrier-default-1',
          name: 'Swift Transportation',
          email: 'quotes@swift.com',
          phone: '(800) 555-1234',
          services: ['ftl'],
          equipment: ['dry_van', 'reefer'],
          active: true,
          notes: 'Nationwide coverage, good for long hauls',
          createdAt: new Date().toISOString()
        },
        {
          id: 'carrier-default-2',
          name: 'Express Logistics',
          email: 'expedited@expresslog.com',
          phone: '(888) 555-5678',
          services: ['expedited', 'ftl'],
          equipment: ['sprinter', 'box_truck'],
          active: true,
          notes: 'Specializes in time-critical shipments',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaults));
    }
  }

  async getCarriers(serviceType = null) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    
    let carriers = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    
    if (serviceType) {
      carriers = carriers.filter(c => c.services.includes(serviceType) && c.active);
    }
    
    return { success: true, carriers };
  }

  async saveCarrier(carrierData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const carriers = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const newCarrier = {
      ...carrierData,
      id: `carrier-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: localStorage.getItem('user_email') || 'system'
    };
    
    carriers.push(newCarrier);
    localStorage.setItem(this.storageKey, JSON.stringify(carriers));
    
    return { success: true, carrier: newCarrier };
  }

  async updateCarrier(carrierId, carrierData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const carriers = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const index = carriers.findIndex(c => c.id === carrierId);
    
    if (index === -1) {
      return { success: false, error: 'Carrier not found' };
    }
    
    carriers[index] = {
      ...carriers[index],
      ...carrierData,
      updatedAt: new Date().toISOString(),
      updatedBy: localStorage.getItem('user_email') || 'system'
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(carriers));
    
    return { success: true, carrier: carriers[index] };
  }

  async deleteCarrier(carrierId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const carriers = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const filtered = carriers.filter(c => c.id !== carrierId);
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    
    return { success: true };
  }

  // Get carriers for a specific service type
  async getCarriersForService(serviceType) {
    return this.getCarriers(serviceType);
  }
}

export default new CarrierAPI();
