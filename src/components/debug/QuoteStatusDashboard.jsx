// src/components/debug/QuoteStatusDashboard.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Eye } from 'lucide-react';
import { getFlowLog, clearFlowLog } from '../../utils/debugLogger';

const QuoteStatusDashboard = ({ isDarkMode }) => {
  const [quoteMap, setQuoteMap] = useState({});
  const [flowLog, setFlowLog] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load ID mappings
    const map = JSON.parse(localStorage.getItem('quote_id_map') || '{}');
    setQuoteMap(map);
    
    // Load flow log
    setFlowLog(getFlowLog());
  };

  const clearAll = () => {
    if (window.confirm('Clear all debug data?')) {
      localStorage.removeItem('quote_id_map');
      clearFlowLog();
      loadData();
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quote Debug Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={loadData}
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

        {/* Quote ID Mappings */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Active Quote IDs
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                  <th className="text-left p-2">Request ID</th>
                  <th className="text-left p-2">Request Number</th>
                  <th className="text-left p-2">Service Type</th>
                  <th className="text-left p-2">Route</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(quoteMap).map(([requestId, data]) => (
                  <tr key={requestId} className={`border-t ${
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
                    <td className="p-2">
                      <button
                        onClick={() => setSelectedQuote(requestId)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flow Log */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Flow Log (Last 50 events)
          </h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {flowLog.slice(-50).reverse().map((entry, idx) => (
              <div key={idx} className={`p-2 rounded text-xs font-mono ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex items-start justify-between">
                  <span className="font-bold">{entry.stage}</span>
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="mt-1 text-xs overflow-x-auto">
                  {JSON.stringify(entry.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteStatusDashboard;
