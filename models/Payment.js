const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  methodName: { type: String, required: true },
  iconClass: { type: String, required: true }, // e.g., 'fas fa-mobile-alt'
  steps: [{ type: String, required: true }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema); 