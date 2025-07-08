import { useQuery, gql } from '@apollo/client'
import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import AddToCartButton from '../components/AddToCartButton'
const GET_PRODUCTS = gql`
  query GetAllProducts {
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

export default function Home() {
  const { loading, error, data } = useQuery(GET_PRODUCTS)
  console.log(data)

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>Error loading products: {error.message}</div>
      </div>
    )
  }

  const products = data?.getAllProducts || []

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1  className=' font-bold text-2xl'>Welcome to Our Store</h1>
        <p  className=' text-blue-500 font-bold'>Discover amazing products</p>
      </div>

      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No products available</h3>
          <p>Check back later for new products!</p>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <Link 
                to={`/product/${product.id}`} 
                style={styles.productLinkArea}
              >
                <div style={styles.productImage}>
                  {product.images && product.images.length > 0 ? (
                                     <ProductImage
                                     src={product.images && product.images.length > 0 ? product.images[0] : null}
                                     alt={product.name}
                                     showHover={true}
                                   />
                  ) : (
                    <div style={styles.placeholderImage}>
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                <div style={styles.productInfo}>
                  <h3 style={styles.productTitle}>{product.name}</h3>
                  <p style={styles.productDescription}>
                    {product.description?.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description}
                  </p>
                  <div style={styles.productMeta}>
                    <span style={styles.category}>{product.category?.name}</span>
                    <span style={styles.price}>${product.price}</span>
                  </div>
                </div>
              </Link>
              
              <div style={styles.addToCartSection}>
                <AddToCartButton product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '0'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  loading: {
    fontSize: '18px',
    color: '#666'
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  error: {
    fontSize: '18px',
    color: '#dc3545',
    textAlign: 'center'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px'
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
    }
  },
  productLinkArea: {
    textDecoration: 'none',
    color: 'inherit'
  },
  productImage: {
    height: '200px',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    color: '#666',
    fontSize: '14px'
  },
  productInfo: {
    padding: '20px'
  },
  productTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    marginTop: '0'
  },
  productDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  category: {
    fontSize: '12px',
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '500'
  },
  price: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#28a745'
  },
  addToCartSection: {
    padding: '20px',
    borderTop: '1px solid #eee'
  }
} 