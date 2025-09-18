// src/services/bookingApi.js
import api from './api';

const API_BASE = 'https://api.gcc.conship.ai/api';

class BookingAPI {
  // Updated createBooking method
  async createBooking(bookingData) {
    try {
      // Check if this is using the new booking request format
      if (bookingData.quoteId || bookingData.pickup) {
        // New booking request system
        const response = await fetch(`${API_BASE}/booking-requests/create-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            booking: {
              bookingId: result.bookingRequest.id,
              requestNumber: result.bookingRequest.requestNumber,
              status: result.bookingRequest.status,
              ...result.bookingRequest
            }
          };
        } else {
          throw new Error(result.error || 'Failed to create booking');
        }
      } else {
        // Fall back to old system for backward compatibility
        const response = await fetch(`${API_BASE}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(bookingData)
        });

        return await response.json();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Modified to fetch booking requests
  async getAllBookings() {
    try {
      const response = await fetch(`${API_BASE}/booking-requests/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error fetching booking requests:', error);
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
