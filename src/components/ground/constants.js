export const UNIT_TYPES = ['Pallets', 'Boxes', 'Crates', 'Skids', 'Barrels', 'Bundles', 'Rolls', 'Bags'];

export const FREIGHT_CLASSES = [
  '50', '55', '60', '65', '70', '77.5', '85', '92.5', 
  '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'
];

export const getDensityClass = (density) => {
  // Freight class is determined by density (lbs per cubic foot)
  if (density >= 50) return '50';
  if (density >= 35) return '55';
  if (density >= 30) return '60';
  if (density >= 22.5) return '65';
  if (density >= 15) return '70';
  if (density >= 13.5) return '77.5';
  if (density >= 12) return '85';
  if (density >= 10.5) return '92.5';
  if (density >= 9) return '100';
  if (density >= 8) return '110';
  if (density >= 7) return '125';
  if (density >= 6) return '150';
  if (density >= 5) return '175';
  if (density >= 4) return '200';
  if (density >= 3) return '250';
  if (density >= 2) return '300';
  if (density >= 1) return '400';
  return '500';
};

export const calculateDensity = (commodity) => {
  // Parse values ensuring they're numbers
  const weight = parseFloat(commodity.weight) || 0;
  const length = parseFloat(commodity.length) || 0;
  const width = parseFloat(commodity.width) || 0;
  const height = parseFloat(commodity.height) || 0;
  const quantity = parseInt(commodity.quantity) || 1;
  
  // Only calculate if all dimensions and weight are provided
  if (weight > 0 && length > 0 && width > 0 && height > 0) {
    // Calculate cubic feet (dimensions in inches, convert to feet)
    const cubicFeet = (length * width * height * quantity) / 1728;
    
    // Calculate density (weight per cubic foot)
    const density = weight / cubicFeet;
    
    // Get the freight class based on density
    const calculatedClass = getDensityClass(density);
    
    return {
      density: density.toFixed(2),
      cubicFeet: cubicFeet.toFixed(2),
      calculatedClass
    };
  }
  
  // Return null values if calculation can't be performed
  return {
    density: null,
    cubicFeet: null,
    calculatedClass: ''
  };
};

// Unit conversion helpers
export const convertWeight = (value, fromUnit, toUnit) => {
  if (!value) return value;
  const val = parseFloat(value);
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return (val / 2.20462).toFixed(2);
  } else if (fromUnit === 'kg' && toUnit === 'lbs') {
    return (val * 2.20462).toFixed(2);
  }
  return value;
};

export const convertDimension = (value, fromUnit, toUnit) => {
  if (!value) return value;
  const val = parseFloat(value);
  
  if (fromUnit === 'inches' && toUnit === 'cm') {
    return (val * 2.54).toFixed(2);
  } else if (fromUnit === 'cm' && toUnit === 'inches') {
    return (val / 2.54).toFixed(2);
  }
  return value;
};
