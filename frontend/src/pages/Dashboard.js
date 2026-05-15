import React, { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice } from '../utils/formatPrice';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalStockValue: 0,
    lowStock: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, salesRes] = await Promise.all([
        salesAPI.getSummary(),
        salesAPI.getAll(1, 10)
      ]);

      const sales = salesRes.data.sales;
      const summary = summaryRes.data.summary;

      setStats({
        totalProducts: summary.totalProducts,
        totalSales: summary.totalSales,
        totalRevenue: summary.totalRevenue,
        totalStockValue: summary.totalStockValue,
        lowStock: summary.lowStock
      });

      setRecentSales(sales.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = recentSales.map(sale => ({
    date: new Date(sale.date).toLocaleDateString(),
    amount: sale.totalPrice
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.totalProducts}
              </p>
            </div>
            <FiPackage className="text-4xl text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.totalSales}
              </p>
            </div>
            <FiShoppingCart className="text-4xl text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <FiDollarSign className="text-4xl text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatPrice(stats.totalStockValue)}
              </p>
            </div>
            <FiDollarSign className="text-4xl text-indigo-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.lowStock}
              </p>
            </div>
            <FiTrendingUp className="text-4xl text-red-600" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Recent Sales
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Product</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Quantity</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="border-b dark:border-gray-700">
                    <td className="py-2 text-gray-800 dark:text-gray-300">{sale.productName}</td>
                    <td className="py-2 text-gray-800 dark:text-gray-300">{sale.quantity}</td>
                    <td className="py-2 text-gray-800 dark:text-gray-300">{formatPrice(sale.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Sales Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatPrice} />
              <Tooltip formatter={(value) => formatPrice(value)} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
