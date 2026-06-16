const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  brand: { type: String },
  category: { type: String, required: true },
  color: { type: String },
  colorHex: { type: String },
  colorFamily: { type: String },
  finish: { type: String, enum: ['Matte', 'Gloss', 'Satin', 'Eggshell', 'Semi-Gloss'] },
  size: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  currency: { type: String, default: 'GHS' },
  stock: { type: Number, default: 0 },
  description: { type: String },
  usage: [{ type: String }],
  images: [{ type: String }],
  designInspirations: [{
    title: String,
    image: String,
    description: String,
    roomType: String
  }],
  features: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
