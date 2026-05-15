import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSET_BASE_URL, productAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(id);
        const product = response.data.product;

        if (!product || !isMounted) {
          return;
        }

        setFormData({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          category: product.category,
          image: null
        });

        if (product.image) {
          setImagePreview(`${ASSET_BASE_URL}${product.image}`);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to fetch product');
          navigate('/products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);

      setFormData({
        ...formData,
        image: file
      });
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedCategory = formData.category.trim();
    const parsedPrice = Number(formData.price);
    const parsedQuantity = Number(formData.quantity);

    if (!trimmedName || !trimmedCategory) {
      toast.error('Name and category are required');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error('Price must be a valid number');
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      toast.error('Quantity must be a whole number');
      return;
    }

    setSubmitting(true);
    
    const data = new FormData();
    data.append('name', trimmedName);
    data.append('price', parsedPrice);
    data.append('quantity', parsedQuantity);
    data.append('category', trimmedCategory);
    if (formData.image) {
      data.append('image', formData.image);
    }
    
    try {
      if (id) {
        const response = await productAPI.update(id, data);
        toast.success(response.data.message || 'Product updated successfully');
      } else {
        const response = await productAPI.create(data);
        toast.success(response.data.message || 'Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {id ? 'Edit Product' : 'Add New Product'}
      </h1>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Price *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            step="1"
            className="input-field"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input-field"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded" />
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : (id ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
