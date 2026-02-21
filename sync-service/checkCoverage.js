'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const total      = await mongoose.connection.collection('schemes').countDocuments();
  const withTags   = await mongoose.connection.collection('schemes').countDocuments({ tags: { $exists: true, $not: { $size: 0 } } });
  const withCats   = await mongoose.connection.collection('schemes').countDocuments({ category: { $exists: true, $not: { $size: 0 } } });

  // distinct category values
  const cats = await mongoose.connection.collection('schemes').aggregate([
    { $unwind: '$category' },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  console.log(`Total schemes   : ${total}`);
  console.log(`With tags       : ${withTags} (${((withTags/total)*100).toFixed(1)}%)`);
  console.log(`With categories : ${withCats} (${((withCats/total)*100).toFixed(1)}%)`);
  console.log(`\nDistinct categories:`);
  cats.forEach(d => console.log(`  ${String(d.count).padStart(4)}  ${d._id}`));

  mongoose.disconnect();
});
