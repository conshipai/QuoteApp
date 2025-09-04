// src/services/productCatalogApi.js
const API_BASE = window.REACT_APP_API_URL || 'https://api.conship.ai';

class ProductCatalogAPI {
  // Get all products for the parent account (company-specific, not user-specific)
  async getProducts() {
    // In production: GET from your backend
    return this.mockGetProducts();
  }

  async saveProduct(productData) {
    // In production: POST to your backend
    return this.mockSaveProduct(productData);
  }

  async updateProduct(productId, productData) {
    // In production: PUT to your backend
    return this.mockUpdateProduct(productId, productData);
  }

  async deleteProduct(productId) {
    // In production: DELETE from your backend
    return this.mockDeleteProduct(productId);
  }

  async importProducts(products) {
    // In production: POST to your backend for bulk import
    return this.mockImportProducts(products);
  }

  // Mock implementations for development
  async mockGetProducts() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    
    // Add some default products if empty
    if (products.length === 0) {
      const defaults = [
        {
          id: 'prod-1',
          productName: '4" Centrifugal Pump',
          nmfc: '133300',
          freightClass: '70',
          defaultWeight: 450,
          defaultLength: 48,
          defaultWidth: 40,
          defaultHeight: 36,
          unitType: 'Pallets',
          hazmat: false,
          category: 'Pumps',
          description: 'Industrial centrifugal pump, 4 inch',
          notes: 'Fragile - handle with care',
          createdAt: new Date().toISOString()
        },
        {
          id: 'prod-2',
          productName: 'Steel Plates - 1/4"',
          nmfc: '96110',
          freightClass: '50',
          defaultWeight: 2000,
          defaultLength: 96,
          defaultWidth: 48,
          defaultHeight: 4,
          unitType: 'Pallets',
          hazmat: false,
          category: 'Steel',
          description: 'Quarter inch steel plates',
          notes: 'Stack maximum 3 high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'prod-3',
          productName: 'Industrial Solvent',
          nmfc: '48580',
          freightClass: '85',
          defaultWeight: 450,
          defaultLength: 48,
          defaultWidth: 40,
          defaultHeight: 48,
          unitType: 'Pallets',
          hazmat: true,
          hazmatDetails: {
            unNumber: 'UN1993',
            properShippingName: 'Flammable Liquid, N.O.S.',
            hazardClass: '3',
            packingGroup: 'III',
            emergencyPhone: '1-800-424-9300'
          },
          category: 'Chemicals',
          description: 'Flammable industrial solvent in 55-gallon drums',
          notes: 'Keep away from heat sources',
          createdAt: new Date().toISOString()
        },
        {
          id: 'prod-4',
          productName: 'Electric Motor - 50HP',
          nmfc: '61300',
          freightClass: '85',
          defaultWeight: 650,
          defaultLength: 36,
          defaultWidth: 30,
          defaultHeight: 30,
          unitType: 'Crates',
          hazmat: false,
          category: 'Motors',
          description: '50 horsepower electric motor',
          notes: 'Keep dry - do not stack',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('product_catalog', JSON.stringify(defaults));
      return { success: true, products: defaults };
    }
    
    return { success: true, products };
  }

  async mockSaveProduct(productData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem('product_catalog', JSON.stringify(products));
    
    return { success: true, product: newProduct };
  }

  async mockUpdateProduct(productId, productData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }
    
    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('product_catalog', JSON.stringify(products));
    
    return { success: true, product: products[index] };
  }

  async mockDeleteProduct(productId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const filtered = products.filter(p => p.id !== productId);
    
    localStorage.setItem('product_catalog', JSON.stringify(filtered));
    
    return { success: true };
  }

  async mockImportProducts(importedProducts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    
    const newProducts = importedProducts.map(p => ({
      ...p,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }));
    
    const combined = [...products, ...newProducts];
    localStorage.setItem('product_catalog', JSON.stringify(combined));
    
    return { 
      success: true, 
      imported: newProducts.length,
      message: `Successfully imported ${newProducts.length} products`
    };
  }

  // Export products to CSV
  exportToCSV(products) {
    const headers = [
      'Product Name',
      'NMFC',
      'Class', 
      'Default Weight',
      'Default Length',
      'Default Width',
      'Default Height',
      'Unit Type',
      'Hazmat',
      'Category',
      'Description'
    ];
    
    const rows = products.map(p => [
      p.productName,
      p.nmfc || '',
      p.freightClass || '',
      p.defaultWeight || '',
      p.defaultLength || '',
      p.defaultWidth || '',
      p.defaultHeight || '',
      p.unitType || 'Pallets',
      p.hazmat ? 'Yes' : 'No',
      p.category || '',
      p.description || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Parse CSV for import
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const product = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        switch(header.toLowerCase()) {
          case 'product name':
            product.productName = value;
            break;
          case 'nmfc':
            product.nmfc = value;
            break;
          case 'class':
          case 'freight class':
            product.freightClass = value;
            break;
          case 'default weight':
          case 'weight':
            product.defaultWeight = parseFloat(value) || 0;
            break;
          case 'default length':
          case 'length':
            product.defaultLength = parseFloat(value) || 0;
            break;
          case 'default width':
          case 'width':
            product.defaultWidth = parseFloat(value) || 0;
            break;
          case 'default height':
          case 'height':
            product.defaultHeight = parseFloat(value) || 0;
            break;
          case 'unit type':
            product.unitType = value || 'Pallets';
            break;
          case 'hazmat':
            product.hazmat = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
            break;
          case 'category':
            product.category = value;
            break;
          case 'description':
            product.description = value;
            break;
        }
      });
      
      if (product.productName) {
        products.push(product);
      }
    }
    
    return products;
  }

  // Search products by name or NMFC
  searchProducts(query) {
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const searchTerm = query.toLowerCase();
    
    return products.filter(p => 
      p.productName.toLowerCase().includes(searchTerm) ||
      (p.nmfc && p.nmfc.includes(searchTerm)) ||
      (p.category && p.category.toLowerCase().includes(searchTerm))
    );
  }
}

export default new ProductCatalogAPI();
