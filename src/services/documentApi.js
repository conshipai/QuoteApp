// src/services/documentApi.js
import API_BASE from '../config/api';

class DocumentAPI {
  async uploadDocument(file, requestId, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);
    formData.append('documentType', documentType);

    const response = await fetch(`${API_BASE}/storage/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async getSignedUrl(key) {
    const response = await fetch(`${API_BASE}/storage/signed-url/${encodeURIComponent(key)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }

    return response.json();
  }
}

export default new DocumentAPI();
