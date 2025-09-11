// src/components/debug/QuoteStatusDashboard.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const QuoteStatusDashboard = ({ isDarkMode }) => {
  const [quoteMap, setQuoteMap] = useState({});
  const [flowLog, setFlowLog] = useState([]);
  const [allQuotes, setAllQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadQuotesFromBackend();
  }, []);

  const loadData = () => {
    // Load ID mappings from localStorage
    const map = JSON.parse(localStorage.getItem('quote_id_map') || '{}');
    setQuoteMap(map);
    
    // Load flow log from sessionStorage
    const log = JSON.parse(sessionStorage.getItem('quoteFlowLog') || '[]');
    setFlowLog(log);
  };

  const loadQuotesFromBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/debug/all-quotes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
    setLoading(false);
  };

  const verifyQuote = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/debug/verify/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Verification Result:\n${data.issues.join('\n')}`);
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all debug data?')) {
      localStorage.removeItem('quote_id_map');
      sessionStorage.removeItem('quoteFlowLog');
      loadData();
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Debug Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                loadData();
                loadQuotesFromBackend();
              }}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 rounded bg-red-500 text-white flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Backend Quotes */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Quotes from Backend
          </h2>
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Request Number</th>
                    <th className="text-left p-2">Request ID</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Route</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allQuotes.map((quote, idx) => (
                    <tr key={idx} className={`border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          quote.type === 'ground' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {quote.type}
                        </span>
                      </td>
                      <td className="p-2 font-bold">{quote.requestNumber}</td>
                      <td className="p-2 font-mono text-xs">{quote.requestId}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center gap-1 ${
                          quote.status === 'quoted' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {quote.status === 'quoted' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {quote.status}
                        </span>
                      </td>
                      <td className="p-2 text-xs">
                        {quote.origin} → {quote.destination}
                      </td>
                      <td className="p-2 text-xs">
                        {new Date(quote.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => verifyQuote(quote.requestId)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Verify data consistency"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allQuotes.length === 0 && (
                <div className="text-center py-4 text-gray-500">No quotes found</div>
              )}
            </div>
          )}
        </div>

        {/* Local Storage Quote Map */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Local Storage Quote Map
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left p-2">Request ID</th>
                  <th className="text-left p-2">Request Number</th>
                  <th className="text-left p-2">Service Type</th>
                  <th className="text-left p-2">Route</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(quoteMap).map(([requestId, data]) => (
                  <tr key={requestId} className={`border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <td className="p-2 font-mono text-xs">{requestId}</td>
                    <td className="p-2 font-bold">{data.requestNumber}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        data.serviceType === 'ltl' 
                          ? 'bg-blue-100 text-blue-700' 
                          : data.serviceType === 'ftl'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {data.serviceType?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 text-xs">
                      {data.origin} → {data.destination}
                    </td>
                    <td className="p-2 text-xs">
                      {new Date(data.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {Object.keys(quoteMap).length === 0 && (
              <div className="text-center py-4 text-gray-500">No local mappings found</div>
            )}
          </div>
        </div>

        {/* Flow Log */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Flow Log (Last 20 events)
          </h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {flowLog.slice(-20).reverse().map((entry, idx) => (
              <div key={idx} className={`p-2 rounded text-xs font-mono ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex items-start justify-between">
                  <span className="font-bold">{entry.stage}</span>
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(entry.data, null, 2)}
                </pre>
              </div>
            ))}
            {flowLog.length === 0 && (
              <div className="text-center py-4 text-gray-500">No flow events logged yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteStatusDashboard;
