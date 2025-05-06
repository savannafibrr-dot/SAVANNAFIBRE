const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/Payment');
const auth = require('../middleware/auth');

// Get all payment methods (public)
router.get('/', async (req, res) => {
  try {
    const methods = await PaymentMethod.find().sort({ order: 1, methodName: 1 });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Add a new payment method (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { methodName, iconClass, steps, order } = req.body;
    const method = new PaymentMethod({ methodName, iconClass, steps, order });
    await method.save();
    res.status(201).json(method);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add payment method' });
  }
});

// Update a payment method (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { methodName, iconClass, steps, order } = req.body;
    const method = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      { methodName, iconClass, steps, order },
      { new: true }
    );
    if (!method) return res.status(404).json({ error: 'Not found' });
    res.json(method);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update payment method' });
  }
});

// Delete a payment method (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const method = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!method) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete payment method' });
  }
});

module.exports = router; 