import { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AddProductModal from '../components/AddProductModal'
import AddCategoryModal from '../components/AddCategoryModal'
import EditProductModal from '../components/EditProductModal'
import ProductImage from '../components/ProductImage'

const GET_USER_DATA = gql`
  query GetUserData {
    me {
      id
      name
      email
      role
    }
  }
`

const GET_PRODUCTS = gql`
  query GetProducts {
    getAllProducts {
      id
      name
      description
      price
      images
      category {
        id
        name
      }
      sellerId
    }
  }
`

const GET_PRODUCTS_BY_SELLER = gql`
  query GetProductsBySeller {
    getProductsBySeller {
      id
      name
      description
      price
      images
      category {
        id
        name
      }
      sellerId
    }
  }
`

const GET_CATEGORIES = gql`
  query GetCategories {
    getAllCategories {
      id
      name
      description
    }
  }
`

const GET_CATEGORIES_BY_SELLER = gql`
  query GetCategoriesBySeller {
    getCategoriesBySeller {
      id
      name
      description
    }
  }
`

const GET_USERS = gql`
  query GetUsers {
    getAllUsers {
      id
      name
      email
      role
    }
  }
`

const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    getAllOrders {
      id
      totalAmount
      status
      createdAt
      customerId
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

const GET_ORDERS_BY_SELLER = gql`
  query GetOrdersBySeller {
    getOrdersBySeller {
      id
      totalAmount
      status
      createdAt
      customerId
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

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const { user } = useAuth()

  const { data: userData } = useQuery(GET_USER_DATA, {
    skip: !user
  })

  // For sellers, use getProductsBySeller to get only their products
  // For admins, use getAllProducts to see all products
  const { data: productsData, refetch: refetchProducts } = useQuery(
    user?.role === 'seller' ? GET_PRODUCTS_BY_SELLER : GET_PRODUCTS, 
    {
      skip: !user || !['admin', 'seller'].includes(user?.role)
    }
  )

  // For sellers, use getCategoriesBySeller to get only categories they use
  // For admins, use getAllCategories to see all categories
  const { data: categoriesData, refetch: refetchCategories } = useQuery(
    user?.role === 'seller' ? GET_CATEGORIES_BY_SELLER : GET_CATEGORIES,
    {
      skip: !user || !['admin', 'seller'].includes(user?.role)
    }
  )

  // Get all categories for the product form (sellers need to see all categories to create products)
  const { data: allCategoriesData } = useQuery(GET_CATEGORIES, {
    skip: !user || !['admin', 'seller'].includes(user?.role)
  })

  const { data: usersData, refetch: refetchUsers } = useQuery(GET_USERS, {
    skip: !user || user?.role !== 'admin'
  })

  // Get orders based on role
  const { data: ordersData, refetch: refetchOrders } = useQuery(
    user?.role === 'seller' ? GET_ORDERS_BY_SELLER : GET_ALL_ORDERS,
    {
      skip: !user || !['admin', 'seller'].includes(user?.role)
    }
  )

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => refetchProducts()
  })

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => refetchCategories()
  })

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => refetchUsers()
  })

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => refetchOrders()
  })

  const currentUser = userData?.me || user
  const products = user?.role === 'seller' 
    ? productsData?.getProductsBySeller || []
    : productsData?.getAllProducts || []
  const categories = user?.role === 'seller'
    ? categoriesData?.getCategoriesBySeller || []
    : categoriesData?.getAllCategories || []
  const users = usersData?.getAllUsers || []
  const orders = user?.role === 'seller'
    ? ordersData?.getOrdersBySeller || []
    : ordersData?.getAllOrders || []

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return
    
    try {
      switch (type) {
        case 'product':
          await deleteProduct({ variables: { id } })
          break
        case 'category':
          await deleteCategory({ variables: { id } })
          break
        case 'user':
          await deleteUser({ variables: { id } })
          break
      }
    } catch (error) {
      alert(`Error deleting ${type}: ${error.message}`)
    }
  }

  const handleEditProduct = (product) => {
    setProductToEdit(product)
    setShowEditProductModal(true)
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({
        variables: { id: orderId, status: newStatus }
      })
      alert(`Order status updated to ${newStatus}`)
    } catch (error) {
      alert(`Error updating order status: ${error.message}`)
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'placed': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(['admin', 'seller'].includes(currentUser.role) ? [{ id: 'orders', label: 'Orders' }] : []),
    ...(currentUser.role === 'admin' ? [{ id: 'users', label: 'Users' }] : []),
    ...(['admin', 'seller'].includes(currentUser.role) ? [{ id: 'categories', label: 'Categories' }] : []),
    ...(['admin', 'seller'].includes(currentUser.role) ? [{ id: 'products', label: 'Products' }] : []),
  ]

  // Redirect customers away from dashboard
  if (currentUser.role === 'customer') {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser.name}</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
                <p className="text-gray-600">
                  {currentUser.role === 'seller' ? 'Orders with Your Products' : 'Total Orders'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                <p className="text-gray-600">Products</p>
              </div>
              {currentUser.role === 'seller' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-2xl font-bold text-gray-900">{categories.length}</h3>
                  <p className="text-gray-600">Categories Used</p>
                </div>
              )}
              {currentUser.role === 'admin' && (
                <>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-2xl font-bold text-gray-900">{categories.length}</h3>
                    <p className="text-gray-600">Categories</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
                    <p className="text-gray-600">Users</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Name</span>
                  <span className="text-gray-900">{currentUser.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <span className="text-gray-900">{currentUser.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Role</span>
                  <span className="text-gray-900 capitalize">{currentUser.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Orders</h3>
            </div>
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">
                  {currentUser.role === 'seller' 
                    ? "No orders have been placed for your products yet."
                    : "No orders have been placed in the system yet."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                          <p className="text-lg font-bold text-green-600 mt-2">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {currentUser.role === 'admin' || 
                           (currentUser.role === 'seller' && order.products.some(p => p.product.sellerId.toString() === currentUser.id)) ? (
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="ml-3 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="placed">Placed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="p-6">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Order Items:</h5>
                      <div className="space-y-3">
                        {order.products.map((orderProduct, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                              <ProductImage
                                src={orderProduct.product.images?.[0]}
                                alt={orderProduct.product.name}
                                showHover={false}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {orderProduct.product.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {orderProduct.product.category?.name}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                Qty: {orderProduct.quantity}
                              </p>
                              <p className="text-xs text-gray-600">
                                ${orderProduct.product.price} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Products</h3>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Add Product
              </button>
            </div>
            
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
                <p className="text-gray-600 mb-6">
                  {currentUser.role === 'seller' 
                    ? "You haven't created any products yet. Start by adding your first product to showcase your inventory."
                    : "No products have been added to the system yet."
                  }
                </p>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                      <div className="h-48 overflow-hidden">
                    <ProductImage
                      src={product.images && product.images.length > 0 ? product.images[0] : null}
                      alt={product.name}
                      showHover={false}
                    />
                  </div>
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
                      <p className="text-xl font-bold text-green-600 mb-2">${product.price}</p>
                      <p className="text-gray-600 mb-4">{product.category?.name}</p>
                                          <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete('product', product.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Categories</h3>
              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Add Category
                </button>
              )}
            </div>
            
            {categories.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Yet</h3>
                <p className="text-gray-600 mb-6">
                  {currentUser.role === 'seller' 
                    ? "You haven't created any products yet, so no categories are shown. Start by adding your first product and it will appear here."
                    : "No categories have been added to the system yet."
                  }
                </p>
                {currentUser.role === 'seller' ? (
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Your First Product
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowAddCategoryModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Your First Category
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h4>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                    {currentUser.role === 'admin' && (
                      <div className="flex gap-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200">
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete('category', category.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Users</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{user.name}</h4>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete('user', user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={(product) => {
          console.log('Product added:', product)
        }}
        categories={allCategoriesData?.getAllCategories || []}
      />
      
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={(category) => {
          console.log('Category added:', category)
        }}
      />

      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false)
          setProductToEdit(null)
        }}
        onProductUpdated={(product) => {
          console.log('Product updated:', product)
        }}
        product={productToEdit}
        categories={allCategoriesData?.getAllCategories || []}
      />
    </div>
  )
}

 