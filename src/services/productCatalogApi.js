// src/services/productCatalogApi.js
const API_BASE =
  (typeof window !== 'undefined' && window.__CONFIG__ && window.__CONFIG__.API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  ''; // empty => use mocks

const withAuth = () => {
  const token = (typeof window !== 'undefined' && localStorage.getItem('auth_token')) || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

class ProductCatalogAPI {
  constructor() {
    this.useMock = !API_BASE; // if no API url, use localStorage mocks
    this.baseUrl = API_BASE || 'http://localhost:0'; // unused when mocked
  }

  // ---------- Public methods ----------
  async getProducts() {
    if (this.useMock) return this.mockGetProducts();
    const res = await fetch(`${this.baseUrl}/api/products`, { headers: withAuth() });
    if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
    const data = await res.json();
    return { success: true, products: data.products || [] };
  }

  async saveProduct(productData) {
    if (this.useMock) return this.mockSaveProduct(productData);
    const res = await fetch(`${this.baseUrl}/api/products`, {
      method: 'POST',
      headers: withAuth(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error(`Failed to save product (${res.status})`);
    const data = await res.json();
    return { success: true, product: data.product };
  }

  async updateProduct(productId, productData) {
    if (this.useMock) return this.mockUpdateProduct(productId, productData);
    const res = await fetch(`${this.baseUrl}/api/products/${productId}`, {
      method: 'PUT',
      headers: withAuth(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error(`Failed to update product (${res.status})`);
    const data = await res.json();
    return { success: true, product: data.product };
  }

  async deleteProduct(productId) {
    if (this.useMock) return this.mockDeleteProduct(productId);
    const res = await fetch(`${this.baseUrl}/api/products/${productId}`, {
      method: 'DELETE',
      headers: withAuth()
    });
    if (!res.ok) throw new Error(`Failed to delete product (${res.status})`);
    return { success: true };
  }

  async importProducts(products) {
    if (this.useMock) return this.mockImportProducts(products);
    const res = await fetch(`${this.baseUrl}/api/products/import`, {
      method: 'POST',
      headers: withAuth(),
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error(`Failed to import products (${res.status})`);
    const data = await res.json();
    return { success: true, imported: data.imported, message: data.message };
  }

  // ---------- Mocks (localStorage) ----------
  async mockGetProducts() {
    await new Promise(r => setTimeout(r, 300));
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');

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
    await new Promise(r => setTimeout(r, 500));
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
    await new Promise(r => setTimeout(r, 500));
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return { success: false, error: 'Product not found' };
    products[idx] = { ...products[idx], ...productData, updatedAt: new Date().toISOString() };
    localStorage.setItem('product_catalog', JSON.stringify(products));
    return { success: true, product: products[idx] };
  }

  async mockDeleteProduct(productId) {
    await new Promise(r => setTimeout(r, 500));
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const filtered = products.filter(p => p.id !== productId);
    localStorage.setItem('product_catalog', JSON.stringify(filtered));
    return { success: true };
  }

  async mockImportProducts(importedProducts) {
    await new Promise(r => setTimeout(r, 1000));
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const newProducts = importedProducts.map(p => ({
      ...p,
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString()
    }));
    const combined = [...products, ...newProducts];
    localStorage.setItem('product_catalog', JSON.stringify(combined));
    return { success: true, imported: newProducts.length, message: `Successfully imported ${newProducts.length} products` };
  }

  // ---------- CSV helpers ----------
  exportToCSV(products) {
    const headers = [
      'Product Name','NMFC','Class','Default Weight','Default Length','Default Width','Default Height',
      'Unit Type','Hazmat','Hazmat UN','Hazmat PSN','Hazard Class','Packing Group','Emergency Phone',
      'Category','Description'
    ];

    const rows = products.map(p => [
      p.productName,
      p.nmfc || '',
      p.freightClass || '',
      p.defaultWeight ?? '',
      p.defaultLength ?? '',
      p.defaultWidth ?? '',
      p.defaultHeight ?? '',
      p.unitType || 'Pallets',
      p.hazmat ? 'Yes' : 'No',
      p.hazmatDetails?.unNumber || '',
      p.hazmatDetails?.properShippingName || '',
      p.hazmatDetails?.hazardClass || '',
      p.hazmatDetails?.packingGroup || '',
      p.hazmatDetails?.emergencyPhone || '',
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

  /**
   * NOTE: This is a minimal CSV parser (no full RFC 4180 handling).
   * It will break on embedded newlines or commas in quoted fields.
   * For production, consider PapaParse.
   */
  parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const norm = s => s.trim().replace(/^"|"$/g, '');
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => norm(v));
      const row = Object.fromEntries(headers.map((h, idx) => [h.toLowerCase(), values[idx] ?? '']));
      const p = {};

      p.productName = row['product name'] || row['name'] || '';
      p.nmfc = row['nmfc'] || '';
      p.freightClass = row['class'] || row['freight class'] || '';
      p.defaultWeight = parseFloat(row['default weight'] || row['weight']) || 0;
      p.defaultLength = parseFloat(row['default length'] || row['length']) || 0;
      p.defaultWidth = parseFloat(row['default width'] || row['width']) || 0;
      p.defaultHeight = parseFloat(row['default height'] || row['height']) || 0;
      p.unitType = row['unit type'] || 'Pallets';
      p.hazmat = (row['hazmat'] || '').toLowerCase() === 'yes' || (row['hazmat'] || '').toLowerCase() === 'true';
      p.category = row['category'] || '';
      p.description = row['description'] || '';

      // Optional hazmatDetails columns
      if (p.hazmat) {
        p.hazmatDetails = {
          unNumber: row['hazmat un'] || row['un'] || '',
          properShippingName: row['hazmat psn'] || row['psn'] || '',
          hazardClass: row['hazard class'] || row['class (hazmat)'] || '',
          packingGroup: row['packing group'] || '',
          emergencyPhone: row['emergency phone'] || ''
        };
      }

      if (p.productName) products.push(p);
    }

    return products;
  }

  // Local client-side search
  searchProducts(query) {
    const products = JSON.parse(localStorage.getItem('product_catalog') || '[]');
    const q = (query || '').toLowerCase();
    return products.filter(p =>
      (p.productName || '').toLowerCase().includes(q) ||
      (p.nmfc || '').includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }
}

export default new ProductCatalogAPI();
