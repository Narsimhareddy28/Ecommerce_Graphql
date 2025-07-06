import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $role: String) {
    register(name: $name, email: $email, password: $password, role: $role) {
      id
      name
      email
      role
      token
    }
  }
`

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      authLogin(data.register, data.register.token)
      navigate('/')
    },
    onError: (err) => setError(err.message)
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = e => {
    e.preventDefault()
    setError('')
    registerMutation({ variables: form })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our e-commerce platform</p>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input 
                  name="name" 
                  placeholder="Enter your full name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

 