import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'

const ADD_CATEGORY = gql`
  mutation AddCategory($name: String!, $description: String) {
    addCategory(name: $name, description: $description) {
      id
      name
      description
    }
  }
`

export default function AddCategoryModal({ isOpen, onClose, onCategoryAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const [addCategory, { loading }] = useMutation(ADD_CATEGORY, {
    onCompleted: (data) => {
      onCategoryAdded(data.addCategory)
      onClose()
      setFormData({ name: '', description: '' })
    },
    onError: (error) => {
      alert(`Error adding category: ${error.message}`)
    },
    refetchQueries: [
      'GetAllCategories',
      'GetCategoriesBySeller'
    ]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    addCategory({
      variables: {
        name: formData.name,
        description: formData.description || null
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
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Category</h2>
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
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category description (optional)"
            />
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
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 