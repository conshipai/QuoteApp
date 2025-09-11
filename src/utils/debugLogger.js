// src/utils/debugLogger.js
const DEBUG = true; // Toggle this for production

export const logQuoteFlow = (stage, data) => {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  const color = {
    'REQUEST_CREATE': '#4CAF50',
    'REQUEST_RESPONSE': '#2196F3', 
    'QUOTE_FETCH': '#FF9800',
    'QUOTE_DISPLAY': '#9C27B0',
    'BOOKING_CREATE': '#F44336',
    'BOOKING_CONFIRM': '#00BCD4'
  }[stage] || '#757575';
  
  console.log(
    `%c[${timestamp}] ${stage}`,
    `color: ${color}; font-weight: bold;`,
    data
  );
  
  // Store in sessionStorage for review
  const flowLog = JSON.parse(sessionStorage.getItem('quoteFlowLog') || '[]');
  flowLog.push({ timestamp, stage, data });
  sessionStorage.setItem('quoteFlowLog', JSON.stringify(flowLog));
};

export const getFlowLog = () => {
  return JSON.parse(sessionStorage.getItem('quoteFlowLog') || '[]');
};

export const clearFlowLog = () => {
  sessionStorage.removeItem('quoteFlowLog');
};
