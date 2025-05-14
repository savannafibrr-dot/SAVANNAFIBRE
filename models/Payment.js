const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  methodName: { type: String, required: true },
  iconClass: { type: String, required: true }, // e.g., 'fas fa-mobile-alt'
  steps: [{ 
    type: String, 
    required: true,
    // Steps can contain HTML for formatting (bold, italic, color, etc.)
    // Example: "Press <strong>*150*00#</strong> then <span style='color: red'>ok</span>"
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema); 