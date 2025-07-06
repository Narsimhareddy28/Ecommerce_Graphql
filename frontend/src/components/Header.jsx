import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDropdown from './CartDropdown'

export default function Header() {
  const { user, logout } = useAuth()
  const { getCartItemsCount, cartItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef(null)

  const cartCount = getCartItemsCount()
  console.log('=== HEADER DEBUG ===')
  console.log('Cart items in header:', cartItems)
  console.log('Cart count in header:', cartCount)
  console.log('=== END HEADER DEBUG ===')

  // Close cart dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
              E-Commerce
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Home
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Categories
            </Link>

            {user ? (
              <>
                {/* Customer navigation */}
                {user.role === 'customer' && (
                  <>
                    <Link to="/orders" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      Orders
                    </Link>
                    <div ref={cartRef} className="relative">
                      <button 
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative"
                      >
                        Cart
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </button>
                      <CartDropdown 
                        isOpen={isCartOpen} 
                        onClose={() => setIsCartOpen(false)} 
                      />
                    </div>
                    <Link to="/profile" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      Profile
                    </Link>
                  </>
                )}
                
                {/* Admin and Seller navigation */}
                {['admin', 'seller'].includes(user.role) && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      Dashboard
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      Profile
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm font-medium">Hi, {user.name}</span>
                  <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

 