// src/services/bookingApi.js
const API_BASE = window.REACT_APP_API_URL || 'https://api.conship.ai';

class BookingAPI {
  async createBooking(quoteData, requestId) {
    // For production: POST to your backend
    // For now: mock implementation
    return this.mockCreateBooking(quoteData, requestId);
  }

  async mockCreateBooking(quoteData, requestId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get the original request data from localStorage
    const originalRequest = JSON.parse(
      localStorage.getItem(`quote_request_${requestId}`) || '{}'
    );
    
    const booking = {
      bookingId: `BK-${Date.now()}`,
      confirmationNumber: `CON-2025-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      requestId,
      status: 'CONFIRMED',
      carrier: quoteData.service_details.carrier,
      price: quoteData.final_price,
      pickupNumber: `PU-${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`,
      createdAt: new Date().toISOString(),
      shipmentData: originalRequest
    };
    
    // Save booking to localStorage
    localStorage.setItem(`booking_${booking.bookingId}`, JSON.stringify(booking));
    
    return {
      success: true,
      booking
    };
  }

  async getBooking(bookingId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const booking = localStorage.getItem(`booking_${bookingId}`);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    
    return { 
      success: true, 
      booking: JSON.parse(booking) 
    };
  }

  // ✅ NEW METHODS
  async getAllBookings() {
    // For production: GET from your backend
    return this.mockGetAllBookings();
  }

  async mockGetAllBookings() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all bookings from localStorage
    const bookings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('booking_')) {
        const booking = JSON.parse(localStorage.getItem(key));
        // Add mode based on service type
        booking.mode = booking.shipmentData?.serviceType === 'ltl' ? 'ground' : 
                       booking.shipmentData?.serviceType === 'air' ? 'air' : 
                       booking.shipmentData?.serviceType === 'ocean' ? 'ocean' : 'ground';
        
        // Add sample documents
        booking.documents = [
          { type: 'BOL', name: 'Bill of Lading', createdAt: booking.createdAt },
          { type: 'INVOICE', name: 'Commercial Invoice', createdAt: booking.createdAt }
        ];
        
        bookings.push(booking);
      }
    }
    
    // Sort by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      success: true,
      bookings
    };
  }

  async getDocument(bookingId, docType) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, this would fetch the actual PDF from your backend
    return {
      success: true,
      document: {
        type: docType,
        bookingId,
        url: `https://api.conship.ai/documents/${bookingId}/${docType}.pdf`,
        // For mock, we could return base64 encoded PDF data
        data: null
      }
    };
  }

  async cancelBooking(bookingId) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const booking = JSON.parse(localStorage.getItem(`booking_${bookingId}`));
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    localStorage.setItem(`booking_${bookingId}`, JSON.stringify(booking));
    
    return { success: true };
  }
}

export default new BookingAPI();
