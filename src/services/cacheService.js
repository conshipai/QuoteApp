// src/services/cacheService.js
const API_URL = process.env.REACT_APP_API_URL || 'https://api.gcc.conship.ai';

class CacheService {
  // Save to cache (replaces localStorage.setItem)
  async setItem(key, value, type = 'formdata') {
    try {
      // Determine type from key if not provided
      if (key.includes('formdata')) type = 'formdata';
      else if (key.includes('complete')) type = 'complete';
      else if (key.includes('ground_quotes')) type = 'ground_quotes';
      else if (key.includes('booking')) type = 'booking';
      
      // Extract reference ID from key
      const referenceId = key.split('_').pop();
      
      const response = await fetch(`${API_URL}/api/cache/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          type,
          data: value,
          referenceId
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cache set error:', error);
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  
  // Get from cache (replaces localStorage.getItem)
  async getItem(key) {
    try {
      const response = await fetch(`${API_URL}/api/cache/get/${key}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Cache get error:', error);
      // Fallback to localStorage
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  }
  
  // Remove from cache (replaces localStorage.removeItem)
  async removeItem(key) {
    try {
      await fetch(`${API_URL}/api/cache/remove/${key}`, {
        method: 'DELETE'
      });
      // Also remove from localStorage
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
      localStorage.removeItem(key);
    }
  }
}

export default new CacheService();
