/**
 * PORTUGAL ADDRESS HELPER - RealEstateCRM Pro
 * Portuguese districts, municipalities, and parishes data
 * Includes CTT postal code validation
 */

// Portuguese Districts
export const portugalDistricts = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu'
];

// Autonomous Regions
export const autonomousRegions = [
  'Açores',
  'Madeira'
];

// District to Municipalities mapping (principais concelhos)
export const districtMunicipalities = {
  'Lisboa': [
    'Amadora',
    'Cascais',
    'Lisboa',
    'Loures',
    'Mafra',
    'Odivelas',
    'Oeiras',
    'Sintra',
    'Vila Franca de Xira',
    'Alenquer',
    'Arruda dos Vinhos',
    'Azambuja',
    'Cadaval',
    'Lourinhã',
    'Sobral de Monte Agraço',
    'Torres Vedras'
  ],
  'Porto': [
    'Porto',
    'Matosinhos',
    'Vila Nova de Gaia',
    'Gondomar',
    'Maia',
    'Valongo',
    'Paredes',
    'Vila do Conde',
    'Póvoa de Varzim',
    'Santo Tirso',
    'Trofa',
    'Amarante',
    'Baião',
    'Felgueiras',
    'Lousada',
    'Marco de Canaveses',
    'Paços de Ferreira',
    'Penafiel'
  ],
  'Braga': [
    'Braga',
    'Barcelos',
    'Guimarães',
    'Vila Nova de Famalicão',
    'Vizela',
    'Esposende',
    'Vila Verde',
    'Amares',
    'Terras de Bouro',
    'Póvoa de Lanhoso',
    'Vieira do Minho',
    'Cabeceiras de Basto',
    'Celorico de Basto',
    'Fafe'
  ],
  'Setúbal': [
    'Almada',
    'Seixal',
    'Setúbal',
    'Barreiro',
    'Moita',
    'Montijo',
    'Palmela',
    'Sesimbra',
    'Alcochete',
    'Alcácer do Sal',
    'Grândola',
    'Santiago do Cacém',
    'Sines'
  ],
  'Faro': [
    'Faro',
    'Albufeira',
    'Portimão',
    'Loulé',
    'Olhão',
    'Tavira',
    'Lagos',
    'Vila Real de Santo António',
    'Silves',
    'Lagoa',
    'São Brás de Alportel',
    'Castro Marim',
    'Aljezur',
    'Monchique',
    'Vila do Bispo',
    'Alcoutim'
  ],
  'Coimbra': [
    'Coimbra',
    'Figueira da Foz',
    'Cantanhede',
    'Montemor-o-Velho',
    'Soure',
    'Condeixa-a-Nova',
    'Lousã',
    'Miranda do Corvo',
    'Penela',
    'Vila Nova de Poiares',
    'Arganil',
    'Góis',
    'Oliveira do Hospital',
    'Pampilhosa da Serra',
    'Penacova',
    'Tábua',
    'Mira'
  ],
  'Aveiro': [
    'Aveiro',
    'Águeda',
    'Albergaria-a-Velha',
    'Anadia',
    'Arouca',
    'Castelo de Paiva',
    'Espinho',
    'Estarreja',
    'Santa Maria da Feira',
    'Ílhavo',
    'Mealhada',
    'Murtosa',
    'Oliveira de Azeméis',
    'Oliveira do Bairro',
    'Ovar',
    'São João da Madeira',
    'Sever do Vouga',
    'Vagos',
    'Vale de Cambra'
  ],
  'Leiria': [
    'Leiria',
    'Marinha Grande',
    'Pombal',
    'Caldas da Rainha',
    'Alcobaça',
    'Batalha',
    'Nazaré',
    'Óbidos',
    'Peniche',
    'Porto de Mós',
    'Alvaiázere',
    'Ansião',
    'Bombarral',
    'Castanheira de Pera',
    'Figueiró dos Vinhos',
    'Pedrógão Grande'
  ],
  'Santarém': [
    'Santarém',
    'Abrantes',
    'Tomar',
    'Torres Novas',
    'Entroncamento',
    'Ourém',
    'Cartaxo',
    'Rio Maior',
    'Benavente',
    'Almeirim',
    'Alpiarça',
    'Chamusca',
    'Constância',
    'Coruche',
    'Ferreira do Zêzere',
    'Golegã',
    'Mação',
    'Salvaterra de Magos',
    'Sardoal',
    'Vila Nova da Barquinha'
  ],
  'Viseu': [
    'Viseu',
    'Lamego',
    'Mangualde',
    'Nelas',
    'São Pedro do Sul',
    'Tondela',
    'Castro Daire',
    'Cinfães',
    'Moimenta da Beira',
    'Mortágua',
    'Oliveira de Frades',
    'Penalva do Castelo',
    'Penedono',
    'Resende',
    'Santa Comba Dão',
    'Sátão',
    'Sernancelhe',
    'Tabuaço',
    'Tarouca',
    'Vila Nova de Paiva',
    'Vouzela',
    'Armamar',
    'Carregal do Sal'
  ],
  'Guarda': [
    'Guarda',
    'Seia',
    'Gouveia',
    'Aguiar da Beira',
    'Almeida',
    'Celorico da Beira',
    'Figueira de Castelo Rodrigo',
    'Fornos de Algodres',
    'Manteigas',
    'Mêda',
    'Pinhel',
    'Sabugal',
    'Trancoso',
    'Vila Nova de Foz Côa'
  ],
  'Castelo Branco': [
    'Castelo Branco',
    'Covilhã',
    'Fundão',
    'Belmonte',
    'Idanha-a-Nova',
    'Oleiros',
    'Penamacor',
    'Proença-a-Nova',
    'Sertã',
    'Vila de Rei',
    'Vila Velha de Ródão'
  ],
  'Portalegre': [
    'Portalegre',
    'Elvas',
    'Ponte de Sor',
    'Campo Maior',
    'Alter do Chão',
    'Arronches',
    'Avis',
    'Castelo de Vide',
    'Crato',
    'Fronteira',
    'Gavião',
    'Marvão',
    'Monforte',
    'Nisa',
    'Sousel'
  ],
  'Évora': [
    'Évora',
    'Montemor-o-Novo',
    'Estremoz',
    'Vendas Novas',
    'Reguengos de Monsaraz',
    'Arraiolos',
    'Borba',
    'Alandroal',
    'Mora',
    'Mourão',
    'Portel',
    'Redondo',
    'Viana do Alentejo',
    'Vila Viçosa'
  ],
  'Beja': [
    'Beja',
    'Moura',
    'Serpa',
    'Aljustrel',
    'Almodôvar',
    'Alvito',
    'Barrancos',
    'Castro Verde',
    'Cuba',
    'Ferreira do Alentejo',
    'Mértola',
    'Odemira',
    'Ourique',
    'Vidigueira'
  ],
  'Viana do Castelo': [
    'Viana do Castelo',
    'Ponte de Lima',
    'Arcos de Valdevez',
    'Caminha',
    'Melgaço',
    'Monção',
    'Paredes de Coura',
    'Ponte da Barca',
    'Valença',
    'Vila Nova de Cerveira'
  ],
  'Vila Real': [
    'Vila Real',
    'Chaves',
    'Peso da Régua',
    'Valpaços',
    'Alijó',
    'Boticas',
    'Mesão Frio',
    'Mondim de Basto',
    'Montalegre',
    'Murça',
    'Ribeira de Pena',
    'Sabrosa',
    'Santa Marta de Penaguião',
    'Vila Pouca de Aguiar'
  ],
  'Bragança': [
    'Bragança',
    'Mirandela',
    'Macedo de Cavaleiros',
    'Alfândega da Fé',
    'Carrazeda de Ansiães',
    'Freixo de Espada à Cinta',
    'Miranda do Douro',
    'Mogadouro',
    'Torre de Moncorvo',
    'Vila Flor',
    'Vimioso',
    'Vinhais'
  ]
};

