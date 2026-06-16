const db = require('../database');
const { seedData } = require('./seed-data');

const connectDB = async () => {
  const colorCount = await db.colors.countDocuments();
  if (colorCount === 0) {
    console.log('Seeding database with sample data...');
    await seedData();
    console.log('Database seeded');
  } else {
    console.log('Database already has data, skipping seed');
  }
  console.log('Database ready');
};

module.exports = { connectDB };
