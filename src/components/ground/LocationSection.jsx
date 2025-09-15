Freight Forwarding - Ground Quote Fix Handoff
Date: January 2025
Issue: Switch to refactored Ground.jsx with reducer pattern
Current Status: API works, but import/export mismatch causing errors
🔴 The Error
TypeError: Cannot read properties of undefined (reading 'createGroundQuoteRequest')

Cause: quoteApi is undefined because of import/export mismatch
API Status: ✅ Working (tested with 200 response)

🛠️ Required Fixes (3 files only)
1️⃣ Fix src/services/quoteApi.js
Add this to the END of the file:
javascript// Add default export (keep existing code above)
const quoteApi = {
  createGroundQuote,
  createGroundQuoteRequest: createGroundQuote, // Alias for compatibility
  getGroundQuoteResults: async (requestId) => {
    const { data } = await axios.get(`/ground-quotes/results/${requestId}`);
    return data;
  }
};

export default quoteApi;
Also change line 2:
javascript// From:
import axios from 'axios';
// To:
const axios = window.shellAxios;  // Use authenticated axios from Shell
2️⃣ Fix src/reducers/groundQuoteReducer.js
Fix syntax error on line 12:
javascript// From (double colon):
pickupDate: : new Date(Date.now() + 86400000).toISOString().split('T')[0],
// To:
pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
3️⃣ Switch to refactored version in src/QuotesModule.jsx
Change line ~8:
javascript// From:
const Ground = lazy(() => import('./pages/customers/Ground'));
// To:
const Ground = lazy(() => import('./pages/Ground'));
✅ Testing Steps

Make the 3 changes above
Navigate to /app/quotes/ground
Select LTL service
Submit form with default values
Should see results without errors

📝 Why This Works

window.shellAxios already has authentication token
Shell's baseURL is https://api.gcc.conship.ai/api
The refactored Ground.jsx uses reducer pattern (cleaner)
API endpoint /ground-quotes/create is confirmed working

🚫 Do NOT

Don't change axios baseURL
Don't add /api prefix to routes (already in baseURL)
Don't modify the working customers/Ground.jsx until this works

🎯 Success Criteria

No console errors about createGroundQuoteRequest
Quote creates successfully
Results display for LTL
FTL/Expedited redirect to history


Quick Test in Console:
javascript// Verify setup after changes:
import('/src/services/quoteApi.js').then(m => 
  console.log('QuoteApi has:', Object.keys(m.default))
);
// Should show: ['createGroundQuote', 'createGroundQuoteRequest', 'getGroundQuoteResults']
