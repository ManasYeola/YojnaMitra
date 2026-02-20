'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const docs = await mongoose.connection.collection('schemes').aggregate([
    { $unwind: '$category' },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  docs.forEach(d => console.log(d.count, JSON.stringify(d._id)));
  mongoose.disconnect();
});
