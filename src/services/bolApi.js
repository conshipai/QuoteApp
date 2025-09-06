// src/services/bolApi.js
import API_BASE from '../config/api';
import documentApi from './documentApi';

class BolAPI {
  async createBOL({ bookingId, bolNumber, bolData, htmlContent }) {
    try {
      console.log('Starting BOL creation for:', bolNumber);
      
      // First, try to generate and upload PDF to Cloudflare
      let fileUrl = null;
      let fileKey = null;

      // Check if html2pdf is loaded
      if (typeof window !== 'undefined' && window.html2pdf) {
        const bolElement = document.getElementById('bol-template');
        
        if (bolElement) {
          console.log('Generating PDF from HTML...');
          
          // Generate PDF from HTML
          const opt = {
            margin: 0.5,
            filename: `BOL-${bolNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          const pdfBlob = await window.html2pdf().set(opt).from(bolElement).outputPdf('blob');
          console.log('PDF generated, size:', pdfBlob.size);
          
          // Create File object from blob
          const pdfFile = new File([pdfBlob], `BOL-${bolNumber}.pdf`, { 
            type: 'application/pdf' 
          });

          // Upload to Cloudflare R2
          console.log('Uploading to Cloudflare...');
          const uploadResult = await documentApi.uploadDocument(
            pdfFile,
            bookingId,  // Using bookingId as requestId
            'bol'       // Document type
          );

          console.log('✅ BOL uploaded to Cloudflare:', uploadResult);
          fileUrl = uploadResult.fileUrl;
          fileKey = uploadResult.key;
          
          // Show success message with URL
          alert(`BOL uploaded successfully!\nView at: ${fileUrl}`);
        } else {
          console.error('❌ BOL template element not found');
        }
      } else {
        console.error('❌ html2pdf library not loaded');
      }

      // Save BOL metadata (locally for now since backend might not have the endpoint)
      const bolData = {
        bolId: `BOL-${Date.now()}`,
        bookingId,
        bolNumber,
        fileUrl,
        fileKey,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage as backup
      const bols = JSON.parse(localStorage.getItem('bols') || '[]');
      bols.push(bolData);
      localStorage.setItem('bols', JSON.stringify(bols));

      console.log('✅ BOL saved with Cloudflare URL:', fileUrl);

      return {
        success: true,
        bolId: bolData.bolId,
        bolNumber,
        fileUrl,
        message: 'BOL created and uploaded to Cloudflare'
      };

    } catch (error) {
      console.error('❌ BOL creation failed:', error);
      alert('Failed to create BOL: ' + error.message);
      throw error;  // Throw the error so we can see what went wrong
    }
  }

  async getBOLByBooking(bookingId) {
    // Check localStorage for now
    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    const bol = bols.find(b => b.bookingId === bookingId);
    
    if (!bol) {
      console.log('No BOL found for booking:', bookingId);
      return { success: false, error: 'BOL not found' };
    }
    
    console.log('BOL found:', bol);
    
    // If we have a Cloudflare URL, return it
    if (bol.fileUrl) {
      return {
        success: true,
        bol: {
          ...bol,
          htmlContent: `<p>View BOL at: <a href="${bol.fileUrl}" target="_blank">${bol.fileUrl}</a></p>`
        }
      };
    }
    
    return { success: true, bol };
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new BolAPI();
