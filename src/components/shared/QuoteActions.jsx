import React from 'react';
import { Loader2 } from 'lucide-react';

const QuoteActions = ({ 
  onSubmit, 
  onCancel, 
  loading, 
  isDarkMode,
  submitLabel = 'Generate Quote',
  cancelLabel = 'Cancel'
}) => {
  return (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
        className={`px-6 py-2 border rounded-md font-medium transition-colors ${
          isDarkMode
            ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isDarkMode
              ? 'bg-conship-orange hover:bg-orange-600'
              : 'bg-conship-purple hover:bg-purple-800'
        }`}
      >
        {loading ? (
          <span className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
};

export default QuoteActions;
