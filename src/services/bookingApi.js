// src/services/bookingApi.js - NO MOCK FALLBACKS
import API_BASE from '../config/api';

class BookingAPI {
  async createBooking(bookingData) {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Failed to create booking');
    }

    // Store booking locally for reference
    if (data.booking) {
      localStorage.setItem(`booking_${data.booking.bookingId}`, JSON.stringify(data.booking));
    }

    return data;
  }

  async getAllBookings() {
    const response = await fetch(`${API_BASE}/bookings`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Failed to fetch bookings');
    }

    return data;
  }

  async getBooking(bookingId) {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Booking not found');
    }

    return data;
  }

  async getBookingByRequest(requestId) {
    const response = await fetch(`${API_BASE}/bookings/by-request/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Booking not found');
    }

    return data;
  }

  getToken() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token');
    }
    return token;
  }
}

export default new BookingAPI();
