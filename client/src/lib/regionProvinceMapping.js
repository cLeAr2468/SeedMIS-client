export const REGION_PROVINCE_MAPPING = {
  'Region I - Ilocos Region': [
    'ILOCOS NORTE',
    'ILOCOS SUR',
    'LA UNION',
    'PANGASINAN'
  ],
  'Region II - Cagayan Valley': [
    'BATANES',
    'CAGAYAN',
    'ISABELA',
    'NUEVA VIZCAYA',
    'QUIRINO'
  ],
  'Region III - Central Luzon': [
    'AURORA',
    'BATAAN',
    'BULACAN',
    'NUEVA ECIJA',
    'PAMPANGA',
    'TARLAC',
    'ZAMBALES'
  ],
  'Region IV-A - CALABARZON': [
    'BATANGAS',
    'CAVITE',
    'LAGUNA',
    'QUEZON',
    'RIZAL'
  ],
  'Region IV-B - MIMAROPA': [
    'MARINDUQUE',
    'OCCIDENTAL MINDORO',
    'ORIENTAL MINDORO',
    'PALAWAN',
    'ROMBLON'
  ],
  'Region V - Bicol Region': [
    'ALBAY',
    'CAMARINES NORTE',
    'CAMARINES SUR',
    'CATANDUANES',
    'MASBATE',
    'SORSOGON'
  ],
  'Region VI - Western Visayas': [
    'AKLAN',
    'ANTIQUE',
    'CAPIZ',
    'GUIMARAS',
    'ILOILO',
    'NEGROS OCCIDENTAL'
  ],
  'Region VII - Central Visayas': [
    'BOHOL',
    'CEBU',
    'NEGROS ORIENTAL',
    'SIQUIJOR'
  ],
  'Region VIII - Eastern Visayas': [
    'BILIRAN',
    'EASTERN SAMAR',
    'LEYTE',
    'NORTHERN SAMAR',
    'SAMAR (WESTERN SAMAR)',
    'SOUTHERN LEYTE'
  ],
  'Region IX - Zamboanga Peninsula': [
    'ZAMBOANGA DEL NORTE',
    'ZAMBOANGA DEL SUR',
    'ZAMBOANGA SIBUGAY'
  ],
  'Region X - Northern Mindanao': [
    'BUKIDNON',
    'CAMIGUIN',
    'LANAO DEL NORTE',
    'MISAMIS OCCIDENTAL',
    'MISAMIS ORIENTAL'
  ],
  'Region XI - Davao Region': [
    'DAVAO DE ORO',
    'DAVAO DEL NORTE',
    'DAVAO DEL SUR',
    'DAVAO OCCIDENTAL',
    'DAVAO ORIENTAL'
  ],
  'Region XII - SOCCSKSARGEN': [
    'COTABATO',
    'SARANGANI',
    'SOUTH COTABATO',
    'SULTAN KUDARAT'
  ],
  'Region XIII - Caraga': [
    'AGUSAN DEL NORTE',
    'AGUSAN DEL SUR',
    'DINAGAT ISLANDS',
    'SURIGAO DEL NORTE',
    'SURIGAO DEL SUR'
  ],
  'NCR - National Capital Region': [
    'METRO MANILA'
  ],
  'CAR - Cordillera Administrative Region': [
    'ABRA',
    'APAYAO',
    'BENGUET',
    'IFUGAO',
    'KALINGA',
    'MOUNTAIN PROVINCE'
  ],
  'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao': [
    'BASILAN',
    'LANAO DEL SUR',
    'MAGUINDANAO',
    'SULU',
    'TAWI-TAWI'
  ]
};

// Get provinces for a specific region
export const getProvincesForRegion = (region) => {
  return REGION_PROVINCE_MAPPING[region] || [];
};

// Get all regions
export const getAllRegions = () => {
  return Object.keys(REGION_PROVINCE_MAPPING);
};
