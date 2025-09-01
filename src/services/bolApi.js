// src/services/bolApi.js
class BolAPI {
  async createBOL({ bookingId, bolNumber, bolData, pdfBase64 }) {
    // Mock implementation using localStorage
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate BOL ID
      const bolId = `BOL-${Date.now()}`;
      
      // Store BOL data in localStorage
      const bol = {
        bolId,
        bookingId,
        bolNumber,
        bolData,
        createdAt: new Date().toISOString(),
        // In production, pdfBase64 would be sent to server
        // For mock, we'll just store a reference
        pdfStored: true
      };
      
      // Get existing BOLs
      const existingBOLs = JSON.parse(localStorage.getItem('bols') || '[]');
      existingBOLs.push(bol);
      localStorage.setItem('bols', JSON.stringify(existingBOLs));
      
      // Store the PDF separately (due to size limits)
      localStorage.setItem(`bol_pdf_${bolId}`, pdfBase64.substring(0, 1000)); // Store partial for mock
      
      return {
        success: true,
        bolId,
        bolNumber,
        // In production, this would be a real URL
        pdfUrl: `#bol-pdf-${bolId}`
      };
    } catch (error) {
      console.error('BOL creation error:', error);
      throw error;
    }
  }

  async getBOL(bolId) {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    return bols.find(b => b.bolId === bolId);
  }

  async getBOLsByBooking(bookingId) {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    return bols.filter(b => b.bookingId === bookingId);
  }
}

export default new BolAPI();
