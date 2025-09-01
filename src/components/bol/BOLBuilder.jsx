// In BOLBuilder.jsx, replace the generateBOL function with this simpler version:

const generateBOL = async () => {
  const err = validate();
  if (err) {
    alert('Please fix the following:\n' + err);
    return;
  }

  try {
    setGenerating(true);

    // Generate BOL number
    const bolNumber = `BOL-${Date.now().toString().slice(-8)}`;

    // Create PDF with just text (no html2canvas for now)
    const pdf = new jsPDF();
    
    // Add content as text
    pdf.setFontSize(20);
    pdf.text('BILL OF LADING', 105, 20, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(`BOL Number: ${bolNumber}`, 20, 40);
    pdf.text(`Confirmation: ${confirmationNumber}`, 20, 50);
    pdf.text(`Pickup: ${pickupNumber}`, 20, 60);
    pdf.text(`Carrier: ${carrier}`, 20, 70);
    
    // Shipper
    pdf.setFontSize(12);
    pdf.text('SHIPPER:', 20, 90);
    pdf.setFontSize(10);
    pdf.text(bolData.shipper?.name || '', 20, 100);
    pdf.text(bolData.shipper?.address || '', 20, 110);
    pdf.text(`${bolData.shipper?.city || ''}, ${bolData.shipper?.state || ''} ${bolData.shipper?.zip || ''}`, 20, 120);
    pdf.text(bolData.shipper?.phone || '', 20, 130);
    
    // Consignee
    pdf.setFontSize(12);
    pdf.text('CONSIGNEE:', 120, 90);
    pdf.setFontSize(10);
    pdf.text(bolData.consignee?.name || '', 120, 100);
    pdf.text(bolData.consignee?.address || '', 120, 110);
    pdf.text(`${bolData.consignee?.city || ''}, ${bolData.consignee?.state || ''} ${bolData.consignee?.zip || ''}`, 120, 120);
    pdf.text(bolData.consignee?.phone || '', 120, 130);
    
    // Items
    pdf.setFontSize(12);
    pdf.text('ITEMS:', 20, 150);
    pdf.setFontSize(10);
    
    let yPos = 160;
    bolData.items.forEach((item, i) => {
      pdf.text(`${i + 1}. Qty: ${item.quantity} ${item.unitType} - ${item.description} - ${item.weight} lbs`, 20, yPos);
      yPos += 10;
    });
    
    // Special Instructions
    pdf.text('Special Instructions:', 20, yPos + 10);
    pdf.text(bolData.specialInstructions || 'None', 20, yPos + 20);
    
    // Save PDF
    pdf.save(`${bolNumber}.pdf`);
    
    // Save to backend
    const response = await fetch(`${API_BASE}/bols`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId: booking.bookingId,
        bolData: {
          ...bolData,
          bolNumber,
          confirmationNumber,
          pickupNumber,
          carrier
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`BOL ${bolNumber} generated and saved!`);
      setSavedMeta({
        bolId: result.bol._id,
        bolNumber: result.bol.bolNumber
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('BOL generation error:', error);
    alert('Failed to generate BOL: ' + error.message);
  } finally {
    setGenerating(false);
  }
};
