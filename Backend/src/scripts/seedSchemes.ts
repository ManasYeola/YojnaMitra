import dotenv from 'dotenv';
import connectDB from '../config/database';
import Scheme from '../models/Scheme';

dotenv.config();

const schemes = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'subsidy',
    description: 'Direct income support of ₹6,000 per year to all farmer families in three equal installments.',
    benefits: [
      '₹2,000 per installment (3 times a year)',
      'Direct bank transfer',
      'No paperwork after registration',
      'Covers all landholding farmers'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large']
    },
    documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records'],
    applyUrl: 'https://pmkisan.gov.in',
    amount: '₹6,000/year',
    isActive: true,
  },
  {
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    category: 'insurance',
    description: 'Comprehensive crop insurance scheme covering pre-sowing to post-harvest losses.',
    benefits: [
      'Only 2% premium for Kharif crops',
      '1.5% premium for Rabi crops',
      'Covers natural calamities, pests, and diseases',
      'Quick settlement through technology'
    ],
    eligibility: {
      states: ['All States'],
      crops: ['wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'pulses'],
      farmerCategory: ['small', 'marginal', 'large']
    },
    documents: ['Aadhaar Card', 'Bank Account', 'Land Documents', 'Sowing Certificate'],
    applyUrl: 'https://pmfby.gov.in',
    amount: 'Premium: 1.5-2%',
    isActive: true,
  },
  {
    name: 'Kisan Credit Card (KCC)',
    category: 'loan',
    description: 'Short-term credit facility for farmers to meet agricultural expenses with low interest rates.',
    benefits: [
      'Credit limit up to ₹3 lakhs',
      '4% interest rate (with subsidy)',
      'No collateral for loans up to ₹1.6 lakhs',
      'Flexible repayment options'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large'],
      maxLandSize: 50
    },
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Passport Size Photo'],
    amount: 'Up to ₹3 Lakhs',
    isActive: true,
  },
  {
    name: 'Soil Health Card Scheme',
    category: 'subsidy',
    description: 'Free soil testing and nutrient recommendations to improve soil health and productivity.',
    benefits: [
      'Free soil testing',
      'Customized fertilizer recommendations',
      'Reduces input costs',
      'Improves crop yield'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large']
    },
    documents: ['Aadhaar Card', 'Land Records'],
    amount: 'Free Service',
    isActive: true,
  },
  {
    name: 'PM Kusum Yojana (Solar Pump)',
    category: 'equipment',
    description: 'Subsidy for installation of solar pumps and grid-connected solar power plants on farmland.',
    benefits: [
      '60% subsidy on solar pump cost',
      '30% loan facility',
      'Only 10% farmer contribution',
      'Reduced electricity bills'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large'],
      minLandSize: 1
    },
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Electricity Bill'],
    amount: '90% Subsidy+Loan',
    isActive: true,
  },
  {
    name: 'National Agriculture Market (e-NAM)',
    category: 'training',
    description: 'Online trading platform for agricultural commodities with transparent price discovery.',
    benefits: [
      'Better price realization',
      'Direct market access',
      'Transparent bidding system',
      'Pan-India market reach'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large']
    },
    documents: ['Aadhaar Card', 'Bank Account'],
    applyUrl: 'https://enam.gov.in',
    amount: 'Free Platform',
    isActive: true,
  },
  {
    name: 'NABARD Dairy Loan',
    category: 'loan',
    description: 'Financial assistance for setting up dairy farming and purchase of milch animals.',
    benefits: [
      'Loan up to ₹10 lakhs',
      'Low interest rates',
      '25% capital subsidy for SC/ST',
      'Includes working capital'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large']
    },
    documents: ['Aadhaar Card', 'Project Report', 'Bank Account', 'Land Documents'],
    amount: 'Up to ₹10 Lakhs',
    isActive: true,
  },
  {
    name: 'Paramparagat Krishi Vikas Yojana (Organic Farming)',
    category: 'subsidy',
    description: 'Financial support for organic farming practices and certification.',
    benefits: [
      '₹50,000 per hectare over 3 years',
      'Free organic farming training',
      'Assistance in organic certification',
      'Premium prices for organic produce'
    ],
    eligibility: {
      states: ['All States'],
      farmerCategory: ['small', 'marginal', 'large'],
      minLandSize: 0.5
    },
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account'],
    amount: '₹50,000/hectare',
    isActive: true,
  }
];

const seedSchemes = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding database with schemes...');

    // Clear existing schemes
    await Scheme.deleteMany({});
    console.log('✅ Cleared existing schemes');

    // Insert new schemes
    const createdSchemes = await Scheme.insertMany(schemes);
    console.log(`✅ Successfully seeded ${createdSchemes.length} schemes`);

    console.log('\n📊 Schemes by category:');
    const categories = ['insurance', 'subsidy', 'loan', 'training', 'equipment'];
    for (const category of categories) {
      const count = await Scheme.countDocuments({ category });
      console.log(`   - ${category}: ${count}`);
    }

    console.log('\n✨ Seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedSchemes();
