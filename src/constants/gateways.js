export const GATEWAY_WAREHOUSES = [
  { 
    code: 'JFK', 
    name: 'JFK Gateway', 
    airport: 'JFK', 
    city: 'New York', 
    state: 'NY', 
    address: '123 Cargo Road, Jamaica, NY 11430' 
  },
  { 
    code: 'LAX', 
    name: 'LAX Gateway', 
    airport: 'LAX', 
    city: 'Los Angeles', 
    state: 'CA', 
    address: '456 World Way, Los Angeles, CA 90045' 
  },
  { 
    code: 'ORD', 
    name: 'ORD Gateway', 
    airport: 'ORD', 
    city: 'Chicago', 
    state: 'IL', 
    address: '789 Cargo Plaza, Chicago, IL 60666' 
  },
  { 
    code: 'MIA', 
    name: 'MIA Gateway', 
    airport: 'MIA', 
    city: 'Miami', 
    state: 'FL', 
    address: '321 Freight Ave, Miami, FL 33126' 
  },
  { 
    code: 'DFW', 
    name: 'DFW Gateway', 
    airport: 'DFW', 
    city: 'Dallas', 
    state: 'TX', 
    address: '654 Airport Blvd, DFW Airport, TX 75261' 
  }
];

export const getGatewayByCode = (code) => {
  return GATEWAY_WAREHOUSES.find(g => g.code === code);
};
