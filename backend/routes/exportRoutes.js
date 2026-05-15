const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  exportProducts,
  exportSales
} = require('../controllers/exportController');

router.get('/products', authMiddleware, exportProducts);
router.get('/sales', authMiddleware, exportSales);

module.exports = router;