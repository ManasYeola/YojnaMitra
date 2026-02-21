'use strict';

/**
 * agricultureTags.js
 *
 * Master list of tags considered agriculture / farming related.
 * Derived from the full 827-scheme dataset (Agriculture,Rural & Environment bucket).
 *
 * Used by the filter script to mark non-agriculture schemes as isActive=false.
 * A scheme is considered agriculture-related if ANY of its tags appears here.
 *
 * Organised by sub-domain for readability — the exported Set is flat.
 */

// ── Crop Farming ───────────────────────────────────────────────────────────────
const CROP_FARMING = [
  'Agriculture',
  'Farming',
  'Farmer',
  'Farmers',
  'Famers',                       // typo variant found in data
  'Cultivator',
  'Cultivators',
  'Agricultural Activities',
  'Agriculture Activities',
  'Scientific Farming',
  'Dryland Agriculture',
  'Traditional Agriculture',
  'Intensive Farming',
  'Integrated Farming',
  'Integrated Agriculture',
  'Sustainable Agriculture',
  'Chemical-free Farming',
  'Pesticide-free Agriculture',
  'Organic Crop',
  'Contract Farming',
  'Area Expansion',
  'Area Expansion Farming',
  'Crop Diversification',
  'Crop Husbandary',              // typo variant found in data
  'Agro Ecology',
  'Low Cost Fartming',            // typo variant found in data
  'Farming Assistance',
  'Farming Infrastructure',
  'Farming Land',
  'Agricultural Land',
  'Agriculture Land Holder',
  'Farms',
  'Agricultural',             // adj. form — appears as standalone tag
  'Organic Farming',
  'Kisan',                    // Hindi: farmer
  'Khet',                     // Hindi: field/farm
  'Kheti',                    // Hindi: farming/cultivation
  'Krishi',                   // Hindi: agriculture
  'Fasal',                    // Hindi: crop
  'Khetibadi',                // Hindi: agriculture/farming
];

// ── Crops & Horticulture ───────────────────────────────────────────────────────
const CROPS = [
  'Rice',
  'Wheat',
  'Pulses',
  'Pulses Production',
  'Millets',
  'Millet',
  'Nutri Cereals',
  'Oilseeds',
  'Oilseed',
  'Oil Seeds',
  'Oilseed',
  'Groundnut',
  'Potato',
  'Sugarcane Farming',
  'Sugarcane Cultivation',
  'Sugarcane Farmer',
  'Cotton Seed',
  'Rubber',
  'Spice',
  'Spice Crop',
  'Spice Farming',
  'Spice Seeds',
  'Spice Seed',
  'Spices',
  'Cardamom',
  'Ginger',
  'Coriander',
  'Turmeric',
  'Black Pepper',
  'Cinnamon',
  'Arecanut',
  'Cashewnut',
  'Coconut',
  'Coconut Development',
  'Tea Plantation',
  'Tea Garden',
  'Tea Grower',
  'Tea Development',
  'Tea Industry',
  'Apple',
  'Apple Plantation',
  'Pineapple',
  'Papaya Cultivation',
  'Banana Development',
  'Strawberry Cultivation',
  'Dragon Fruit Farming',
  'Dragon Fruit Development',
  'Mango Development',
  'Fig Development',
  'Fruit Crop',
  'Fruit Crops',
  'Fruit Plants',
  'Fruit Production',
  'Fruit Cultivation',
  'Fruit Processing',
  'Fruit Preservation',
  'Orchard',
  'Horticulture',
  'Horticulture Development',
  'Horticultural Training',
  'Horticulture Training',
  'Horticultural Seedlings',
  'High Density Plantation',
  'Herbal',
  'Herbs',
  'Herbal Cultivation',
  'Herbal Research',
  'Herbal Products',
  'Medicinal Crops',
  'Medicinal Plant',
  'Aromatic Crops',
  'Aromatic Oil',
  'Cultivator Of Aromatic Plants',
  'Cultivator Of Medicinal Plants',
  'Herb Cultivator',
  'Ramie Crop',
  'Textile Crop',
  'Tapioca',
  'Colocasia',
  'Flower Farming',
  'Flower Planting Material',
  'Mushroom',
  'Mushroom Cultivation',
  'Mushroom Production',
  'Mushroom Development',
  'Mushroom Kit',
  'Bamboo Plantation',
  'Bamboo Marketing',
  'Oil Palm',
  'Oil Palm Mill',
  'Oil Palm Nursery Development',
  'Oil Palm Replanting',
  'Plantation Crop',
  'Plantation Assistance',
  'Commercial Plantation',
  'Vegetable Production',
  'Vegetable Farming',
  'Vegetables',
  'Vegetable Seeds',
  'Vegetable Seed',
  'Vegetable Crop',
  'Vegetable Crops',
  'Vegetable Grower',
  'Vegetable Processing',
  'Kitchen Garden',
  'Kitchen Gardening',
  'Tuber Crops',
  'Intercropping Assistance',
  'Silk Tree Plantation',
  'Makhana Development',
  'Makhana Seed Distribution',
  'Jhangora',
  'Mandua',
  'Local Crop',
  'Chillies',
  'Hybrid Chilli Production',
  'Tissue Culture Banana',
  'Pineapple',
  'Strawberry Development',
  'Papaya Development',
  'Lotus Fruit Farming',
  'Tree Plantation',
  'Afforestation',
  'Promote Afforestation',
  'Teak And Sal',
  'Forestry',
  'Planting Material',
  'Planting Materials',
  'Quality Planting Material',
  'Plug Nursery',
  'Seedlings',
  'Free Plants',
  'Distribution Of Saplings',
  'Coconut Saplings Distribution',
  'Seed Village',
  'Tea',                      // standalone — schemes like Tea Income Tax Holiday
  'Aromatic',                 // standalone aromatic crop schemes
  'Aromatic Plants',
  'Crop Production',
];

