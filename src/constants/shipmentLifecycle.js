// src/constants/shipmentLifecycle.js
// Frontend constants matching backend exactly

export const ShipmentLifecycle = {
  // Quote statuses
  QUOTE_REQUESTED: 'quote_requested',
  QUOTE_PROCESSING: 'quote_processing', 
  QUOTE_READY: 'quote_ready',
  QUOTE_EXPIRED: 'quote_expired',
  
  // Booking statuses
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  
  // Shipment statuses
  SHIPMENT_CREATED: 'shipment_created',
  SHIPMENT_IN_TRANSIT: 'shipment_in_transit',
  SHIPMENT_DELIVERED: 'shipment_delivered'
};

// For backward compatibility during transition
export const StatusMap = {
  'quoted': 'quote_ready',
  'pending': 'quote_processing',
  'failed': 'quote_expired',
  'pending_markup': 'quote_processing',
  'pending_carrier_response': 'quote_processing'
};
