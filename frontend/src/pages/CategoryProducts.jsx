import { useQuery, gql } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import AddToCartButton from '../components/AddToCartButton'

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

const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      name
      description
    }
  }
`

export default function CategoryProducts() {
  const { categoryId } = useParams()

  const { loading: categoryLoading, error: categoryError, data: categoryData } = useQuery(GET_CATEGORY, {
    variables: { id: categoryId }
  })

  const { loading: productsLoading, error: productsError, data: productsData } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId }
  })

  if (categoryLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    )
  }

  if (categoryError || productsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">
            Error loading products: {categoryError?.message || productsError?.message}
          </div>
          <Link to="/categories" className="text-blue-600 hover:text-blue-800">
            ← Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  const category = categoryData?.getCategory
  const products = productsData?.getProductsByCategory || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <span>→</span>
            <Link to="/categories" className="hover:text-gray-900">Categories</Link>
            <span>→</span>
            <span className="text-gray-900 font-medium">{category?.name}</span>
          </div>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name}</h1>
          {category?.description && (
            <p className="text-lg text-gray-600">{category.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              There are no products in this category yet. Check back later!
            </p>
            <Link 
              to="/categories" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="h-48 overflow-hidden">
                    <ProductImage
                      src={product.images && product.images.length > 0 ? product.images[0] : null}
                      alt={product.name}
                      showHover={true}
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`} className="block hover:text-blue-600 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.category.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <AddToCartButton 
                      product={product} 
                      className="w-full"
                    />
                    <Link 
                      to={`/product/${product.id}`}
                      className="block bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Categories Button */}
        <div className="mt-12 text-center">
          <Link 
            to="/categories" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to All Categories
          </Link>
        </div>
      </div>
    </div>
  )
} 