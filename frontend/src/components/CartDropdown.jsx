import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ProductImage from './ProductImage'

export default function CartDropdown({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart()

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="max-h-80 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      showHover={false}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600">${item.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-green-600">${getCartTotal().toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Link 
                to="/cart" 
                onClick={onClose}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                View Cart
              </Link>
              <button 
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 