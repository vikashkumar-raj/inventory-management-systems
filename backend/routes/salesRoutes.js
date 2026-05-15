const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createSale,
  getSales,
  getSalesSummary
} = require('../controllers/salesController');

router.post('/', authMiddleware, createSale);
router.get('/summary', authMiddleware, getSalesSummary);
router.get('/', authMiddleware, getSales);

module.exports = router;
