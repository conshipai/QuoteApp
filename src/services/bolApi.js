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
    
    // Create the BOL object
    const bol = {
      bolId,
      bookingId,
      bolNumber,
      bolData,
      htmlContent: htmlContent || '', // Store the HTML content
      createdAt: new Date().toISOString(),
      createdBy: localStorage.getItem('user_email') || 'user@example.com'
    };
    
    // Get existing BOLs or initialize empty array
    const existingBOLs = JSON.parse(localStorage.getItem('bols') || '[]');
    
    // Check if a BOL already exists for this booking and remove it (update case)
    const filteredBOLs = existingBOLs.filter(b => b.bookingId !== bookingId);
    
    // Add the new BOL
    filteredBOLs.push(bol);
    localStorage.setItem('bols', JSON.stringify(filteredBOLs));
    
    // IMPORTANT: Update ALL places where the booking might be stored
    
    // 1. Update the specific booking entry
    const bookingKey = `booking_${bookingId}`;
    const bookingData = localStorage.getItem(bookingKey);
    if (bookingData) {
      const booking = JSON.parse(bookingData);
      booking.hasBOL = true;
      booking.bolId = bolId;
      booking.bolNumber = bolNumber;
      localStorage.setItem(bookingKey, JSON.stringify(booking));
    }
    
    // 2. Also update in any "all bookings" cache if it exists
    const allBookingsKey = 'all_bookings_cache';
    const allBookingsData = localStorage.getItem(allBookingsKey);
    if (allBookingsData) {
      const allBookings = JSON.parse(allBookingsData);
      const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);
      if (bookingIndex !== -1) {
        allBookings[bookingIndex].hasBOL = true;
        allBookings[bookingIndex].bolId = bolId;
        allBookings[bookingIndex].bolNumber = bolNumber;
        localStorage.setItem(allBookingsKey, JSON.stringify(allBookings));
      }
    }
    
    console.log('BOL created successfully:', { bolId, bookingId, bolNumber });
    
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
      console.log('No BOL found for booking:', bookingId);
      return { success: false, error: 'BOL not found' };
    }
    
    console.log('BOL found for booking:', bookingId, bol.bolNumber);
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
    const bol = bols.find(b => b.bolId === bolId);
    
    if (bol) {
      // Remove BOL from list
      const filtered = bols.filter(b => b.bolId !== bolId);
      localStorage.setItem('bols', JSON.stringify(filtered));
      
      // Update the booking to remove BOL reference
      const bookingKey = `booking_${bol.bookingId}`;
      const bookingData = localStorage.getItem(bookingKey);
      if (bookingData) {
        const booking = JSON.parse(bookingData);
        delete booking.hasBOL;
        delete booking.bolId;
        delete booking.bolNumber;
        localStorage.setItem(bookingKey, JSON.stringify(booking));
      }
    }
    
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

  // Utility method to check BOL status for debugging
  debugBOLStatus(bookingId) {
    console.log('=== BOL Debug Info ===');
    console.log('Checking for booking:', bookingId);
    
    // Check BOLs array
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const bol = bols.find(b => b.bookingId === bookingId);
    console.log('BOL found in bols array:', bol ? 'Yes' : 'No', bol);
    
    // Check booking record
    const bookingKey = `booking_${bookingId}`;
    const booking = JSON.parse(localStorage.getItem(bookingKey) || '{}');
    console.log('Booking record:', booking);
    console.log('Booking hasBOL flag:', booking.hasBOL);
    console.log('Booking bolNumber:', booking.bolNumber);
    
    return { bol, booking };
  }
}

export default new BolAPI();
