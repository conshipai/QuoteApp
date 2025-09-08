// src/services/addressBookApi.js - USING LOCALSTORAGE (No backend yet)
class AddressBookAPI {
  async getCompanies() {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    
    const companies = JSON.parse(localStorage.getItem('address_book') || '[]');
    
    // Add default companies if empty
    if (companies.length === 0) {
      const defaults = [
        {
          id: 'comp-1',
          types: ['shipper'],
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
          types: ['consignee'],
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

  async saveCompany(companyData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  async updateCompany(companyId, companyData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  async deleteCompany(companyId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const companies = JSON.parse(localStorage.getItem('address_book') || '[]');
    const filtered = companies.filter(c => c.id !== companyId);
    
    localStorage.setItem('address_book', JSON.stringify(filtered));
    
    return { success: true };
  }
}

export default new AddressBookAPI();
