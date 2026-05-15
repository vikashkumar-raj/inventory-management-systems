const { Parser } = require('json2csv');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// Export products to CSV
exports.exportProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    
    const fields = ['_id', 'name', 'price', 'quantity', 'category', 'createdAt'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(products);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export sales to CSV
exports.exportSales = async (req, res) => {
  try {
    const sales = await Sale.find().lean();
    
    const fields = ['_id', 'productName', 'quantity', 'totalPrice', 'date'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(sales);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('sales.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};