const Product = require('./models/Product');
const Color = require('./models/Color');
const User = require('./models/User');

const colors = [
  { name: 'Ocean Blue', hex: '#2563EB', family: 'Blues', description: 'A deep, calming blue perfect for bedrooms and living spaces.', usage: ['Living Room', 'Bedroom', 'Bathroom', 'Accent Walls'], mood: ['Calm', 'Serene', 'Professional'], complementary: ['#F59E0B', '#F97316'], designs: [{ title: 'Coastal Living Room', roomType: 'Living Room', description: 'Pair with white trim and natural wood for a beachy feel.' }, { title: 'Serene Bedroom', roomType: 'Bedroom', description: 'Create a peaceful retreat with soft lighting.' }] },
  { name: 'Forest Green', hex: '#16A34A', family: 'Greens', description: 'Rich green inspired by Ghanaian forests. Ideal for accent walls.', usage: ['Living Room', 'Office', 'Accent Walls', 'Exterior'], mood: ['Natural', 'Fresh', 'Elegant'], complementary: ['#D97706', '#FCD34D'], designs: [{ title: 'Jungle Vibes', roomType: 'Living Room', description: 'Combine with plants for a natural look.' }] },
  { name: 'Sunset Orange', hex: '#EA580C', family: 'Oranges', description: 'Warm and inviting, reminiscent of Ghanaian sunsets.', usage: ['Kitchen', 'Dining Room', 'Feature Wall', 'Exterior'], mood: ['Warm', 'Energetic', 'Welcoming'], complementary: ['#1D4ED8', '#0F766E'], designs: [{ title: 'Warm Kitchen', roomType: 'Kitchen', description: 'Creates an appetite-inducing warm atmosphere.' }] },
  { name: 'Royal Purple', hex: '#9333EA', family: 'Purples', description: 'Luxurious purple for elegant spaces.', usage: ['Bedroom', 'Living Room', 'Accent Walls'], mood: ['Luxurious', 'Creative', 'Sophisticated'], complementary: ['#FBBF24', '#10B981'], designs: [{ title: 'Luxury Lounge', roomType: 'Living Room', description: 'Gold accents complement this rich purple perfectly.' }] },
  { name: 'Sunflower Yellow', hex: '#EAB308', family: 'Yellows', description: 'Bright and cheerful yellow.', usage: ['Kitchen', 'Kids Room', 'Living Room', 'Exterior'], mood: ['Happy', 'Bright', 'Cheerful'], complementary: ['#2563EB', '#7C3AED'], designs: [{ title: 'Happy Kitchen', roomType: 'Kitchen', description: 'Start your day with this energizing color.' }] },
  { name: 'Crimson Red', hex: '#DC2626', family: 'Reds', description: 'Bold red for dramatic statements.', usage: ['Dining Room', 'Accent Walls', 'Exterior Doors'], mood: ['Bold', 'Passionate', 'Dramatic'], complementary: ['#FCD34D', '#111827'], designs: [{ title: 'Dramatic Dining', roomType: 'Dining Room', description: 'Creates an intimate dining experience.' }] },
  { name: 'Blush Pink', hex: '#EC4899', family: 'Pinks', description: 'Soft pink for gentle, romantic spaces.', usage: ['Bedroom', 'Nursery', 'Bathroom', 'Feature Wall'], mood: ['Romantic', 'Soft', 'Gentle'], complementary: ['#6B7280', '#FBBF24'], designs: [{ title: 'Romantic Bedroom', roomType: 'Bedroom', description: 'Soft pink creates a calming romantic atmosphere.' }] },
  { name: 'Pure White', hex: '#F8FAFC', family: 'Whites', description: 'Clean, crisp white for any space.', usage: ['Ceiling', 'Living Room', 'Kitchen', 'Bathroom', 'Exterior'], mood: ['Clean', 'Modern', 'Minimalist'], complementary: ['#111827', '#2563EB'], designs: [{ title: 'Modern Minimalist', roomType: 'Living Room', description: 'White makes spaces feel larger and brighter.' }] },
  { name: 'Charcoal Black', hex: '#111827', family: 'Blacks', description: 'Deep charcoal for sophisticated accents.', usage: ['Accent Walls', 'Exterior Trim', 'Doors', 'Furniture'], mood: ['Sophisticated', 'Modern', 'Bold'], complementary: ['#F8FAFC', '#F59E0B'], designs: [{ title: 'Modern Office', roomType: 'Office', description: 'Creates a sophisticated professional space.' }] },
  { name: 'Warm Beige', hex: '#D4A574', family: 'Neutrals', description: 'Warm beige that pairs with everything.', usage: ['Living Room', 'Bedroom', 'Hallway', 'Exterior'], mood: ['Warm', 'Neutral', 'Timeless'], complementary: ['#2563EB', '#16A34A'], designs: [{ title: 'Timeless Living', roomType: 'Living Room', description: 'A neutral base for any decor style.' }] },
];

