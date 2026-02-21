'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col = mongoose.connection.collection('schemes');

  // documents is an array of objects — check its shape first with one sample
  const sample = await col.findOne(
    { isActive: true, documents: { $exists: true, $not: { $size: 0 } } },
    { projection: { documents: 1, documentsRequired_md: 1 } }
  );
  console.log('--- Sample documents field ---');
  console.log(JSON.stringify(sample?.documents?.slice(0, 3), null, 2));
  console.log('\n--- Sample documentsRequired_md (first 300 chars) ---');
  console.log((sample?.documentsRequired_md || '').slice(0, 300));

  mongoose.disconnect();
});