// ── Seeds ──────────────────────────────────────────────────────────────────────
const SEEDS = [
  'Seed Distribution',
  'Distribution Of Seeds',
  'Seed Production',
  'Production Of Seeds',
  'Seed Hub',
  'Seed Bank',
  'Foundation Seeds',
  'Hybrid Seeds',
  'Hybrid Seed',
  'Quality Seeds',
  'Seed Spices',
  'Seed Orchard Infrastructure',
  'Seed Nursery',
  'Seed Testing',
  'Seed Treatment',
  'Seed Replacement Rate',
  'Seed Multiplication',
  'Seed Garden',
  'Fodder Seed',
  'Sugarcane Seed Replacement',
  'Feed For Seed',
  'Minikits',
  'Improve Seed Quality',
  'Vegetable Seeds',
  'State Seed Development Corporation',
  'Spice Seeds',
  'Subsidy On Seed',
  'Seeds',                    // plural form used in several PMMSY/tribal schemes
  'Seed',                     // base form
  'Fertilizer',               // singular form
  'Adivasi Farmers',          // tribal farmer schemes
  'Field Demonstration',      // agri demonstration plots
];

// ── Soil, Water & Irrigation ───────────────────────────────────────────────────
const SOIL_WATER = [
  'Soil Health Card',
  'Soil Treatment',
  'Soil Testing Lab',
  'Soil Fertility',
  'Water Management',
  'Water Conservation',
  'Water Harvesting',
  'Water Storage Tank',
  'Water Tank',
  'Water Source',
  'Water Channels',
  'Water Distribution',
  'Irrigation',
  'Lift Irrigation',
  'Micro Irrigation',
  'Drip Sprinkler',
  'Drip Sanyantr',
  'Mini Sprinkler Sanyantr',
  'Sprinkler',
  'Solar Irrigation',
  'Solar Irrigation Pumps',
  'Groundwater Irrigation',
  'Irrigation System',
  'Co-operative Irrigation Societies',
  'Surface Irrigation',
  'Tubewell',
  'Tube Well',
  'Tubewell Installation',
  'Borewell',
  'Nalkoop',
  'Artesian Well',
  'Pump',
  'Pump Installation',
  'Pump Set',
  'Pump Connection',
  'Agricultural Pump',
  'Solar Water Pump',
  'Solar Pumpset',
  'Solar Pump',
  'Diesel Pumpset',
  'Tank Excavation',
  'Pond Construction',
  'New Ponds',
  'Construction Of Ponds',
  'Individual Farm Pond',
  'Watershed',
  'Rainfed',
  'Khet Talai',
  'Jal Hauj',
  'Water Carrying Pipeline',
  'Pipe Line',
  'Pipes',
  'Hume Pipes',
  'Plastic Mulching',
  'Plastic Tunnel',
  'Polythene Mulch Technology',
  'Poly Sheets',
  'Mulching',
];

