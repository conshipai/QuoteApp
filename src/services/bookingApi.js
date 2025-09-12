// src/services/bookingApi.js - UPDATED VERSION
import axios from 'axios';
import API_BASE from '../config/api';

class BookingAPI {
  async createBooking(bookingData) {
    const { data } = await axios.post(`${API_BASE}/bookings`, bookingData);
    
    if (!data.success) {
      throw new Error(data?.error || 'Failed to create booking');
    }

    // Store booking locally for reference
    if (data.booking) {
      localStorage.setItem(`booking_${data.booking.bookingId}`, JSON.stringify(data.booking));
    }

    return data;
  }

  async getAllBookings() {
    const { data } = await axios.get(`${API_BASE}/bookings`);
    
    if (!data.success) {
      throw new Error(data?.error || 'Failed to fetch bookings');
    }

    return data;
  }

  async getBooking(bookingId) {
    const { data } = await axios.get(`${API_BASE}/bookings/${bookingId}`);
    
    if (!data.success) {
      throw new Error(data?.error || 'Booking not found');
    }

    return data;
  }

  async getBookingByRequest(requestId) {
    const { data } = await axios.get(`${API_BASE}/bookings/by-request/${requestId}`);
    
    if (!data.success) {
      throw new Error(data?.error || 'Booking not found');
    }

    return data;
  }

  // Remove getToken() method - no longer needed!
}

export default new BookingAPI();
