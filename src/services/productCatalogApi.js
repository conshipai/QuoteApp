// ============================================
// 6. productCatalogApi.js - FIXED TO USE CENTRALIZED API
// ============================================
import api from './api';

class ProductCatalogAPI {
  async getProducts() {
    try {
      const { data } = await api.get('/products');
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to fetch products');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async saveProduct(productData) {
    try {
      const { data } = await api.post('/products', productData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to save product');
      }
      
      return data;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      const { data } = await api.put(`/products/${productId}`, productData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to update product');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const { data } = await api.delete(`/products/${productId}`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to delete product');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Export products to CSV
  async exportToCSV() {
    try {
      const { data } = await api.get('/products/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product_catalog_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting products:', error);
      throw error;
    }
  }

  // Import products from CSV
  async importProducts(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post('/products/import', formData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to import products');
      }
      
      return data;
    } catch (error) {
      console.error('Error importing products:', error);
      throw error;
    }
  }
}

export default new ProductCatalogAPI();
