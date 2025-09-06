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
        const errorText = await response.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      return result;

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }
}

export default new DocumentAPI();
