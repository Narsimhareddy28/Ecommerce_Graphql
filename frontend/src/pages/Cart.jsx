import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, gql } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/ProductImage'

const CREATE_ORDER = gql`
  mutation CreateOrder($products: [OrderProductInput!]!) {
    createOrder(products: $products) {
      id
      totalAmount
      status
      createdAt
      products {
        product {
          id
          name
          price
        }
        quantity
      }
    }
  }
`

export default function Cart() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getTax, 
    getFinalTotal,
    getCartItemsCount 
  } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [createOrder] = useMutation(CREATE_ORDER)

  // Check authentication and role
  useEffect(() => {
    if (!loading && (!user || user.role !== 'customer')) {
      navigate('/')
      return
    }
  }, [navigate, user, loading])

  const handleCheckout = async () => {
    console.log('=== FRONTEND CHECKOUT DEBUG ===')
    console.log('User:', user)
    console.log('Cart items:', cartItems)

    if (!user || user.role !== 'customer') {
      alert('Please login as a customer to place orders')
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    setIsCheckingOut(true)

    try {
      // Prepare order data
      const orderProducts = cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity
      }))

      console.log('Order products being sent:', orderProducts)

      // Create order
      const { data } = await createOrder({
        variables: { products: orderProducts }
      })

      console.log('Order creation response:', data)

      if (data?.createOrder) {
        // Clear cart after successful order
        clearCart()
        
        // Show success message
        alert(`Order placed successfully! Order total: $${data.createOrder.totalAmount.toFixed(2)}`)
        
        // Navigate to orders page
        navigate('/orders')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Error placing order: ${error.message}`)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
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
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </div>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {getCartItemsCount()} item{getCartItemsCount() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link 
              to="/categories" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        showHover={false}
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category?.name}</p>
                      <p className="text-lg font-bold text-green-600">${item.price}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                      >
                        -
                      </button>
                      <span className="font-semibold text-gray-900 min-w-[2ch] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <div className="pt-4">
                <button 
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${getFinalTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold mt-6 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                
                <Link 
                  to="/categories"
                  className="block w-full text-center text-blue-600 hover:text-blue-800 py-2 mt-3 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

