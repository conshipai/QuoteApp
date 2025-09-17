// src/services/bookingRequestApi.js
import API_BASE from '../config/api';

const bookingRequestApi = {
  // Create a new booking request
  createBookingRequest: async (data) => {
    try {
      const response = await fetch(`${API_BASE}/booking-requests/create-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating booking request:', error);
      throw error;
    }
  },

  // Get pending bookings (for employees)
  getPendingBookings: async (status = 'pending_review') => {
    try {
      const response = await fetch(`${API_BASE}/booking-requests/pending?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      throw error;
    }
  },

  // Approve booking
  approveBooking: async (bookingId, notes) => {
    try {
      const response = await fetch(`${API_BASE}/booking-requests/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ notes })
      });
      return await response.json();
    } catch (error) {
      console.error('Error approving booking:', error);
      throw error;
    }
  },

  // Convert to shipment
  convertToShipment: async (bookingId, carrierData) => {
    try {
      const response = await fetch(`${API_BASE}/booking-requests/${bookingId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(carrierData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error converting to shipment:', error);
      throw error;
    }
  },

  // Get booking status
  getBookingStatus: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE}/booking-requests/${bookingId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching booking status:', error);
      throw error;
    }
  }
};

export default bookingRequestApi;
