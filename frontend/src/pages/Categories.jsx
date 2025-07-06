import { useQuery, gql } from '@apollo/client'
import { Link } from 'react-router-dom'

const GET_CATEGORIES = gql`
  query GetCategories {
    getAllCategories {
      id
      name
      description
    }
  }
`

const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!) {
    getProductsByCategory(categoryId: $categoryId) {
      id
      name
      description
      price
      images
      category {
        id
        name
      }
    }
  }
`

export default function Categories() {
  const { loading, error, data } = useQuery(GET_CATEGORIES)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading categories...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600 text-center">Error loading categories: {error.message}</div>
      </div>
    )
  }

  const categories = data?.getAllCategories || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h1>
          <p className="text-lg text-gray-600">Browse products by category</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-600">Check back later for new categories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`} 
                className="bg-white rounded-lg shadow-md p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 group-hover:bg-blue-700 transition-colors duration-200">
                  {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description || 'Explore products in this category'}
                  </p>
                </div>
                <div className="text-xl text-blue-600 font-bold group-hover:translate-x-1 transition-transform duration-200">
                  →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

