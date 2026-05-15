const Product = require('../models/Product');

const parseProductFields = ({ price, quantity }) => {
  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Price must be a valid number greater than or equal to 0' };
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    return { error: 'Quantity must be a whole number greater than or equal to 0' };
  }

  return { parsedPrice, parsedQuantity };
};

// Get all products with pagination
exports.getProducts = async (req, res) => {
  try {
    console.log('Get products query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a product by id
exports.getProductById = async (req, res) => {
  try {
    console.log('Get product by id:', req.params);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
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

// Create new product
exports.createProduct = async (req, res) => {
  try {
    console.log('Create product body:', req.body);
    const { name, price, quantity, category } = req.body;
    let image = '';

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, quantity, and category are required'
      });
    }
    
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const { parsedPrice, parsedQuantity, error } = parseProductFields({
      price,
      quantity
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    const product = new Product({
      name: name.trim(),
      price: parsedPrice,
      quantity: parsedQuantity,
      category: category.trim(),
      image
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error(error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Update product params/body:', req.params, req.body);
    const { id } = req.params;
    const { name, price, quantity, category } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (name !== undefined) {
      product.name = name.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid number greater than or equal to 0'
        });
      }

      product.price = parsedPrice;
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a whole number greater than or equal to 0'
        });
      }

      product.quantity = parsedQuantity;
    }

    if (category !== undefined) {
      product.category = category.trim();
    }
    
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error(error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('Delete product params:', req.params);
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
