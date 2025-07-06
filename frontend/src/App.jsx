import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import ChatBot from './components/ChatBot'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProductDetails from './pages/ProductDetails'
import Profile from './pages/Profile'
import Categories from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import Orders from './pages/Orders'
import Cart from './pages/Cart'
import './App.css'

function App() {
  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:categoryId" element={<CategoryProducts />} />
        <Route path="/orders" element={
          <ProtectedRoute requiredRole="customer">
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute requiredRole="customer">
            <Cart />
          </ProtectedRoute>
        } />
        </Routes>
      </main>
      <ChatBot />
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    flex: 1
  }
}

export default App
