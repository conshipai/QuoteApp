// src/hooks/useGroundQuoteValidation.js
export const useGroundQuoteValidation = () => {
  const validateForm = (formData, serviceType) => {
    const errors = [];
    
    // Move all your validation logic here from Ground.jsx
    if (!formData.originZip) errors.push('Origin ZIP required');
    // ... rest of validation
    
    return errors;
  };
  
  return { validateForm };
};
