const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    color: String
  }],
  shippingAddress: {
    street: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  paymentMethod: { type: String, enum: ['cash_on_delivery', 'bank_transfer', 'card'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  bankPaymentDetails: {
    reference: String,
    receiptUrl: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'GHS' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tracking: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  estimatedDelivery: Date,
  deliveredAt: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