// Lisboa Freguesias (parishes) - principais
export const lisboaFreguesias = [
  'Ajuda',
  'Alcântara',
  'Alvalade',
  'Areeiro',
  'Arroios',
  'Avenidas Novas',
  'Beato',
  'Belém',
  'Benfica',
  'Campo de Ourique',
  'Campolide',
  'Carnide',
  'Estrela',
  'Lumiar',
  'Marvila',
  'Misericórdia',
  'Olivais',
  'Parque das Nações',
  'Penha de França',
  'Santa Clara',
  'Santa Maria Maior',
  'Santo António',
  'São Domingos de Benfica',
  'São Vicente'
];

// Porto Freguesias (parishes) - principais
export const portoFreguesias = [
  'Aldoar, Foz do Douro e Nevogilde',
  'Bonfim',
  'Campanhã',
  'Cedofeita, Santo Ildefonso, Sé, Miragaia, São Nicolau e Vitória',
  'Lordelo do Ouro e Massarelos',
  'Paranhos',
  'Ramalde',
  'União das Freguesias do Centro Histórico'
];

/**
 * Get municipalities for a district
 */
export function getMunicipalities(district) {
  return districtMunicipalities[district] || [];
}

/**
 * Get freguesias for major cities
 */
export function getFreguesias(city) {
  switch (city.toLowerCase()) {
    case 'lisboa':
      return lisboaFreguesias;
    case 'porto':
      return portoFreguesias;
    default:
      return [];
  }
}

