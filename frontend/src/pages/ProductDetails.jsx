import { useQuery, gql } from '@apollo/client'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import AddToCartButton from '../components/AddToCartButton'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      description
      price
      images
      category {
        id
        name
        description
      }
      sellerId
    }
  }
`

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id }
  })

  const handleBuyNow = () => {
    if (!user || user.role !== 'customer') {
      alert('Please login as a customer to purchase items')
      return
    }

    // Add to cart and navigate to cart page
    addToCart(product, 1)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading product details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
        <div className="text-lg text-red-600 text-center">Error loading product: {error.message}</div>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Products</Link>
      </div>
    )
  }

  const product = data?.getProduct

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
        <div className="text-lg text-red-600 text-center">Product not found</div>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Products</Link>
      </div>
    )
  }

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
            <Link to={`/category/${product.category?.id}`} className="hover:text-gray-900">
              {product.category?.name}
            </Link>
            <span>→</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
              <ProductImage
                src={product.images && product.images.length > 0 ? product.images[0] : null}
                alt={product.name}
                showHover={false}
              />
            </div>
            
            {/* Image Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white shadow-md">
                    <ProductImage
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      showHover={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  {product.category?.name}
                </span>
              </div>
            </div>
            
            {/* Price */}
            <div className="py-4 border-t border-b border-gray-200">
              <span className="text-4xl font-bold text-green-600">${product.price}</span>
            </div>
            
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
            
            {/* Category Information */}
            {product.category?.description && (
              <div className="bg-gray-100 rounded-lg p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Category Information</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.category.description}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <AddToCartButton 
                product={product} 
                className="flex-1"
                variant="outline"
              />
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-blue-600 text-white border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

