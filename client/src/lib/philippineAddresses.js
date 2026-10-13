// Philippine Provinces, Municipalities, and Barangays Data
// Complete dataset from Philippine Statistics Authority

import philippineData from './philippineAddressesData.json';

// Get all provinces
export const getProvinces = () => {
  return Object.keys(philippineData).sort();
};

// Get municipalities by province
export const getMunicipalities = (province) => {
  if (!province || !philippineData[province]) return [];
  return Object.keys(philippineData[province]).sort();
};

// Get barangays by province and municipality
export const getBarangays = (province, municipality) => {
  if (!province || !municipality || !philippineData[province] || !philippineData[province][municipality]) return [];
  return philippineData[province][municipality].sort();
};