/**
 * Postal code ranges by district
 */
export const postalCodeRanges = {
  'Lisboa': { min: 1000, max: 2999 },
  'Porto': { min: 4000, max: 4999 },
  'Braga': { min: 4700, max: 4999 },
  'Coimbra': { min: 3000, max: 3999 },
  'Setúbal': { min: 2800, max: 2999 },
  'Faro': { min: 8000, max: 8999 },
  'Aveiro': { min: 3700, max: 3999 },
  'Leiria': { min: 2400, max: 2599 },
  'Santarém': { min: 2000, max: 2399 },
  'Viseu': { min: 3500, max: 3699 },
  'Guarda': { min: 6200, max: 6499 },
  'Castelo Branco': { min: 6000, max: 6299 },
  'Portalegre': { min: 7300, max: 7599 },
  'Évora': { min: 7000, max: 7299 },
  'Beja': { min: 7700, max: 7999 },
  'Viana do Castelo': { min: 4900, max: 4999 },
  'Vila Real': { min: 5000, max: 5499 },
  'Bragança': { min: 5300, max: 5399 }
};

/**
 * Get district from postal code
 */
export function getDistrictFromPostalCode(postalCode) {
  if (!postalCode || postalCode.length < 4) return null;
  
  const code = parseInt(postalCode.substring(0, 4));
  
  for (const [district, range] of Object.entries(postalCodeRanges)) {
    if (code >= range.min && code <= range.max) {
      return district;
    }
  }
  
  return null;
}

/**
 * Format address for display
 */
export function formatAddress(address) {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) {
    parts.push(address.street);
    if (address.number) parts[parts.length - 1] += `, ${address.number}`;
    if (address.floor) parts[parts.length - 1] += `, ${address.floor}`;
    if (address.side) parts[parts.length - 1] += ` ${address.side}`;
  }
  
  const cityLine = [];
  if (address.postalCode) cityLine.push(address.postalCode);
  if (address.city) cityLine.push(address.city);
  if (cityLine.length > 0) parts.push(cityLine.join(' '));
  
  if (address.parish) parts.push(address.parish);
  if (address.municipality && address.municipality !== address.city) {
    parts.push(address.municipality);
  }
  if (address.district) parts.push(address.district);
  if (address.country && address.country !== 'Portugal') {
    parts.push(address.country);
  }
  
  return parts.join(', ');
}

