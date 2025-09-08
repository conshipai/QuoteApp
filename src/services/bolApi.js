// src/services/bolApi.js (inside class BolAPI)
async createBOL({ bookingId, bolNumber, bolData, htmlContent, bookingData }) {
  try {
    console.log('🔄 Starting BOL creation for:', bolNumber);

    // Prefer passed-in bookingData; fallback to localStorage if missing
    if (!bookingData) {
      const bookingKey = `booking_${bookingId}`;
      const bookingDataStr = localStorage.getItem(bookingKey);

      if (!bookingDataStr) {
        throw new Error('Booking data not found');
      }

      bookingData = JSON.parse(bookingDataStr);
    }

    // Use requestNumber (e.g., REQ-xxxxx) or requestId from provided/loaded bookingData
    const requestId = bookingData.requestNumber || bookingData.requestId;
    if (!requestId) {
      throw new Error('Request ID not found in booking data');
    }

    console.log('📋 Using Request ID for storage:', requestId);

    // Generate and upload PDF to S3/R2
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

      try {
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
      } catch (pdfError) {
        console.error('❌ PDF generation/upload failed:', pdfError);
        throw new Error(`PDF generation failed: ${pdfError.message}`);
      }
    } else {
      throw new Error('html2pdf library not loaded. Please ensure it is included in your HTML.');
    }

    // Save BOL metadata locally
    const bolMetadata = {
      bolId: `BOL-${Date.now()}`,
      bookingId,
      requestId,
      bolNumber,
      fileUrl,
      fileKey,
      createdAt: new Date().toISOString(),
      documentType: 'bol'
    };

    const bols = JSON.parse(localStorage.getItem('bols') || '[]');
    bols.push(bolMetadata);
    localStorage.setItem('bols', JSON.stringify(bols));

    // Update the booking record in cache (only if we have a bookingId to key off)
    if (bookingId) {
      const bookingKey = `booking_${bookingId}`;
      const updatedBooking = {
        ...(bookingData || {}),
        hasBOL: true,
        bolNumber,
        bolId: bolMetadata.bolId,
        bolFileUrl: fileUrl,
        bolFileKey: fileKey,
        bolUpdatedAt: new Date().toISOString()
      };
      localStorage.setItem(bookingKey, JSON.stringify(updatedBooking));

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
    }

    console.log('✅ BOL saved with URL:', fileUrl);
    alert(`BOL ${bolNumber} saved successfully!\n\nStored at: ${fileKey}\nView at: ${fileUrl}`);

    return {
      success: true,
      bolId: bolMetadata.bolId,
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
