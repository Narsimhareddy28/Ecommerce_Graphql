import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function AddToCartButton({ product, quantity = 1, className = '', variant = 'primary' }) {
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart, isInCart, getItemQuantity } = useCart()
  const { user } = useAuth()

  const handleAddToCart = async () => {
    if (!user || user.role !== 'customer') {
      alert('Please login as a customer to add items to cart')
      return
    }

    setIsAdding(true)
    
    try {
      addToCart(product, quantity)
      
      // Brief delay for UX feedback
      setTimeout(() => {
        setIsAdding(false)
      }, 500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAdding(false)
    }
  }

  const inCart = isInCart(product.id)
  const cartQuantity = getItemQuantity(product.id)

  const baseClasses = variant === 'sm' 
    ? "rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    : "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    sm: "bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (isAdding) {
    return (
      <button disabled className={buttonClasses}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Adding...
        </div>
      </button>
    )
  }

  if (inCart) {
    return (
      <button onClick={handleAddToCart} className={`${baseClasses} ${variant === 'sm' ? 'bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1' : variantClasses.success} ${className}`}>
        <div className="flex items-center gap-1">
          <svg className={`${variant === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {variant === 'sm' ? `+` : `In Cart (${cartQuantity}) - Add More`}
        </div>
      </button>
    )
  }

  return (
    <button onClick={handleAddToCart} className={buttonClasses}>
      <div className="flex items-center gap-1">
        {variant === 'sm' ? '+' : 'Add to Cart'}
      </div>
    </button>
  )
} 