// src/services/documentApi.js
class DocumentAPI {
  async uploadDocument(bookingId, file, docType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('docType', docType);
    
    // In production: POST to your backend
    // For now, store reference in localStorage
    const documentRef = {
      id: `doc-${Date.now()}`,
      bookingId,
      docType,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };
    
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    docs.push(documentRef);
    localStorage.setItem('documents', JSON.stringify(docs));
    
    return { success: true, document: documentRef };
  }
  
  async getDocumentsByBooking(bookingId) {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    return docs.filter(doc => doc.bookingId === bookingId);
  }
}

export default new DocumentAPI();
