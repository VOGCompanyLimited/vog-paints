const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById, cancelOrder, confirmBankPayment
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/confirm-payment', protect, confirmBankPayment);

module.exports = router;
