// src/services/cacheService.js
const API_URL = process.env.REACT_APP_API_URL || 'https://api.gcc.conship.ai';

class CacheService {
  async setItem(key, value) {
    try {
      // Determine type from key
      let type = 'formdata';
      if (key.includes('formdata')) type = 'formdata';
      else if (key.includes('complete')) type = 'complete';
      else if (key.includes('ground_quotes')) type = 'ground_quotes';
      else if (key.includes('booking')) type = 'booking';
      
      const referenceId = key.split('_').pop();
      
      const response = await fetch(`${API_URL}/api/cache/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          key: key,
          type: type,
          data: value,
          referenceId: referenceId
        })
      });
      
      if (!response.ok) throw new Error('Cache save failed');
      return await response.json();
    } catch (error) {
      console.error('Cache set error, falling back to localStorage:', error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  
  async getItem(key) {
    try {
      const response = await fetch(`${API_URL}/api/cache/get/${key}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (!response.ok) throw new Error('Cache get failed');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Cache get error, falling back to localStorage:', error);
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  }
  
  async removeItem(key) {
    try {
      await fetch(`${API_URL}/api/cache/remove/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      localStorage.removeItem(key); // Also clear localStorage
    } catch (error) {
      console.error('Cache remove error:', error);
      localStorage.removeItem(key);
    }
  }
}

const cacheServiceInstance = new CacheService();
export default cacheServiceInstance;
