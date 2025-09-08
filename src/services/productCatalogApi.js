// src/services/productCatalogApi.js - NO MOCK DATA VERSION
import API_BASE from '../config/api';

class ProductCatalogAPI {
  async getProducts() {
    throw new Error('Product Catalog API not implemented in backend yet');
  }

  async saveProduct(productData) {
    throw new Error('Product Catalog API not implemented in backend yet');
  }

  async updateProduct(productId, productData) {
    throw new Error('Product Catalog API not implemented in backend yet');
  }

  async deleteProduct(productId) {
    throw new Error('Product Catalog API not implemented in backend yet');
  }

  async importProducts(products) {
    throw new Error('Product Catalog API not implemented in backend yet');
  }

  exportToCSV(products) {
    throw new Error('Product Catalog API not implemented in backend yet');
  }

  parseCSV(csvText) {
    throw new Error('Product Catalog API not implemented in backend yet');
  }
}

export default new ProductCatalogAPI();
