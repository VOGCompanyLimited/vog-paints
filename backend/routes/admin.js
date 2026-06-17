const express = require('express');
const router = express.Router();
const {
  getDashboard, getOrders, updateOrderStatus,
  getUsers, updateUserRole, getDeliveryPartners,
  createColor, updateColor, deleteColor, mixColors, getAdminProducts,
  toggleProductStatus, getLogo, updateLogo, deleteLogo
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
router.patch('/products/:id/toggle', toggleProductStatus);
router.post('/colors', createColor);
router.put('/colors/:id', updateColor);
router.delete('/colors/:id', deleteColor);
router.post('/colors/mix', mixColors);
router.get('/colors', getColors);
router.get('/logo', getLogo);
router.put('/logo', updateLogo);
router.delete('/logo', deleteLogo);

module.exports = router;
