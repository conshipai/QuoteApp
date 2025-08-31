// Add to quoteApi.js
async mockGetGroundQuoteResults(requestId) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const request = JSON.parse(localStorage.getItem(`quote_request_${requestId}`) || '{}');
  
  if (!request.requestId) {
    return { success: false, error: 'Request not found' };
  }
  
  // Ground-specific mock data
  if (!request.costFiles && request.status === 'PROCESSING') {
    setTimeout(() => {
      const groundQuotes = [
        {
          provider: 'STG',
          raw_cost: 485.50,
          fuel_surcharge: 48.55,
          transit_days: 3,
          markup_percentage: 18,
          final_price: 629.99,
          service_details: {
            carrier: 'STG Logistics',
            service: 'Standard LTL',
            guaranteed: false
          }
        },
        {
          provider: 'SEFL',
          raw_cost: 512.25,
          fuel_surcharge: 51.23,
          transit_days: 2,
          markup_percentage: 25,
          final_price: 704.35,
          service_details: {
            carrier: 'Southeastern Freight Lines',
            service: 'Priority LTL',
            guaranteed: true
          }
        }
      ];
      
      request.status = 'QUOTED';
      request.costFiles = groundQuotes;
      localStorage.setItem(`quote_request_${requestId}`, JSON.stringify(request));
    }, 3000);
  }
  
  return {
    success: true,
    status: request.status,
    costFiles: request.costFiles || [],
    requestNumber: request.requestNumber
  };
}
