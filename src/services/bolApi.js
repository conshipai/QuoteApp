import documentApi from './documentApi';
import html2pdf from 'html2pdf.js'; // You'll need to install this: npm install html2pdf.js

class BolAPI {
  async createBOL({ bookingId, bolNumber, bolData, htmlContent }) {
    try {
      // First, convert HTML to PDF
      const bolElement = document.getElementById('bol-template');
      if (!bolElement) {
        throw new Error('BOL template not found');
      }

      // Generate PDF from HTML
      const opt = {
        margin: 0.5,
        filename: `BOL-${bolNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(opt).from(bolElement).outputPdf('blob');
      
      // Create File object from blob
      const pdfFile = new File([pdfBlob], `BOL-${bolNumber}.pdf`, { 
        type: 'application/pdf' 
      });

      // Upload to Cloudflare R2 using your existing backend
      const uploadResult = await documentApi.uploadDocument(
        pdfFile,
        bookingId,  // Using bookingId as requestId
        'bol'       // Document type
      );

      // Save BOL metadata to your backend database
      const response = await fetch(`${API_BASE}/bol/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          bookingId,
          bolNumber,
          bolData,
          fileUrl: uploadResult.fileUrl,  // Store the R2 URL
          fileKey: uploadResult.key,      // Store the R2 key
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Fallback to localStorage if backend fails
      return this.mockCreateBOL({ bookingId, bolNumber, bolData, htmlContent });
      
    } catch (error) {
      console.error('BOL creation error:', error);
      // Fallback to localStorage
      return this.mockCreateBOL({ bookingId, bolNumber, bolData, htmlContent });
    }
  }

  async mockGetBOLByBooking(bookingId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const bol = bols.find(b => b.bookingId === bookingId);
    
    if (!bol) {
      console.log('No BOL found for booking:', bookingId);
      return { success: false, error: 'BOL not found' };
    }
    
    console.log('BOL found for booking:', bookingId, bol.bolNumber);
    return {
      success: true,
      bol
    };
  }

  async getBOL(bolId) {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    return bols.find(b => b.bolId === bolId);
  }

  async getAllBOLs() {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    return {
      success: true,
      bols
    };
  }

  async deleteBOL(bolId) {
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const bol = bols.find(b => b.bolId === bolId);
    
    if (bol) {
      // Remove BOL from list
      const filtered = bols.filter(b => b.bolId !== bolId);
      localStorage.setItem('bols', JSON.stringify(filtered));
      
      // Update the booking to remove BOL reference
      const bookingKey = `booking_${bol.bookingId}`;
      const bookingData = localStorage.getItem(bookingKey);
      if (bookingData) {
        const booking = JSON.parse(bookingData);
        delete booking.hasBOL;
        delete booking.bolId;
        delete booking.bolNumber;
        localStorage.setItem(bookingKey, JSON.stringify(booking));
      }
    }
    
    return { success: true };
  }

  // Helper to generate PDF (placeholder - in production use a real PDF library)
  async generatePDF(htmlContent) {
    // In production, you would use a library like jsPDF or html2pdf
    // For now, we'll just return a data URL of the HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }

  // Utility method to check BOL status for debugging
  debugBOLStatus(bookingId) {
    console.log('=== BOL Debug Info ===');
    console.log('Checking for booking:', bookingId);
    
    // Check BOLs array
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const bol = bols.find(b => b.bookingId === bookingId);
    console.log('BOL found in bols array:', bol ? 'Yes' : 'No', bol);
    
    // Check booking record
    const bookingKey = `booking_${bookingId}`;
    const booking = JSON.parse(localStorage.getItem(bookingKey) || '{}');
    console.log('Booking record:', booking);
    console.log('Booking hasBOL flag:', booking.hasBOL);
    console.log('Booking bolNumber:', booking.bolNumber);
    
    return { bol, booking };
  }
}

export default new BolAPI();
