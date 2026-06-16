const express = require('express');
const router = express.Router();
const {
  getDashboard, getOrders, updateOrderStatus,
  getUsers, updateUserRole, getDeliveryPartners,
  createColor, updateColor, deleteColor, mixColors, getAdminProducts
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const { getColors } = require('../controllers/productController');

router.use(protect, admin);

router.get('/dashboard', getDashboard);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/delivery-partners', getDeliveryPartners);
router.get('/products', getAdminProducts);
router.post('/colors', createColor);
router.put('/colors/:id', updateColor);
router.delete('/colors/:id', deleteColor);
router.post('/colors/mix', mixColors);
router.get('/colors', getColors);

module.exports = router;
