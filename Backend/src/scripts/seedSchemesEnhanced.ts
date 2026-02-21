/**
 * Enhanced Scheme Seeding Script
 * Seeds schemes with comprehensive eligibility criteria matching the new 8-question flow
 */

import mongoose from 'mongoose';
import Scheme from '../models/Scheme';
import dotenv from 'dotenv';

dotenv.config();

const enhancedSchemes = [
  // 1. PM-KISAN (Universal for farmers)
  {
    name: 'PM-KISAN Direct Benefit Scheme',
    category: 'subsidy',
    description: 'Income support of ₹6,000 per year to all farmer families.',
    benefits: [
      '₹6,000 per year in 3 equal installments',
      'Direct bank transfer',
      'No requirement of land size',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer', 'dairy_farmer'],
      landOwnership: ['owned', 'leased'],
      ageRange: ['all'],
      casteCategory: ['all'],
      incomeRange: ['all'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'land_record', 'bank_account'],
    applyUrl: 'https://pmkisan.gov.in',
    amount: '₹6,000/year',
    isActive: true,
  },

  // 2. PMFBY - Crop Insurance
  {
    name: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'insurance',
    description: 'Comprehensive crop insurance scheme protecting farmers against crop loss.',
    benefits: [
      'Coverage against natural disasters',
      'Low premium (1.5% - 2% of sum insured)',
      'Quick claim settlement',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer'],
      landOwnership: ['owned', 'leased'],
      ageRange: ['all'],
      casteCategory: ['all'],
      incomeRange: ['all'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'land_record', 'bank_account'],
    applyUrl: 'https://pmfby.gov.in',
    amount: '1.5-2% premium',
    isActive: true,
  },

  // 3. Youth-focused modern farming scheme
  {
    name: 'Agri-Entrepreneurship Development Scheme',
    category: 'training',
    description: 'Training and mentorship for young farmers to start agri-businesses.',
    benefits: [
      'Free 6-month entrepreneurship training',
      'Mentorship from industry experts',
      'Seed funding support up to ₹5 lakhs',
    ],
    eligibility: {
      states: ['Maharashtra', 'Karnataka', 'Gujarat', 'Punjab'],
      occupationType: ['agri_entrepreneur', 'crop_farmer'],
      landOwnership: ['all'],
      ageRange: ['18_40'],
      casteCategory: ['all'],
      incomeRange: ['below_1l', '1l_3l', '3l_8l'],
      bplCard: 'not_required',
      specialCategories: ['youth', 'all'],
    },
    documents: ['aadhaar', 'bank_account', 'education_certificate'],
    applyUrl: 'https://agriudaan.gov.in',
    amount: 'Training + ₹5L seed money',
    isActive: true,
  },

  // 4. Woman farmer scheme
  {
    name: 'Mahila Kisan Sashaktikaran Pariyojana',
    category: 'subsidy',
    description: 'Empowerment scheme for women farmers with equipment subsidy.',
    benefits: [
      '80% subsidy on farming equipment',
      'Free skill development training',
      'Priority in loan applications',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer', 'dairy_farmer'],
      landOwnership: ['owned', 'leased', 'landless'],
      ageRange: ['18_40', '41_60'],
      casteCategory: ['all'],
      incomeRange: ['below_1l', '1l_3l', '3l_8l'],
      bplCard: 'not_required',
      specialCategories: ['woman'],
    },
    documents: ['aadhaar', 'bank_account'],
    applyUrl: 'https://mksp.gov.in',
    amount: '80% equipment subsidy',
    isActive: true,
  },

  // 5. SC/ST specific scheme
  {
    name: 'National Scheduled Caste/ST Finance & Development Corporation Scheme',
    category: 'loan',
    description: 'Concessional loans for SC/ST farmers for agriculture development.',
    benefits: [
      'Loans up to ₹10 lakhs at 4% interest',
      'No collateral for loans up to ₹5 lakhs',
      '3 years moratorium period',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer', 'dairy_farmer', 'agri_entrepreneur'],
      landOwnership: ['all'],
      ageRange: ['18_40', '41_60'],
      casteCategory: ['sc', 'st'],
      incomeRange: ['below_1l', '1l_3l', '3l_8l'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'caste_certificate', 'bank_account', 'income_certificate'],
    applyUrl: 'https://nsfdc.nic.in',
    amount: 'Loans up to ₹10L at 4%',
    isActive: true,
  },

  // 6. BPL-specific scheme
  {
    name: 'National Food Security Mission (BPL Priority)',
    category: 'subsidy',
    description: 'Free seeds, fertilizers, and equipment for BPL farmers.',
    benefits: [
      'Free quality seeds',
      'Subsidized fertilizers (90% off)',
      'Free soil health card',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer'],
      landOwnership: ['owned', 'leased', 'landless'],
      ageRange: ['all'],
      casteCategory: ['all'],
      incomeRange: ['below_1l'],
      bplCard: 'required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'bpl_card', 'bank_account'],
    applyUrl: 'https://nfsm.gov.in',
    amount: 'Free seeds + 90% fertilizer subsidy',
    isActive: true,
  },

  // 7. PWD-specific scheme
  {
    name: 'Disabled Farmer Support Scheme',
    category: 'equipment',
    description: 'Special assistive equipment and financial support for farmers with disabilities.',
    benefits: [
      '100% subsidy on assistive farming equipment',
      'Monthly pension of ₹2,000',
      'Free health insurance',
    ],
    eligibility: {
      states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala'],
      occupationType: ['crop_farmer', 'dairy_farmer'],
      landOwnership: ['all'],
      ageRange: ['18_40', '41_60'],
      casteCategory: ['all'],
      incomeRange: ['below_1l', '1l_3l', '3l_8l'],
      bplCard: 'not_required',
      specialCategories: ['pwd'],
    },
    documents: ['aadhaar', 'disability_certificate', 'bank_account'],
    applyUrl: 'https://socialjustice.gov.in',
    amount: '₹2,000/month + equipment',
    isActive: true,
  },

  // 8. Landless labourers scheme
  {
    name: 'Agricultural Labourer Welfare Scheme',
    category: 'subsidy',
    description: 'Financial assistance and skill training for landless agricultural workers.',
    benefits: [
      'Monthly assistance of ₹1,500',
      'Free vocational training',
      'Health insurance coverage',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['agri_labourer'],
      landOwnership: ['landless'],
      ageRange: ['all'],
      casteCategory: ['all'],
      incomeRange: ['below_1l', '1l_3l'],
      bplCard: 'preferred',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'labourer_card', 'bank_account'],
    applyUrl: 'https://labour.gov.in',
    amount: '₹1,500/month',
    isActive: true,
  },

  // 9. Fisherman-specific scheme
  {
    name: 'Pradhan Mantri Matsya Sampada Yojana',
    category: 'loan',
    description: 'Subsidized loans and equipment for fishermen and fish farmers.',
    benefits: [
      'Loans up to ₹20 lakhs at subsidized rates',
      '25% back-ended subsidy',
      'Free fishing equipment',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['fisherman'],
      landOwnership: ['all'],
      ageRange: ['all'],
      casteCategory: ['all'],
      incomeRange: ['all'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'fisherman_id', 'bank_account'],
    applyUrl: 'https://pmmsy.dof.gov.in',
    amount: 'Loans up to ₹20L + 25% subsidy',
    isActive: true,
  },

  // 10. Senior citizen farmer pension
  {
    name: 'Kisan Pension Yojana',
    category: 'subsidy',
    description: 'Monthly pension for senior farmers above 60 years.',
    benefits: [
      'Monthly pension of ₹3,000',
      'One-time assistance of ₹50,000',
      'Free health checkup',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer', 'dairy_farmer'],
      landOwnership: ['owned', 'leased'],
      ageRange: ['above_60'],
      casteCategory: ['all'],
      incomeRange: ['below_1l', '1l_3l'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'age_proof', 'bank_account'],
    applyUrl: 'https://maandhan.in',
    amount: '₹3,000/month',
    isActive: true,
  },

  // 11. Dairy farmer-specific scheme
  {
    name: 'National Dairy Development Programme',
    category: 'loan',
    description: 'Subsidized loans for dairy farming and milk production enhancement.',
    benefits: [
      'Loans up to ₹15 lakhs at 6% interest',
      'Subsidy on cattle purchase',
      'Free veterinary services',
    ],
    eligibility: {
      states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Rajasthan'],
      occupationType: ['dairy_farmer'],
      landOwnership: ['all'],
      ageRange: ['all'],
      casteCategory: ['all'],
      incomeRange: ['all'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'land_record', 'bank_account'],
    applyUrl: 'https://nddb.coop',
    amount: 'Loans up to ₹15L at 6%',
    isActive: true,
  },

  // 12. OBC-specific scheme
  {
    name: 'Other Backward Classes Farmer Development Scheme',
    category: 'subsidy',
    description: 'Equipment subsidy and training for OBC farmers.',
    benefits: [
      '60% subsidy on equipment',
      'Free training programs',
      'Preferential loan processing',
    ],
    eligibility: {
      states: ['All States'],
      occupationType: ['crop_farmer', 'dairy_farmer', 'agri_entrepreneur'],
      landOwnership: ['all'],
      ageRange: ['all'],
      casteCategory: ['obc'],
      incomeRange: ['below_1l', '1l_3l', '3l_8l'],
      bplCard: 'not_required',
      specialCategories: ['all'],
    },
    documents: ['aadhaar', 'obc_certificate', 'bank_account'],
    applyUrl: 'https://socialjustice.gov.in',
    amount: '60% equipment subsidy',
    isActive: true,
  },
];

async function seedEnhancedSchemes() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/yojnamitra';
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB');

    // Clear existing schemes
    await Scheme.deleteMany({});
    console.log('🗑️  Cleared existing schemes');

    // Insert new enhanced schemes
    await Scheme.insertMany(enhancedSchemes);
    console.log(`✅ Inserted ${enhancedSchemes.length} enhanced schemes`);

    // Display summary
    console.log('\n📊 Scheme Categories:');
    const categories = enhancedSchemes.reduce((acc: any, scheme) => {
      acc[scheme.category] = (acc[scheme.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedEnhancedSchemes();
