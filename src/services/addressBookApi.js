// src/services/addressBookApi.js
const API_BASE = window.REACT_APP_API_URL || 'https://api.conship.ai';

class AddressBookAPI {
  // Get all saved companies for the parent account
  async getCompanies() {
    // In production: GET from your backend
    return this.mockGetCompanies();
  }

  async saveCompany(companyData) {
    // In production: POST to your backend
    return this.mockSaveCompany(companyData);
  }

  async updateCompany(companyId, companyData) {
    // In production: PUT to your backend
    return this.mockUpdateCompany(companyId, companyData);
  }

  async deleteCompany(companyId) {
    // In production: DELETE from your backend
    return this.mockDeleteCompany(companyId);
  }

  // Mock implementations
  async mockGetCompanies() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const companies = JSON.parse(localStorage.getItem('address_book') || '[]');
    
    // Add some default companies if empty
    if (companies.length === 0) {
      const defaults = [
        {
          id: 'comp-1',
          type: 'shipper',
          name: 'ABC Manufacturing',
          address: '123 Industrial Way',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          phone: '(713) 555-0100',
          contact: 'John Smith',
          email: 'shipping@abcmfg.com',
          notes: 'Dock hours: 7AM-3PM',
          isDefault: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-2',
          type: 'consignee',
          name: 'XYZ Distribution',
          address: '456 Commerce Blvd',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          phone: '(212) 555-0200',
          contact: 'Jane Doe',
          email: 'receiving@xyzdist.com',
          notes: 'Appointment required',
          isDefault: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('address_book', JSON.stringify(defaults));
      return { success: true, companies: defaults };
    }
    
    return { success: true, companies };
  }

  async mockSaveCompany(companyData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const companies = JSON.parse(localStorage.getItem('address_book') || '[]');
    const newCompany = {
      ...companyData,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    companies.push(newCompany);
    localStorage.setItem('address_book', JSON.stringify(companies));
    
    return { success: true, company: newCompany };
  }

  async mockUpdateCompany(companyId, companyData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const companies = JSON.parse(localStorage.getItem('address_book') || '[]');
    const index = companies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      return { success: false, error: 'Company not found' };
    }
    
    companies[index] = {
      ...companies[index],
      ...companyData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('address_book', JSON.stringify(companies));
    
    return { success: true, company: companies[index] };
  }

  async mockDeleteCompany(companyId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const companies = JSON.parse(localStorage.getItem('address_book') || '[]');
    const filtered = companies.filter(c => c.id !== companyId);
    
    localStorage.setItem('address_book', JSON.stringify(filtered));
    
    return { success: true };
  }
}

export default new AddressBookAPI();