const products = [
  { name: 'Premium Interior Emulsion Paint - Ocean Blue', brand: 'PaintMarket Pro', category: 'Interior Paint', color: 'Ocean Blue', colorHex: '#2563EB', colorFamily: 'Blues', finish: 'Matte', size: '5L', price: 120, comparePrice: 150, stock: 50, description: 'High-quality matte emulsion paint for interior walls. Provides excellent coverage and a smooth finish.', usage: ['Living Room', 'Bedroom'], features: ['Washable', 'Low VOCs', '10-year durability', 'Covers up to 40sqm per liter'], isFeatured: true, rating: 4.5, numReviews: 12 },
  { name: 'Premium Interior Emulsion Paint - Ocean Blue', brand: 'PaintMarket Pro', category: 'Interior Paint', color: 'Ocean Blue', colorHex: '#2563EB', colorFamily: 'Blues', finish: 'Gloss', size: '2.5L', price: 75, comparePrice: 90, stock: 30, description: 'High-gloss interior paint for a shiny, durable finish.', usage: ['Living Room', 'Kitchen', 'Bathroom'], features: ['Washable', 'Stain Resistant', '8-year durability'], isFeatured: true, rating: 4.3, numReviews: 8 },
  { name: 'Forest Green Satin Finish', brand: 'NatureCoat', category: 'Interior Paint', color: 'Forest Green', colorHex: '#16A34A', colorFamily: 'Greens', finish: 'Satin', size: '5L', price: 135, stock: 40, description: 'Satin finish paint with a subtle sheen. Perfect for living areas.', usage: ['Living Room', 'Office'], features: ['Satin Sheen', 'Scrubbable', '12-year durability'], isFeatured: true, rating: 4.7, numReviews: 15 },
  { name: 'Sunset Orange Exterior Paint', brand: 'WeatherShield', category: 'Exterior Paint', color: 'Sunset Orange', colorHex: '#EA580C', colorFamily: 'Oranges', finish: 'Gloss', size: '10L', price: 250, comparePrice: 300, stock: 20, description: 'Weather-resistant exterior paint with UV protection.', usage: ['Exterior Walls', 'Exterior Doors'], features: ['UV Resistant', 'Water Repellent', '15-year durability', 'Fade Resistant'], isFeatured: true, rating: 4.6, numReviews: 20 },
  { name: 'Royal Purple Accent Paint', brand: 'PaintMarket Pro', category: 'Interior Paint', color: 'Royal Purple', colorHex: '#9333EA', colorFamily: 'Purples', finish: 'Matte', size: '2.5L', price: 85, stock: 25, description: 'Make a statement with this rich purple accent paint.', usage: ['Accent Walls', 'Feature Walls'], features: ['Rich Pigment', 'One-coat Coverage', '9-year durability'], isFeatured: false, rating: 4.4, numReviews: 6 },
  { name: 'Sunflower Yellow Kitchen Paint', brand: 'CheerfulHomes', category: 'Interior Paint', color: 'Sunflower Yellow', colorHex: '#EAB308', colorFamily: 'Yellows', finish: 'Semi-Gloss', size: '5L', price: 110, comparePrice: 140, stock: 35, description: 'Brighten your kitchen with this cheerful yellow.', usage: ['Kitchen', 'Kids Room'], features: ['Grease Resistant', 'Easy Clean', '10-year durability'], isFeatured: true, rating: 4.2, numReviews: 10 },
  { name: 'Crimson Red Accent Paint', brand: 'BoldStatements', category: 'Interior Paint', color: 'Crimson Red', colorHex: '#DC2626', colorFamily: 'Reds', finish: 'Matte', size: '2.5L', price: 80, stock: 15, description: 'Bold red for dramatic accent walls.', usage: ['Accent Walls', 'Dining Room'], features: ['High Pigment', 'Rich Color', '8-year durability'], isFeatured: false, rating: 4.1, numReviews: 5 },
  { name: 'Premium White Ceiling Paint', brand: 'PaintMarket Pro', category: 'Ceiling Paint', color: 'Pure White', colorHex: '#F8FAFC', colorFamily: 'Whites', finish: 'Matte', size: '10L', price: 180, comparePrice: 220, stock: 60, description: 'Specially formulated ceiling paint that resists yellowing.', usage: ['Ceiling'], features: ['Non-Yellowing', 'No Drip Formula', '20-year durability', 'Covers 50sqm'], isFeatured: true, rating: 4.8, numReviews: 25 },
  { name: 'Charcoal Black Exterior Trim Paint', brand: 'WeatherShield', category: 'Exterior Paint', color: 'Charcoal Black', colorHex: '#111827', colorFamily: 'Blacks', finish: 'Gloss', size: '5L', price: 160, stock: 22, description: 'Durable gloss paint for exterior trim and doors.', usage: ['Exterior Trim', 'Doors'], features: ['Weather Resistant', 'High Gloss', '12-year durability'], isFeatured: false, rating: 4.3, numReviews: 7 },
  { name: 'Warm Beige Interior Emulsion', brand: 'NatureCoat', category: 'Interior Paint', color: 'Warm Beige', colorHex: '#D4A574', colorFamily: 'Neutrals', finish: 'Eggshell', size: '5L', price: 115, stock: 45, description: 'Timeless beige with an eggshell finish for a subtle sheen.', usage: ['Living Room', 'Hallway'], features: ['Eggshell Sheen', 'Washable', '15-year durability'], isFeatured: true, rating: 4.6, numReviews: 18 },
  { name: 'Blush Pink Bedroom Paint', brand: 'PaintMarket Pro', category: 'Interior Paint', color: 'Blush Pink', colorHex: '#EC4899', colorFamily: 'Pinks', finish: 'Matte', size: '5L', price: 125, comparePrice: 155, stock: 28, description: 'Soft pink matte paint for romantic bedroom spaces.', usage: ['Bedroom', 'Nursery'], features: ['Soft Matte', 'Baby Safe', '10-year durability'], isFeatured: false, rating: 4.4, numReviews: 9 },
  { name: 'All-Purpose Wood Primer', brand: 'PaintMarket Pro', category: 'Primer', color: 'Pure White', colorHex: '#F8FAFC', colorFamily: 'Whites', finish: 'Matte', size: '5L', price: 95, stock: 55, description: 'High-quality wood primer for interior and exterior use.', usage: ['Wood Furniture', 'Wood Trim', 'Doors'], features: ['Quick Drying', 'Sanding Friendly', 'Excellent Adhesion'], isFeatured: false, rating: 4.5, numReviews: 14 },
  { name: 'Metal Paint - Charcoal Black', brand: 'RustGuard', category: 'Metal Paint', color: 'Charcoal Black', colorHex: '#111827', colorFamily: 'Blacks', finish: 'Gloss', size: '2.5L', price: 90, stock: 18, description: 'Anti-rust metal paint for gates, railings, and furniture.', usage: ['Gates', 'Railings', 'Metal Furniture'], features: ['Rust Resistant', 'High Gloss', '8-year durability'], isFeatured: false, rating: 4.2, numReviews: 11 },
  { name: 'Floor Paint - Grey', brand: 'DuraFloor', category: 'Floor Paint', color: 'Charcoal Black', colorHex: '#374151', colorFamily: 'Neutrals', finish: 'Satin', size: '10L', price: 200, stock: 10, description: 'Heavy-duty floor paint for garages, patios, and warehouses.', usage: ['Garage', 'Patio', 'Warehouse'], features: ['Anti-Slip', 'Chemical Resistant', '5-year durability'], isFeatured: false, rating: 4.0, numReviews: 4 },
];

const seedData = async () => {
  const colorCount = await Color.countDocuments();
  if (colorCount > 0) {
    console.log('Database already seeded, skipping');
    return;
  }
  await Color.insertMany(colors);
  console.log('Colors seeded');
  for (const product of products) {
    const c = colors.find(c => c.name === product.color);
    const designInspirations = c?.designs.map(d => ({
      ...d,
      image: `https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop`
    })) || [];
    await Product.create({ ...product, images: [], designInspirations });
  }
  console.log('Products seeded');
  const adminExists = await User.findOne({ email: 'admin@paintmarket.gh' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@paintmarket.gh', role: 'admin', googleId: 'admin-google-id' });
    console.log('Admin user created');
  }
  console.log('Seed completed');
};

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await seedData();
    process.exit(0);
  }).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { seedData };