// ── Fertilisers, Nutrients & Inputs ───────────────────────────────────────────
const FERTILISERS = [
  'Fertilizers',
  'Fertilizer Subsidies',
  'Nano Fertilizers',
  'Nano Fertilizer',
  'Organic Fertilizers',
  'Organic Manure',
  'Manure',
  'Bio Compost Sale',
  'Pasteurized Compost',
  'Vermicompost Unit',
  'Gypsum',
  'Rhizobium',
  'INM',
  'Agricultural Inputs',
  'Subsidy On Inputs',
  'Organic Input Subsidy',
  'Liquid Manure',
  'Balanced Ration',
  'Micro Nutrient Spray',
  'Castor Cake',
  'Free Distribution Of Inputs',
  'Input Kits',
];

// ── Pest & Disease Management ──────────────────────────────────────────────────
const PEST_MANAGEMENT = [
  'Plant Protection',
  'Plant Protection Pesticides',
  'Plant Protection Equipment',
  'Power Operated Plant Protection Equipment',
  'Pesticides',
  'Crop Protection Chemicals',
  'Bio-pesticide',
  'Bio-pesticides',
  'Bio Pesticide',
  'Bio Agent',
  'Bio-agents',
  'Integrated Pest Management',
  'IPM',
  'Trichogramma',
  'Trichoderma',
  'Nuclear Poly Hedrosis Virus',
  'NPV',
  'Pest Management',
];

// ── Farm Machinery & Equipment ─────────────────────────────────────────────────
const MACHINERY = [
  'Farm Machinery',
  'Farm Equipment',
  'Agricultural Equipment',
  'Agricultural Equipment Subsidy',
  'Agricultural Machinery',
  'Agriculture Machineries',
  'Heavy Farm Equipment',
  'Small Farm Implements',
  'Farm Tools',
  'Tractor',
  'Mini Tractor',
  'Power Tiller',
  'Harvesting Tool',
  'Harvesting Tools',
  'Harvester Group',
  'Custom Hiring Centres',
  'Machinery Bank',
  'Machinery Hub',
  'Drone Technology',
  'Drone',
  'Manually Operated Equipment',
  'SMAM',
  'Cutter',
  'Sanedo Equipment',
  'Rearing Equipment',
  'Tool Kit',
];

// ── Animal Husbandry & Dairy ───────────────────────────────────────────────────
const ANIMAL_HUSBANDRY = [
  'Animal Husbandry',
  'Animal Husbandry Loan',
  'Animal Husbandary',              // typo variant found in data
  'Livestock',
  'Livestock Farmer',
  'Livestock Rearing',
  'Livestock Farming',
  'Livestock Development',
  'Livestock Mission',
  'Livestock Unit',
  'Livestock Board',
  'Livestock Diseases',
  'Livestock Loss',
  'Liverstock',                     // typo variant found in data
  'Animal Farm',
  'Animal Feed',
  'Animal Insurance',
  'Animal Health',
  'Animal Welfare',
  'Animal Nutrition',
  'Animals Health Cover',
  'Cattle',
  'Cattle Farming',
  'Cattle Breeders',
  'Cattle Breeding',
  'Cattle And Buffalo Breeding',
  'Cattle Breed',
  'Cattle Feed Storage',
  'Cows',
  'Indigenous Cow',
  'Indigenous Cattle',
  'Stray Cattle',
  'Cow Rearing',
  'Cow Shelter',
  'Cow Protection',
  'Cattle Herders',
  'Cattle Rearer',
  'Cattle Farmers',
  'Cattle Shed',
  'Cattleshed',
  'Construction Of Cowshed',
  'Shelter For Cattle',
  'Loss Of Cattle',
  'Gausadan',
  'Dairy Farmer',
  'Dairy Unit',
  'Mini Dairy Unit',
  'Dairying',
  'Milch Animal',
  'Milk',
  'Milk Mission',
  'Milk Cooperatives',
  'Milk Procurement',
  'Buffaloes',
  'Heifers Of Cattle And Buffaloes',
  'Pregnant Cows Or Buffaloes',
  'Female Calf Breeding',
  'Pregnant Desi Indigenous Cows',
  'Murrah',
  'Genetic Improvement',
  'Artificial Insemination',
  'Sex-Sorted Semen',
  'Semen',
  'Reproductive Technology',
  'Low Genetic Animal',
  'Vaccination',
  'Veterinarian',
  'A-HELP',
  'A-Health Worker',
  'Pashu Sakhi',
  'Goat Rearing',
  'Goat Breeding',
  'Goat Farming Scheme',
  'Sheep Farming',
  'Sheep Breeders',
  'Distribution Of Sheep Units',
  'Subsidized Rams',
  'Pig',
  'Pig Farming',
  'Pig Farm',
  'Piggery',
  'Piggery Farming',
  'Male Pig',
  'Pig Germplasm',
  'Import Exotic Pig',
  'Boar',
  'Pork Production',
  'Rhode Island Red (RIR)',
  'Rhode Island Red',
  'Kadaknath',
  'Poultry Farming',
  'Poultry Training',
  'Poultry Valley',
  'Rural Poultry',
  'Backyard Poultry',
  'Broiler Birds',
  'Broiler Birds Unit',
  'Broiler Farms',
  'Bird',
  'Birds Unit',
  'Chicken',
  'Duck',
  'Brooder Cum Mother Unit',
  'Breed Multiplication Farms',
  'Fodder Seed',
  'Fodder Minikit',
  'Fodder Block Making',
  'Fodder Development',
  'Fodder Value Addition',
  'Silage',
  'Total Mixed Ration',
  'Animal Feed',
  'Affordable Feed',
  'Balanced Ration',
  'Animal',                   // base form — e.g. "Animal, Subsidy, Cow, Breed"
  'Cow',                      // base form
  'Goat',                     // base form
  'Sheep',                    // base form
  'Breed',                    // livestock breed improvement
  'Dairy Farming',
  'Fodder',
  'Chaff Cutter',             // fodder chopper subsidy schemes
  'Milk Production',
  'Pashupalan',               // Hindi: animal husbandry
  'Pashu',                    // Hindi: animal/livestock
  'Dugdh',                    // Hindi: milk
  'Gopalak',                  // Hindi: cow herder/rearer
  'Gauseva',                  // Hindi: cow service
  'Gausevak',                 // Hindi: cow worker
];

