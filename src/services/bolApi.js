// src/services/bolApi.js
import API_BASE from '../config/api';
import documentApi from './documentApi';

class BolAPI {
  async createBOL({ bookingId, bolNumber, bolData, htmlContent }) {
    try {
      console.log('Starting BOL creation for:', bolNumber);
      
      // Get the booking data to extract requestId/requestNumber
      const bookingKey = `booking_${bookingId}`;
      const bookingDataStr = localStorage.getItem(bookingKey);
      
      if (!bookingDataStr) {
        throw new Error('Booking data not found');
      }
      
      const bookingData = JSON.parse(bookingDataStr);
      
      // Use requestNumber (which should be REQ-xxxxx) instead of bookingId
      const requestId = bookingData.requestNumber || bookingData.requestId;
      
      if (!requestId) {
        throw new Error('Request ID not found in booking data');
      }
      
      console.log('Using Request ID for storage:', requestId);
      
      // First, try to generate and upload PDF to Cloudflare
      let fileUrl = null;
      let fileKey = null;

      // Check if html2pdf is loaded
      if (typeof window !== 'undefined' && window.html2pdf) {
        const bolElement = document.getElementById('bol-template');
        
        if (bolElement) {
          console.log('Generating PDF from HTML...');
          
          // Generate PDF from HTML with better options
          const opt = {
            margin: 0.5,
            filename: `BOL-${bolNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              logging: false
            },
            jsPDF: { 
              unit: 'in', 
              format: 'letter', 
              orientation: 'portrait' 
            }
          };

          try {
            const pdfBlob = await window.html2pdf()
              .set(opt)
              .from(bolElement)
              .outputPdf('blob');
              
            console.log('PDF generated successfully, size:', pdfBlob.size);
            
            // Validate PDF size
            if (pdfBlob.size < 1000) {
              throw new Error('Generated PDF is too small, might be corrupted');
            }
            
            // Create File object from blob
            const pdfFile = new File([pdfBlob], `BOL-${bolNumber}.pdf`, { 
              type: 'application/pdf' 
            });

            // Upload to Cloudflare R2 using requestId for consistent folder structure
            console.log('Uploading to Cloudflare with requestId:', requestId);
            const uploadResult = await documentApi.uploadDocument(
              pdfFile,
              requestId,  // Use requestId instead of bookingId
              'bol'       // Document type
            );

            console.log('✅ BOL uploaded to Cloudflare:', uploadResult);
            fileUrl = uploadResult.fileUrl;
            fileKey = uploadResult.key;
            
          } catch (pdfError) {
            console.error('❌ PDF generation failed:', pdfError);
            throw new Error(`PDF generation failed: ${pdfError.message}`);
          }
        } else {
          throw new Error('BOL template element not found');
        }
      } else {
        throw new Error('html2pdf library not loaded. Please ensure it is included in your HTML.');
      }

      // Save BOL metadata with proper structure
      const bolMetadata = {
        bolId: `BOL-${Date.now()}`,
        bookingId,
        requestId,  // Store requestId for reference
        bolNumber,
        fileUrl,
        fileKey,
        createdAt: new Date().toISOString(),
        documentType: 'bol'
      };

      // Store in localStorage as backup
      const bols = JSON.parse(localStorage.getItem('bols') || '[]');
      bols.push(bolMetadata);
      localStorage.setItem('bols', JSON.stringify(bols));
      
      // Also update the booking record
      bookingData.hasBOL = true;
      bookingData.bolNumber = bolNumber;
      bookingData.bolId = bolMetadata.bolId;
      bookingData.bolFileUrl = fileUrl;
      bookingData.bolFileKey = fileKey;
      bookingData.bolUpdatedAt = new Date().toISOString();
      localStorage.setItem(bookingKey, JSON.stringify(bookingData));
      
      // Update all bookings cache
      const allBookingsKey = 'all_bookings_cache';
      const allBookingsData = localStorage.getItem(allBookingsKey);
      if (allBookingsData) {
        const allBookings = JSON.parse(allBookingsData);
        const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);
        if (bookingIndex !== -1) {
          allBookings[bookingIndex] = {
            ...allBookings[bookingIndex],
            hasBOL: true,
            bolNumber,
            bolId: bolMetadata.bolId,
            bolFileUrl: fileUrl,
            bolFileKey: fileKey
          };
          localStorage.setItem(allBookingsKey, JSON.stringify(allBookings));
        }
      }

      console.log('✅ BOL saved with Cloudflare URL:', fileUrl);
      
      // Show success with proper file location
      alert(`BOL ${bolNumber} saved successfully!\n\nStored at: ${requestId}/bol/${pdfFile.name}\nView at: ${fileUrl}`);

      return {
        success: true,
        bolId: bolMetadata.bolId,
        bolNumber,
        fileUrl,
        fileKey,
        requestId,
        message: 'BOL created and uploaded to Cloudflare'
      };

    } catch (error) {
      console.error('❌ BOL creation failed:', error);
      
      // More detailed error message
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to create BOL:\n${errorMessage}\n\nPlease check the console for details.`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getBOLByBooking(bookingId) {
    try {
      // First check localStorage
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
            htmlContent: `
              <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <h3>Bill of Lading</h3>
                <p><strong>BOL Number:</strong> ${bol.bolNumber}</p>
                <p><strong>Created:</strong> ${new Date(bol.createdAt).toLocaleString()}</p>
                <p><strong>Storage Path:</strong> ${bol.requestId}/bol/</p>
                <p>
                  <a href="${bol.fileUrl}" 
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
      
      return { success: true, bol };
    } catch (error) {
      console.error('Error getting BOL:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllDocumentsByRequestId(requestId) {
    try {
      // This would call your backend to get all documents for a request
      const response = await fetch(`${API_BASE}/storage/documents/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const documents = await response.json();
      return { success: true, documents };
    } catch (error) {
      console.error('Error fetching documents:', error);
      
      // Fallback to localStorage for BOLs
      const bols = JSON.parse(localStorage.getItem('bols') || '[]');
      const requestBols = bols.filter(b => b.requestId === requestId);
      
      return { 
        success: true, 
        documents: requestBols,
        fromCache: true 
      };
    }
  }

  getToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default new BolAPI();
