// Quick test script to verify schemes are in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

async function testSchemes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    // Get schemes collection
    const db = mongoose.connection.db;
    const schemesCollection = db.collection('schemes');
    
    const count = await schemesCollection.countDocuments();
    console.log(`\n📊 Total schemes in database: ${count}`);
    
    if (count > 0) {
      console.log('\n📋 First 3 schemes:');
      const schemes = await schemesCollection.find({}).limit(3).toArray();
      schemes.forEach((scheme, idx) => {
        console.log(`\n${idx + 1}. ${scheme.name || scheme._id}`);
        console.log(`   Level: ${scheme.level || 'N/A'}`);
        console.log(`   State: ${scheme.state || 'N/A'}`);
        console.log(`   Active: ${scheme.isActive}`);
      });
    } else {
      console.log('\n⚠️  No schemes found in database!');
      console.log('💡 Run the sync-service to populate schemes:');
      console.log('   cd sync-service && npm run sync');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

testSchemes();
