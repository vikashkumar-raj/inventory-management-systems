const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Create sale
exports.createSale = async (req, res) => {
  try {
    console.log('Create sale body:', req.body);
    const { productId, quantity } = req.body;
    const saleQuantity = Number(quantity);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product is required'
      });
    }

    if (!Number.isInteger(saleQuantity) || saleQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a whole number greater than 0'
      });
    }
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check stock
    if (product.quantity < saleQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    
    // Calculate total price
    const totalPrice = product.price * saleQuantity;
    
    // Create sale record
    const sale = new Sale({
      productId: product._id,
      productName: product.name,
      quantity: saleQuantity,
      totalPrice
    });
    
    // Update product quantity
    product.quantity -= saleQuantity;
    await product.save();
    await sale.save();
    
    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale,
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all sales
exports.getSales = async (req, res) => {
  try {
    console.log('Get sales query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sales = await Sale.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Sale.countDocuments();
    
    res.json({
      success: true,
      sales,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSales: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get sales and inventory summary
exports.getSalesSummary = async (req, res) => {
  try {
    const [salesSummary, inventorySummary, totalProducts, lowStock] = await Promise.all([
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalSales: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStockValue: {
              $sum: { $multiply: ['$price', '$quantity'] }
            }
          }
        }
      ]),
      Product.countDocuments(),
      Product.countDocuments({ quantity: { $lt: 10 } })
    ]);

    res.json({
      success: true,
      summary: {
        totalRevenue: salesSummary[0]?.totalRevenue || 0,
        totalSales: salesSummary[0]?.totalSales || 0,
        totalStockValue: inventorySummary[0]?.totalStockValue || 0,
        totalProducts,
        lowStock
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
