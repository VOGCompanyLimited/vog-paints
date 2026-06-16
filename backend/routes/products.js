const express = require('express');
const router = express.Router();
const {
  getProducts, getProductBySlug, getFeaturedProducts,
  createProduct, updateProduct, deleteProduct, createReview
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:productId/reviews', protect, createReview);

module.exports = router;
