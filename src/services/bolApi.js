// ============================================
// 2. bolApi.js - UPDATED TO USE AXIOS
// ============================================
import api from './api';
import API_BASE from '../config/api';

class BolAPI {
  async createBOL({ bookingId, bolNumber, bolData, htmlContent, bookingData }) {
    try {
      console.log('🔄 Starting BOL creation for:', bolNumber);

      // Get booking data from API if not provided
      if (!bookingData) {
        const { data } = await axios.get(`${API_BASE}/bookings/${bookingId}`);
        if (!data.success) {
          throw new Error('Booking data not found');
        }
        bookingData = data.booking;
      }

      // Use requestNumber or requestId from bookingData
      const requestId = bookingData.requestNumber || bookingData.requestId;
      if (!requestId) {
        throw new Error('Request ID not found in booking data');
      }

      console.log('📋 Using Request ID for storage:', requestId);

      // Generate and upload PDF
      let fileUrl = null;
      let fileKey = null;

      if (typeof window !== 'undefined' && window.html2pdf) {
        const bolElement = document.getElementById('bol-template');
        if (!bolElement) {
          throw new Error('BOL template element not found');
        }

        console.log('📄 Generating PDF from HTML...');
        const opt = {
          margin: 0.5,
          filename: `BOL-${bolNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const pdfBlob = await window.html2pdf().set(opt).from(bolElement).outputPdf('blob');

        console.log('✅ PDF generated successfully, size:', pdfBlob.size);
        if (pdfBlob.size < 1000) {
          throw new Error('Generated PDF is too small, might be corrupted');
        }

        const pdfFile = new File([pdfBlob], `BOL-${bolNumber}.pdf`, { type: 'application/pdf' });

        console.log('📤 Uploading to storage service...');
        const uploadResult = await this.uploadDocument(pdfFile, requestId, 'bol');

        console.log('✅ BOL uploaded successfully:', uploadResult);
        fileUrl = uploadResult.fileUrl;
        fileKey = uploadResult.key;
      } else {
        throw new Error('html2pdf library not loaded. Please ensure it is included in your HTML.');
      }

      // Save BOL metadata to database via API
      const { data } = await axios.post(`${API_BASE}/bols`, {
        bookingId,
        requestId,
        bolNumber,
        fileUrl,
        fileKey,
        documentType: 'bol'
      });

      if (!data.success) {
        throw new Error(data?.error || 'Failed to save BOL metadata');
      }

      // Update the booking record via API
      if (bookingId) {
        await axios.put(`${API_BASE}/bookings/${bookingId}/bol`, {
          hasBOL: true,
          bolNumber,
          bolId: data.bolId,
          bolFileUrl: fileUrl,
          bolFileKey: fileKey
        });
      }

      console.log('✅ BOL saved with URL:', fileUrl);
      alert(`BOL ${bolNumber} saved successfully!\n\nView at: ${fileUrl}`);

      return {
        success: true,
        bolId: data.bolId,
        bolNumber,
        fileUrl,
        fileKey,
        requestId,
        message: 'BOL created and uploaded successfully'
      };
    } catch (error) {
      console.error('❌ BOL creation failed:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to create BOL:\n${errorMessage}\n\nPlease check the console for details.`);
      return { success: false, error: errorMessage };
    }
  }

  async uploadDocument(file, requestId, documentType) {
    console.log('📤 Uploading document:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      requestId,
      documentType
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);
    formData.append('documentType', documentType);

    try {
      const { data: result } = await axios.post(`${API_BASE}/storage/upload`, formData);

      console.log('✅ Upload successful:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }

  async getBOLByBooking(bookingId) {
    try {
      const { data } = await axios.get(`${API_BASE}/bols/by-booking/${bookingId}`);
      
      if (!data.success) {
        console.log('No BOL found for booking:', bookingId);
        return { success: false, error: 'BOL not found' };
      }
      
      console.log('BOL found:', data.bol);
      
      // If we have a file URL, return it with a view link
      if (data.bol && data.bol.fileUrl) {
        return {
          success: true,
          bol: {
            ...data.bol,
            htmlContent: `
              <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <h3>Bill of Lading</h3>
                <p><strong>BOL Number:</strong> ${data.bol.bolNumber}</p>
                <p><strong>Created:</strong> ${new Date(data.bol.createdAt).toLocaleString()}</p>
                <p><strong>Storage Path:</strong> ${data.bol.fileKey}</p>
                <p>
                  <a href="${data.bol.fileUrl}" 
                     target="_blank" 
                     style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                    View/Download BOL PDF
                  </a>
                </p>
              </div>
            `
          }
        };
      }
      
      return { success: true, bol: data.bol };
    } catch (error) {
      console.error('Error getting BOL:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new BolAPI();
