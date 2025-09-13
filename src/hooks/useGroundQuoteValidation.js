// src/hooks/useGroundValidation.js
export const useGroundValidation = () => {
  const validateForm = (formData, serviceType) => {
    const errors = [];
    
    // Move all your validation logic here from the big Ground.jsx
    if (!formData.originZip) errors.push('Origin ZIP required');
    if (!formData.originCity) errors.push('Origin city required');
    // ... all the rest of your validation
    
    return errors;
  };
  
  return { validateForm };
};
