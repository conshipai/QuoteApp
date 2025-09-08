// src/services/bookingApi.js - NO MOCK DATA VERSION
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

    if (!response.ok) {
      throw new Error('Failed to create booking');
    }

    return await response.json();
  }

  async getAllBookings() {
    const response = await fetch(`${API_BASE}/bookings`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return await response.json();
  }

  async getBooking(bookingId) {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Booking not found');
    }

    return await response.json();
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new BookingAPI();
