import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

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
    const savedCart = localStorage.getItem('cart')
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
        setCartItems([])
      }
    }
    setIsInitialized(true)
  }, [])

  // Debounced localStorage save
  useEffect(() => {
    if (!isInitialized) return
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }, 100) // Debounce by 100ms to avoid excessive localStorage writes
    
    return () => clearTimeout(timeoutId)
  }, [cartItems, isInitialized])

  const addToCart = useCallback((product, quantity = 1) => {
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
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, newQuantity) => {
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
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  // Memoized calculations
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cartItems])

  const cartItemsCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }, [cartItems])

  const getCartTotal = useCallback(() => {
    return cartTotal
  }, [cartTotal])

  const getCartItemsCount = useCallback(() => {
    return cartItemsCount
  }, [cartItemsCount])

  const getTax = useCallback((taxRate = 0.08) => {
    return cartTotal * taxRate
  }, [cartTotal])

  const getFinalTotal = useCallback((taxRate = 0.08) => {
    return cartTotal + (cartTotal * taxRate)
  }, [cartTotal])

  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId)
  }, [cartItems])

  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.quantity : 0
  }, [cartItems])

  const toggleCart = useCallback(() => {
    setIsCartOpen(!isCartOpen)
  }, [isCartOpen])

  const value = useMemo(() => ({
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
  }), [
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
    toggleCart
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 