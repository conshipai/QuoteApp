// src/services/bookingApi.js
import api from './api';

class BookingAPI {
  async createBooking(bookingData) {
    try {
      const { data } = await api.post('/bookings', bookingData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to create booking');
      }

      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getAllBookings() {
    try {
      const { data } = await api.get('/bookings');
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async getBooking(bookingId) {
    try {
      const { data } = await api.get(`/bookings/${bookingId}`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Booking not found');
      }

      return data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  async getBookingByRequest(requestId) {
    try {
      const { data } = await api.get(`/bookings/by-request/${requestId}`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Booking not found');
      }

      return data;
    } catch (error) {
      console.error('Error fetching booking by request:', error);
      throw error;
    }
  }

  async updateBooking(bookingId, updateData) {
    try {
      const { data } = await api.put(`/bookings/${bookingId}`, updateData);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to update booking');
      }

      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId) {
    try {
      const { data } = await api.delete(`/bookings/${bookingId}`);
      
      if (!data.success) {
        throw new Error(data?.error || 'Failed to delete booking');
      }

      return data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
}

export default new BookingAPI();
