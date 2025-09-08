// src/services/documentApi.js
import API_BASE from '../config/api';

class DocumentAPI {
  async uploadDocument(file, requestId, documentType) {
    console.log('📤 Uploading document:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      requestId,
      documentType
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);
    formData.append('documentType', documentType);

    try {
      const response = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: formData
      });

      console.log('📥 Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = errorData?.error || `HTTP ${response.status}`;
        console.error('❌ Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result;

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }

  async getDocumentsByRequestId(requestId) {
    try {
      const response = await fetch(`${API_BASE}/storage/documents/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch documents');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw error;
    }
  }

  async getSignedUrl(key) {
    try {
      const response = await fetch(`${API_BASE}/storage/signed-url/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get signed URL');
      }
      
      return result.url;
    } catch (error) {
      console.error('❌ Error getting signed URL:', error);
      throw error;
    }
  }
}

export default new DocumentAPI();
