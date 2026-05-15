const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/', authMiddleware, getProducts);
router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