/**
 * Validate Portuguese address
 */
export function validateAddress(address) {
  const errors = [];
  
  if (!address.street) {
    errors.push('Street is required');
  }
  
  if (!address.city) {
    errors.push('City is required');
  }
  
  if (address.postalCode && !/^\d{4}-\d{3}$/.test(address.postalCode)) {
    errors.push('Invalid postal code format (XXXX-XXX)');
  }
  
  if (address.district && !portugalDistricts.includes(address.district)) {
    errors.push('Invalid district');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * CTT API integration (placeholder - requires API key)
 */
export async function searchCTTAddress(postalCode) {
  // This would integrate with CTT API
  // For now, return mock data
  
  if (!postalCode || !/^\d{4}-\d{3}$/.test(postalCode)) {
    throw new Error('Invalid postal code format');
  }
  
  // Mock response
  const district = getDistrictFromPostalCode(postalCode);
  
  return {
    postalCode,
    district,
    municipality: district ? getMunicipalities(district)[0] : null,
    city: district,
    // In real implementation, this would come from CTT API
    streets: [
      'Rua Principal',
      'Avenida Central',
      'Praça da República'
    ]
  };
}

/**
 * Geographic regions of Portugal
 */
export const regions = {
  'Norte': ['Porto', 'Braga', 'Viana do Castelo', 'Vila Real', 'Bragança'],
  'Centro': ['Aveiro', 'Viseu', 'Guarda', 'Coimbra', 'Castelo Branco', 'Leiria'],
  'Lisboa e Vale do Tejo': ['Lisboa', 'Santarém', 'Setúbal'],
  'Alentejo': ['Portalegre', 'Évora', 'Beja'],
  'Algarve': ['Faro'],
  'Açores': ['Açores'],
  'Madeira': ['Madeira']
};

/**
 * Get region from district
 */
export function getRegionFromDistrict(district) {
  for (const [region, districts] of Object.entries(regions)) {
    if (districts.includes(district)) {
      return region;
    }
  }
  return null;
}

/**
 * Common street types in Portugal
 */
export const streetTypes = [
  'Rua',
  'Avenida',
  'Praça',
  'Travessa',
  'Largo',
  'Alameda',
  'Estrada',
  'Calçada',
  'Beco',
  'Jardim',
  'Rotunda',
  'Via',
  'Pátio',
  'Quelha',
  'Escadas',
  'Caminho'
];

/**
 * Format phone number to Portuguese format
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Portuguese mobile
  if (digits.length === 9 && (digits[0] === '9' || digits[0] === '2')) {
    return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
  }
  
  // With country code
  if (digits.length === 12 && digits.substring(0, 3) === '351') {
    const number = digits.substring(3);
    return `+351 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }
  
  return phone;
}

/**
 * Property price ranges by district (EUR)
 */
export const averagePropertyPrices = {
  'Lisboa': { min: 250000, avg: 450000, max: 2000000 },
  'Porto': { min: 180000, avg: 320000, max: 1500000 },
  'Faro': { min: 200000, avg: 380000, max: 1800000 },
  'Cascais': { min: 350000, avg: 650000, max: 3000000 },
  'Braga': { min: 120000, avg: 220000, max: 600000 },
  'Coimbra': { min: 100000, avg: 180000, max: 500000 },
  'Aveiro': { min: 130000, avg: 240000, max: 700000 },
  'Setúbal': { min: 140000, avg: 260000, max: 800000 },
  'Leiria': { min: 110000, avg: 200000, max: 550000 },
  'Viseu': { min: 90000, avg: 160000, max: 450000 },
  'Évora': { min: 100000, avg: 190000, max: 600000 },
  'Beja': { min: 60000, avg: 120000, max: 350000 },
  'Guarda': { min: 50000, avg: 100000, max: 300000 },
  'Bragança': { min: 40000, avg: 85000, max: 250000 }
};