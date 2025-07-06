import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ApolloProvider, InMemoryCache, ApolloClient, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

const httpLink = createHttpLink({
  uri: 'http://localhost:5002/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  console.log('Apollo authLink - token available:', !!token)
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
)
