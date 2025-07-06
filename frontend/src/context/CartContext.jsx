import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    console.log('=== CART CONTEXT: Loading from localStorage ===')
    const savedCart = localStorage.getItem('cart')
    console.log('Saved cart from localStorage:', savedCart)
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log('Parsed cart:', parsedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
        setCartItems([])
      }
    } else {
      console.log('No saved cart found in localStorage')
    }
    setIsInitialized(true)
    console.log('=== CART CONTEXT: Loading complete ===')
  }, [])

  // Save cart to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return // Don't save during initial load
    
    console.log('=== CART CONTEXT: Saving to localStorage ===')
    console.log('Cart items to save:', cartItems)
    localStorage.setItem('cart', JSON.stringify(cartItems))
    console.log('Cart saved to localStorage')
  }, [cartItems, isInitialized])

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item to cart
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          category: product.category,
          quantity: quantity
        }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const getTax = (taxRate = 0.08) => {
    return getCartTotal() * taxRate
  }

  const getFinalTotal = (taxRate = 0.08) => {
    return getCartTotal() + getTax(taxRate)
  }

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId)
  }

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getTax,
    getFinalTotal,
    isInCart,
    getItemQuantity,
    toggleCart,
    setIsCartOpen
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 