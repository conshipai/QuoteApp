export const UNIT_TYPES = ['Pallets', 'Boxes', 'Crates', 'Skids', 'Barrels', 'Bundles', 'Rolls', 'Bags'];

export const FREIGHT_CLASSES = [
  '50', '55', '60', '65', '70', '77.5', '85', '92.5', 
  '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'
];

export const getDensityClass = (density) => {
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
  const weight = parseFloat(commodity.weight) || 0;
  const length = parseFloat(commodity.length) || 0;
  const width = parseFloat(commodity.width) || 0;
  const height = parseFloat(commodity.height) || 0;
  const quantity = parseInt(commodity.quantity) || 1;
  
  if (weight > 0 && length > 0 && width > 0 && height > 0) {
    const cubicFeet = (length * width * height * quantity) / 1728;
    const density = weight / cubicFeet;
    const calculatedClass = getDensityClass(density);
    
    return {
      density: density.toFixed(2),
      cubicFeet: cubicFeet.toFixed(2),
      calculatedClass
    };
  }
  
  return {
    density: null,
    cubicFeet: null,
    calculatedClass: ''
  };
};
