const db = require('../database');
const COLORS = require('../config/seed-colors');

(async () => {
  const existing = await db.colors.find({});
  if (existing.length >= 100) {
    console.log(`Already have ${existing.length} colors. Skipping seed.`);
    process.exit(0);
  }
  console.log(`Seeding ${COLORS.length} colors...`);
  for (const c of COLORS) {
    const exists = await db.colors.findOne({ hex: c.hex });
    if (!exists) {
      await db.colors.create(c);
    }
  }
  const total = await db.colors.find({});
  console.log(`Done. Total colors: ${total.length}`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
