const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price must be positive']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sale', saleSchema);