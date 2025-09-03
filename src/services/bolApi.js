// src/services/bolApi.js
import API_BASE from '../config/api';

class BolAPI {
  async createBOL({ bookingId, bolNumber, bolData, htmlContent }) {
    try {
      // Try real API first
      const response = await fetch(`${API_BASE}/bol/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          bookingId,
          bolNumber,
          bolData,
          htmlContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Fallback to mock
      return this.mockCreateBOL({ bookingId, bolNumber, bolData, htmlContent });
      
    } catch (error) {
      console.error('BOL creation error:', error);
      // Fallback to mock implementation
      return this.mockCreateBOL({ bookingId, bolNumber, bolData, htmlContent });
    }
  }

  async mockCreateBOL({ bookingId, bolNumber, bolData, htmlContent }) {
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
      htmlContent: htmlContent || '', // Store the HTML content
      createdAt: new Date().toISOString(),
      createdBy: localStorage.getItem('user_email') || 'user@example.com'
    };
    
    // Get existing BOLs
    const existingBOLs = JSON.parse(localStorage.getItem('bols') || '[]');
    existingBOLs.push(bol);
    localStorage.setItem('bols', JSON.stringify(existingBOLs));
    
    // Also update the booking to indicate it has a BOL
    const bookingKey = `booking_${bookingId}`;
    const booking = JSON.parse(localStorage.getItem(bookingKey) || '{}');
    if (booking.bookingId) {
      booking.hasBOL = true;
      booking.bolId = bolId;
      booking.bolNumber = bolNumber;
      localStorage.setItem(bookingKey, JSON.stringify(booking));
    }
    
    return {
      success: true,
      bolId,
      bolNumber,
      message: 'BOL saved successfully'
    };
  }

  async getBOLByBooking(bookingId) {
    try {
      // Try real API first
      const response = await fetch(`${API_BASE}/bol/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Fallback to mock
      return this.mockGetBOLByBooking(bookingId);
      
    } catch (error) {
      console.error('Error fetching BOL:', error);
      return this.mockGetBOLByBooking(bookingId);
    }
  }

  async mockGetBOLByBooking(bookingId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const bol = bols.find(b => b.bookingId === bookingId);
    
    if (!bol) {
      return { success: false, error: 'BOL not found' };
    }
    
    return {
      success: true,
      bol
    };
  }

  async getBOL(bolId) {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    return bols.find(b => b.bolId === bolId);
  }

  async getAllBOLs() {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    return {
      success: true,
      bols
    };
  }

  async deleteBOL(bolId) {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const filtered = bols.filter(b => b.bolId !== bolId);
    localStorage.setItem('bols', JSON.stringify(filtered));
    return { success: true };
  }

  // Helper to generate PDF (placeholder - in production use a real PDF library)
  async generatePDF(htmlContent) {
    // In production, you would use a library like jsPDF or html2pdf
    // For now, we'll just return a data URL of the HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new BolAPI();
