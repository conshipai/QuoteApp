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

  // Get all booking requests (not bookings) — transformed for BookingsManagement
  async getAllBookings() {
    try {
      const response = await fetch(`${API_BASE}/booking-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch booking requests');

      const data = await response.json();

      if (data.success && Array.isArray(data.bookingRequests)) {
        return {
          success: true,
          bookings: data.bookingRequests.map(req => ({
            // surface-level fields BookingsManagement expects
            bookingId: req.requestNumber,
            confirmationNumber: req.requestNumber,
            status:
              req.status === 'pending_review' ? 'PENDING' :
              req.status === 'approved' ? 'CONFIRMED' :
              String(req.status || '').toUpperCase(),
            carrier: 'Pending Assignment',
            pickupNumber: 'N/A',
            price: (req.pricing && req.pricing.total) ? req.pricing.total : 0,
            mode: 'ground',
            requestId: req._id,
            createdAt: req.createdAt,

            // Map shipment data to expected shape
            shipmentData: {
              formData: {
                originCity: req.pickup?.city,
                originState: req.pickup?.state,
                originCompany: req.pickup?.company,
                destCity: req.delivery?.city,
                destState: req.delivery?.state,
                destCompany: req.delivery?.company,
                pickupDate: req.pickup?.readyDate,
                weight: req.cargo?.totalWeight,
                pieces: req.cargo?.totalPieces
              },
              serviceType: 'ltl'
            },

            // Keep originals for detail views
            pickup: req.pickup,
            delivery: req.delivery,
            cargo: req.cargo,
            pricing: req.pricing
          }))
        };
      }

      // Fallback: return whatever came back
      return data;
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      return { success: false, bookings: [] };
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

  // NEW: Cancel a booking with reason
  async cancelBooking(bookingId, reason = 'User requested cancellation') {
    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to cancel booking');
      }

      return data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }

  // Delete booking (uses cancel endpoint for soft delete)
  async deleteBooking(bookingId) {
    try {
      // Try the cancel endpoint first (soft delete)
      return await this.cancelBooking(bookingId, 'User requested deletion');
    } catch (error) {
      // If cancel fails, try the DELETE endpoint as fallback
      try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to delete booking');
        }

        return data;
      } catch (deleteError) {
        console.error('Error deleting booking:', deleteError);
        throw deleteError;
      }
    }
  }
}

export default new BookingAPI();
