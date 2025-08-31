import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ValidationErrors = ({ errors, onDismiss, isDarkMode }) => {
  const errorList = Object.values(errors).filter(Boolean);
  
  if (errorList.length === 0) return null;
  
  return (
    <div className={`mb-6 border rounded-lg p-4 ${
      isDarkMode 
        ? 'bg-red-900/20 border-red-800 text-red-400' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            Please fix the following errors:
          </h3>
          <ul className="mt-2 text-sm list-disc pl-5">
            {errorList.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 p-1 rounded hover:bg-red-900/30 transition-colors`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ValidationErrors;
