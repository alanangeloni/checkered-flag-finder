
// Data models used in the car listing form

// Categories data
export const categories = [
  { id: '1', name: 'Open Wheel' },
  { id: '2', name: 'Prototype' },
  { id: '3', name: 'GT' },
  { id: '4', name: 'Stock Car' },
  { id: '5', name: 'Touring' },
  { id: '6', name: 'Rally' },
  { id: '7', name: 'Drift' },
  { id: '8', name: 'Drag' },
  { id: '9', name: 'Vintage and Classic' },
  { id: '10', name: 'Production' },
  { id: '11', name: 'Karts' },
];

// Subcategories by category
export const subcategoriesByCategory = {
  '1': [
    { id: '101', name: 'Formula 1' },
    { id: '102', name: 'Formula 2' },
    { id: '103', name: 'IndyCar' },
    { id: '104', name: 'Formula 3' },
    { id: '105', name: 'Formula E' },
  ],
  '2': [
    { id: '201', name: 'Hypercar' },
    { id: '202', name: 'LMP1' },
    { id: '203', name: 'LMP2' },
    { id: '204', name: 'LMP3' },
  ],
  '3': [
    { id: '301', name: 'GT1' },
    { id: '302', name: 'GT2' },
    { id: '303', name: 'GT3' },
    { id: '304', name: 'GT4' },
    { id: '305', name: 'GTE' },
  ],
  '4': [
    { id: '401', name: 'NASCAR Cup Series' },
    { id: '402', name: 'NASCAR Xfinity Series' },
    { id: '403', name: 'NASCAR Truck Series' },
    { id: '404', name: 'ARCA' },
  ],
  '5': [
    { id: '501', name: 'BTCC' },
    { id: '502', name: 'DTM' },
    { id: '503', name: 'WTCC' },
    { id: '504', name: 'TCR' },
    { id: '505', name: 'V8 Supercars' },
  ],
  '6': [
    { id: '601', name: 'WRC' },
    { id: '602', name: 'Rally Cross' },
    { id: '603', name: 'Rally Raid' },
    { id: '604', name: 'Historic Rally' },
  ],
  '7': [
    { id: '701', name: 'Formula Drift' },
    { id: '702', name: 'D1 Grand Prix' },
    { id: '703', name: 'Drift Masters European Championship' },
  ],
  '8': [
    { id: '801', name: 'Top Fuel' },
    { id: '802', name: 'Funny Car' },
    { id: '803', name: 'Pro Stock' },
    { id: '804', name: 'Pro Modified' },
  ],
  '9': [
    { id: '901', name: '1950s' },
    { id: '902', name: '1960s' },
    { id: '903', name: '1970s' },
    { id: '904', name: '1980s' },
    { id: '905', name: 'Pre-War' },
  ],
  '10': [
    { id: '1001', name: 'Production Sports Cars' },
    { id: '1002', name: 'Production Saloons' },
    { id: '1003', name: 'One-Make Series' },
  ],
  '11': [
    { id: '1101', name: 'Shifter Karts' },
    { id: '1102', name: 'Sprint Karts' },
    { id: '1103', name: 'Indoor Karts' },
    { id: '1104', name: 'Superkarts' },
  ],
};

// Race car types dropdown options
export const raceCarTypes = [
  'Formula 1',
  'Formula 2',
  'Formula 3',
  'IndyCar',
  'GT3',
  'GT4',
  'LMP1',
  'LMP2',
  'NASCAR',
  'Touring Car',
  'Rally Car',
  'Drift Car',
  'Drag Racer',
  'Vintage Racer',
  'Production Based',
  'Kart',
  'Other'
];
