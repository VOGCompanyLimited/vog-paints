const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  family: { type: String, required: true },
  description: { type: String },
  usage: [{ type: String }],
  mood: [String],
  complementary: [String],
  designs: [{
    title: String,
    image: String,
    roomType: String,
    description: String
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Color', colorSchema);
