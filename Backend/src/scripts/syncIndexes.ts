import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const syncIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Dropping existing indexes...');
    await User.collection.dropIndexes();
    console.log('✅ Dropped all indexes');

    console.log('🔧 Creating new indexes from schema...');
    await User.syncIndexes();
    console.log('✅ Indexes synced successfully');

    console.log('📋 Current indexes:');
    const indexes = await User.collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing indexes:', error);
    process.exit(1);
  }
};

syncIndexes();
