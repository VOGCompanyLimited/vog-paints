const express = require('express');
const router = express.Router();
const { getColors, getColorByHex } = require('../controllers/productController');

router.get('/', getColors);
router.get('/:hex', getColorByHex);

module.exports = router;
