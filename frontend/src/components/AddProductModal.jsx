import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'

const ADD_PRODUCT = gql`
  mutation AddProduct($name: String!, $description: String!, $price: Float!, $images: [String], $category: ID!) {
    addProduct(name: $name, description: $description, price: $price, images: $images, category: $category) {
      id
      name
      description
      price
      images
      category {
        id
        name
      }
      sellerId
    }
  }
`

const GET_CATEGORIES = gql`
  query GetCategories {
    getAllCategories {
      id
      name
      description
    }
  }
`

export default function AddProductModal({ isOpen, onClose, onProductAdded, categories = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: '',
    category: ''
  })

  const [addProduct, { loading }] = useMutation(ADD_PRODUCT, {
    onCompleted: (data) => {
      onProductAdded(data.addProduct)
      onClose()
      setFormData({ name: '', description: '', price: '', images: '', category: '' })
    },
    onError: (error) => {
      alert(`Error adding product: ${error.message}`)
    },
    refetchQueries: [
      { query: GET_CATEGORIES },
      'GetProductsBySeller',
      'GetProducts'
    ]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const imagesArray = formData.images ? formData.images.split(',').map(url => url.trim()) : []
    
    addProduct({
      variables: {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        images: imagesArray,
        category: formData.category
      }
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Image URLs (comma-separated)
            </label>
            <input
              type="text"
              id="images"
              name="images"
              value={formData.images}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter image URLs separated by commas
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 