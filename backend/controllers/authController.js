const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, username, role) => {
  return jwt.sign(
    { userId, username, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register user
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('Register request received for username:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Create new user
    const user = new User({
      username: normalizedUsername,
      password,
      role: role || 'user'
    });

    await user.save();
    const token = generateToken(user._id, user.username, user.role);

    console.log('User registered successfully:', user.username);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request received for username:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const normalizedUsername = username.trim();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      console.warn('Login failed: user not found:', normalizedUsername);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.warn('Login failed: invalid password for user:', normalizedUsername);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, user.username, user.role);

    console.log('User logged in successfully:', user.username);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
