import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiPackage, FiShoppingCart, FiHome, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  let user = null;

  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    localStorage.removeItem('user');
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Inventory MS
            </h1>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <FiHome />
                <span>Dashboard</span>
              </Link>
              <Link to="/products" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <FiPackage />
                <span>Products</span>
              </Link>
              <Link to="/sales" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <FiShoppingCart />
                <span>Sales</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 dark:text-gray-300">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
