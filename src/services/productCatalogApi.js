// src/services/productCatalogApi.js - USING LOCALSTORAGE (No backend yet)
class ProductCatalogAPI {
  async getProducts() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    
    // Add sample products if empty
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
        }
      ];
      localStorage.setItem('product_catalog', JSON.stringify(defaults));
      return { success: true, products: defaults };
    }
    
    return { success: true, products };
  }

  async saveProduct(productData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  async updateProduct(productId, productData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  async deleteProduct(productId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const filtered = products.filter(p => p.id !== productId);
    
    localStorage.setItem('product_catalog', JSON.stringify(filtered));
    
    return { success: true };
  }

  // Keep the CSV export/import functions
  exportToCSV(products) {
    const headers = [
      'Product Name','NMFC','Class','Default Weight','Default Length','Default Width','Default Height',
      'Unit Type','Hazmat','Category','Description'
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
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  parseCSV(csvText) {
    // Simple CSV parser (production should use PapaParse)
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const product = {
        productName: values[0] || '',
        nmfc: values[1] || '',
        freightClass: values[2] || '',
        defaultWeight: parseFloat(values[3]) || 0,
        defaultLength: parseFloat(values[4]) || 0,
        defaultWidth: parseFloat(values[5]) || 0,
        defaultHeight: parseFloat(values[6]) || 0,
        unitType: values[7] || 'Pallets',
        hazmat: values[8]?.toLowerCase() === 'yes',
        category: values[9] || '',
        description: values[10] || ''
      };
      
      if (product.productName) {
        products.push(product);
      }
    }
    
    return products;
  }

  async importProducts(products) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const existing = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const newProducts = products.map(p => ({
      ...p,
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString()
    }));
    
    const combined = [...existing, ...newProducts];
    localStorage.setItem('product_catalog', JSON.stringify(combined));
    
    return { success: true, imported: newProducts.length };
  }
}

export default new ProductCatalogAPI();