// ── Sericulture & Apiculture ───────────────────────────────────────────────────
const SERICULTURE_APICULTURE = [
  'Silkworm',
  'Silkworms',
  'Silkworm Rearing',
  'Bee',
  'Beekeeper',
  'Bee Boxes',
  'Bee Colonies',
  'Honey Bees',
  'Honey FPO',
];

// ── Fisheries & Aquaculture ────────────────────────────────────────────────────
const FISHERIES = [
  'Fish',
  'Fishermen',
  'Fisherman',
  'Fisheries',
  'Fishery',
  'Fishries',                       // typo variant found in data
  'Fish Seed Rearing',
  'Fish Seed Stocking',
  'Fish Seed Farm',
  'Fish Culture',
  'Fish Crop',
  'Fish Hatchery',
  'Fish Rearing Unit',
  'Fish Pond',
  'Fish Feed',
  'Fish Sale Equipments',
  'Fish Sales',
  'Fish Seller',
  'Fish Transport',
  'Fish Transportation',
  'Fish Quality',
  'Fish Exports',
  'Fishing Vessels',
  'Fishing Nets',
  'Fishery Machinery',
  'Fisheries Requisites',
  'Hatchery',
  'Hatcheries',
  'Rural Hatchery',
  'RAS',
  'Large RAS',
  'Small RAS',
  'Fingerling',
  'Prawn Seed',
  'Prawn Seed Stocking',
  'Shrimp Culture',
  'Shrimp Crop',
  'Shrimp Exports',
  'Ornamental Aquaculture',
  'Ornamental',
  'Backyard Ornamental Fish Rearing',
  'Biofloc Systems',
  'Bio-Floc',
  'Small Biofloc Establishment',
  'Large Biofloc Establishment',
  'Pond Cluster',
  'Pond Clusters',
  'Stocking',
  'Net',
  'Boat',
  'Boat Owner',
  'Boat Owners',
  'Boat Net',
  'Boat-net',
  'Ice Plant',
  'Ice Box',
  'Ice Boxes',
  'Construction Of Ice Plant',
  'Marine',
  'Coastal',
  'Traditional Fishermen',
  'Inland Fishing',
  'Fish Collection Cum Patrolling Boat',
  'Maschyajibi',
  'Support For Acquisition Of Deep Sea Fishing Vessels',
  'Upgradation Of Existing Fishing Vessels',
  'Cage',
  'Fish Cage Culture',
  'Fresh Water',
  'Brackish',
  'Mini Fish Feed Mill',
  'Fish Feed',
  'Tarpaulin',
  'PMMSY',
  'Fish Farmer',              // most common missed tag on fishery schemes
  'Fish Farmers',             // plural form
  'Fish Farming',             // activity form
  'Fish Production',
  'Aquaculture',              // broad aquaculture tag
  'Pond',                     // single pond schemes
  'Ponds',                    // plural form
  'Biofloc',                  // alternate spelling of Bio-Floc
  'Freshwater Hatcheries',
  'Recirculating Aquaculture System',
  'Cold Chain Infrastructure',// fish cold chain
  'Fish Preservation',
  'Nursery',                  // fish nursery / seed nursery context
  'Matsya',                   // Hindi: fish/fishery
  'Matsya Paalan',            // Hindi: fish farming
  'Maschyajibi',              // Bengali/Odia: fisherfolk (already present, kept for reference)
];

