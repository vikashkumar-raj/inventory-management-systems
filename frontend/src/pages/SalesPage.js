import React, { useState, useEffect } from 'react';
import { salesAPI, productAPI, exportAPI } from '../services/api';
import { FiDownload, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice } from '../utils/formatPrice';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, productsRes] = await Promise.all([
          salesAPI.getAll(currentPage, 10),
          productAPI.getAll(1, 100)
        ]);

        if (!isMounted) {
          return;
        }

        setSales(salesRes.data.sales);
        setTotalPages(salesRes.data.totalPages);
        setProducts(productsRes.data.products);
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to fetch data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, refreshKey]);

  const handleSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast.error('Quantity must be a whole number greater than 0');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await salesAPI.create({
        productId: selectedProduct,
        quantity: parsedQuantity
      });
      toast.success(response.data.message || 'Sale recorded successfully');
      setShowSaleModal(false);
      setSelectedProduct('');
      setQuantity(1);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sale failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportAPI.exportSales();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Sales Records
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowSaleModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FiShoppingCart />
            <span>New Sale</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {sale.productName}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {formatPrice(sale.totalPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {new Date(sale.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-800 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      
      {showSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Record Sale
            </h2>
            <form onSubmit={handleSale}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Select Product *
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Choose a product</option>
                  {products
                    .filter((product) => product.quantity > 0)
                    .map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {formatPrice(product.price)} (Stock: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  step="1"
                  required
                  className="input-field"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Record Sale'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
