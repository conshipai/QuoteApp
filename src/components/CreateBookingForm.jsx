// src/components/bookings/CreateBookingForm.jsx
const CreateBookingForm = ({ quote, isDarkMode }) => {
  const [bookingData, setBookingData] = useState({
    // Pickup Details
    pickup: {
      company: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      hours: 'business', // business/24-7/custom
      customHours: { open: '08:00', close: '17:00' },
      readyDate: '',
      readyTime: ''
    },
    
    // Delivery Details
    delivery: {
      company: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      hours: 'business',
      customHours: { open: '08:00', close: '17:00' },
      requiredDate: '',
      requiredTime: '',
      guaranteed: false
    },
    
    // Cargo Details
    cargo: {
      pieces: [],
      totalWeight: 0,
      totalPieces: 0,
      description: '',
      hazmat: false,
      hazmatDetails: null
    },
    
    // Additional Services
    services: {
      insurance: false,
      insuranceValue: '',
      liftgatePickup: false,
      liftgateDelivery: false,
      insidePickup: false,
      insideDelivery: false,
      appointmentRequired: false,
      notifications: ['email'] // email, sms, both
    },
    
    // Documents
    documents: [],
    
    // Notes
    specialInstructions: ''
  });
  
  // Implementation details...
};