// ── Post-Harvest, Storage & Processing ────────────────────────────────────────
const POST_HARVEST = [
  'Post Harvest Management',
  'Post-harvest Management',
  'Post Harvest',
  'Post-harvest',
  'Post Harvesting Technology',
  'Post-Harvest',
  'Cold Storage',
  'Cold Storage Units',
  'Cold Rooms',
  'Cold Chain',
  'Modernization Of Cold Storage',
  'Godown',
  'Godown Construction',
  'Warehouse Godowns',
  'Farm Storage',
  'Storage Facilities',
  'Storage Infrastructure',
  'Crop Storage',
  'Pack Houses',
  'Pre-cooling Units',
  'Ripening Chambers',
  'Grading',
  'Food Processing Unit',
  'Agro Processing',
  'Processing Units',
  'Value Addition',
  'Value Addition In Crops',
  'Processed Food',
  'Agro Processing',
];

// ── Agricultural Market & Finance ─────────────────────────────────────────────
const AGRI_MARKET_FINANCE = [
  'Agricultural Market',
  'Agricultural Market Access',
  'Agricultural Malls',
  'E-Market',
  'Kisan Bazaar',
  'Market Development',
  'Market Committee',
  'Minimum Support Price',
  'Kisan Credit Card',
  'Crop Loan',
  'Agriculture And Rural Development Bank',
  'NABARD',
  'AIF',
  'RKVY',
  'Farmers Producer Organizations FPO',
  "Farmers Producer's Organization",
  'FFPO',
  'Sugar Co-operatives',
  'Export',
  'Export Infrastructure',
  'Export Promotion',
  'Fish Exports',
  'Shrimp Exports',
  'Pork Export',
  'Agriculture Marketing',
  'Agricultural Fair',
  'Agricultural Exhibition',
  'Farmer Camp',
  'Farmers Associations',
  'Farmers Group',
  'Farmers Interest Group',
  'SHG Farmers',
  'Farmers Children',
  'Kisan Award',
  'Kisan Ratna',
  'Kisan Shri',
  'Kisan Sahay',
  'PM KISAN TOP UP',
  'CM-KISAN',
  'KALIA',
  'Agro Service Providers',
  'APMC',                     // Agricultural Produce Market Committee
  'Cooperative Union',
  'Agriculture Subsidy',
  'Agricultural Marketing',
  'Market Committees',
  'Improve Economic Conditions', // agri income improvement schemes
  'Kisan Samman',             // Hindi: farmer honour/recognition
  'Kisan Suraksha',           // Hindi: farmer protection
  'Rashtriya Krishi',         // Hindi: national agriculture
];

// ── Crop Damage & Insurance ────────────────────────────────────────────────────
const CROP_DAMAGE_INSURANCE = [
  'Crop Damage',
  'Crop Damage Support',
  'Crop Losses',
  'Crop Loss',
  'Natural Calamity',
  'Natural Disaster',
  'Flood',
  'Hailstorms',
  'Wild Animal Attacks',
  'Weather Risk',
  'Damage Assistance',
  'Compensation For Crop Losses',
  'Insurance Coverage',
  'Animal Insurance',
  'Crop Assistance',
  'Insaurance',                     // typo variant found in data
  'Bima',
  'Natural Disaster Coverage',
  'Disaster Compensation',
  'Disaster Affected Woman',
  'Calamity',
  'Crops Damage',
];

