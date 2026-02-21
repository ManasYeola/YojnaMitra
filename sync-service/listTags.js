'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const docs = await mongoose.connection.collection('schemes').aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log(`Total distinct tags: ${docs.length}\n`);
  docs.forEach(d => console.log(`${String(d.count).padStart(4)}  ${d._id}`));
  mongoose.disconnect();
});
