'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { ALL_AGRI_TAGS } = require('./src/config/agricultureTags');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const schemes = await mongoose.connection.collection('schemes')
    .find({ isActive: false }, { projection: { name: 1, tags: 1 } }).toArray();

  // Collect all unique tags from inactive schemes that are NOT in our list
  const missedTags = new Map();
  for (const s of schemes) {
    for (const tag of (s.tags || [])) {
      if (!ALL_AGRI_TAGS.has(tag)) {
        missedTags.set(tag, (missedTags.get(tag) || 0) + 1);
      }
    }
  }

  const sorted = [...missedTags.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nTags on INACTIVE schemes not in agricultureTags (${sorted.length} distinct):\n`);
  sorted.forEach(([tag, count]) => console.log(`  ${String(count).padStart(3)}  ${tag}`));

  mongoose.disconnect();
});
