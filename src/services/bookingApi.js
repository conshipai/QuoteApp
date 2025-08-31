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
}

export default new BookingAPI();
