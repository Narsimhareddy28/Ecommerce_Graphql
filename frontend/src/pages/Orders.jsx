import { useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProductImage from '../components/ProductImage'

const GET_MY_ORDERS = gql`
  query GetMyOrders {
    getMyOrders {
      id
      totalAmount
      status
      createdAt
      updatedAt
      products {
        product {
          id
          name
          price
          images
          category {
            id
            name
          }
        }
        quantity
      }
    }
  }
`

export default function Orders() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { loading, error, data } = useQuery(GET_MY_ORDERS, {
    skip: !user || user.role !== 'customer'
  })

  // Debug logging
  console.log('=== ORDERS PAGE DEBUG ===')
  console.log('User:', user)
  console.log('Auth Loading:', authLoading)
  console.log('Query Loading:', loading)
  console.log('Query Error:', error)
  console.log('Query Data:', data)
  console.log('=== END ORDERS DEBUG ===')

  // Check authentication and role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'customer')) {
      navigate('/')
      return
    }
  }, [navigate, user, authLoading])

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'placed': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Error loading orders: {error.message}</div>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const orders = data?.getMyOrders || []
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <span>→</span>
            <span className="text-gray-900 font-medium">My Orders</span>
          </div>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your order history and status</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link 
              to="/categories" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                      Placed on {new Date(Number(order.createdAt)).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.products.map((orderProduct, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <ProductImage
                            src={orderProduct.product.images?.[0]}
                            alt={orderProduct.product.name}
                            showHover={false}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${orderProduct.product.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                          >
                            {orderProduct.product.name}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {orderProduct.product.category?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {orderProduct.quantity}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${orderProduct.product.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            Subtotal: ${(orderProduct.product.price * orderProduct.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-900">
                      Total: ${order.totalAmount.toFixed(2)}
                    </div>
                    <div className="flex gap-3">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        View Details
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}