// ── Hindi & Regional Language Agriculture Terms ────────────────────────────
// Tags that appear in MyScheme data using Hindi/regional-language words.
// Sourced from actual tag values found in the 827-scheme dataset.
const HINDI_REGIONAL = [
  // Farmers
  'Kisan',                    // farmer (most common — already added to CROP_FARMING,
                              //   kept here as reference; Set deduplicates)
  'Kisaan',                   // alternate spelling
  'Mahila Kisan',             // women farmer
  'Kisan Welfare',
  'Marginal Farmer',          // (already present in DB tags)
  'Small Farmer',
  'Dairy Farmer',
  'Tribal Farmers',
  'SHG Farmers',
  'Livestock Farmer',
  'Cattle Farmers',

  // Farming / Agriculture
  'Krishi',                   // agriculture (already in CROP_FARMING)
  'Kheti',                    // farming
  'Khetibadi',                // cultivation/farming
  'Fasal',                    // crop
  'Khet',                     // field
  'Bagwani',                  // horticulture
  'Baagwani',                 // alternate spelling
  'Bagicha',                  // orchard/garden

  // Livestock / Animal Husbandry
  'Pashupalan',               // animal husbandry
  'Pashu',                    // animal
  'Pashu Sakhi',              // already in ANIMAL_HUSBANDRY
  'Dugdh',                    // milk
  'Gopalak',                  // cow herder
  'Gauseva',                  // cow service
  'Gausevak',                 // cow worker
  'Gausadan',                 // cow shelter (already in ANIMAL_HUSBANDRY)
  'Murrah',                   // Murrah buffalo breed (already in ANIMAL_HUSBANDRY)

  // Water / Irrigation
  'Sinchai',                  // irrigation
  'Jal',                      // water (in farm context)
  'Khet Talai',               // farm pond (already in SOIL_WATER)
  'Nalkoop',                  // tubewell (already in SOIL_WATER)

  // Seeds / Inputs
  'Beej',                     // seed
  'Khaad',                    // fertilizer/manure
  'Khadya',                   // fodder/feed (livestock context)

  // Fish / Fisheries
  'Matsya',                   // fish/fishery
  'Matsya Paalan',            // fish farming
  'Machli',                   // fish
  'Maschyajibi',              // fisherfolk (already in FISHERIES)

  // Schemes commonly using Hindi scheme names (Kisan-prefixed)
  'CM-KISAN',                 // already in AGRI_MARKET_FINANCE
  'PM KISAN TOP UP',          // already in AGRI_MARKET_FINANCE
  'Kisan Credit Card',        // already in AGRI_MARKET_FINANCE
  'Kisan Award',              // already in AGRI_MARKET_FINANCE
  'Kisan Ratna',              // already in AGRI_MARKET_FINANCE
  'Kisan Shri',               // already in AGRI_MARKET_FINANCE
  'Kisan Sahay',              // already in AGRI_MARKET_FINANCE
  'KALIA',                    // Krushak Assistance for Livelihood & Income Augmentation
];

// ─────────────────────────────────────────────────────────────────────────────
//  Flat Set export — used for O(1) lookup in the filter script
// ─────────────────────────────────────────────────────────────────────────────
const ALL_AGRI_TAGS = new Set([
  ...CROP_FARMING,
  ...CROPS,
  ...SEEDS,
  ...SOIL_WATER,
  ...FERTILISERS,
  ...PEST_MANAGEMENT,
  ...MACHINERY,
  ...ANIMAL_HUSBANDRY,
  ...SERICULTURE_APICULTURE,
  ...FISHERIES,
  ...POST_HARVEST,
  ...AGRI_MARKET_FINANCE,
  ...CROP_DAMAGE_INSURANCE,
  ...HINDI_REGIONAL,
]);

module.exports = {
  ALL_AGRI_TAGS,
  // Sub-domain arrays exported for reference / future granular filtering
  CROP_FARMING,
  CROPS,
  SEEDS,
  SOIL_WATER,
  FERTILISERS,
  PEST_MANAGEMENT,
  MACHINERY,
  ANIMAL_HUSBANDRY,
  SERICULTURE_APICULTURE,
  FISHERIES,
  POST_HARVEST,
  AGRI_MARKET_FINANCE,
  CROP_DAMAGE_INSURANCE,
  HINDI_REGIONAL,
};
