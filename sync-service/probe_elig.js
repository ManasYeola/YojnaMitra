'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col = mongoose.connection.collection('schemes');

  const hasStructured = await col.countDocuments({ structured: { $exists: true } });
  console.log('Schemes with structured field:', hasStructured);

  const docs = await col.find({ isActive: true, eligibility_md: { $ne: '' } }).limit(6).toArray();
  for (const d of docs) {
    console.log('\n---', d.name);
    console.log('state:', d.state, '| level:', d.level);
    console.log('tags:', (d.tags || []).slice(0, 4));
    console.log('eligibility_md:\n', (d.eligibility_md || '').slice(0, 350));
  }
  mongoose.disconnect();
});
