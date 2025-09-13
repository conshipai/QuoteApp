// ============================================
// 5. documentApi.js - FIXED TO USE CENTRALIZED API
// ============================================
import api from './api';

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
      const { data: result } = await api.post('/storage/upload', formData);

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
      const { data: result } = await api.get(`/storage/documents/${requestId}`);
      
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
      const { data: result } = await api.get(`/storage/signed-url/${encodeURIComponent(key)}`);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get signed URL');
      }
      
      return result.url;
    } catch (error) {
      console.error('❌ Error getting signed URL:', error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      const { data: result } = await api.delete(`/storage/documents/${documentId}`);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete document');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }
}

export default new DocumentAPI();
