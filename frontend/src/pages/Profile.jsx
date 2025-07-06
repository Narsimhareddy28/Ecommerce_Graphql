import { useQuery, gql } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

export default function Profile() {
  const { user } = useAuth()

  const { data: userData, loading, error } = useQuery(GET_USER_DATA, {
    skip: !user
  })

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>Error loading profile: {error.message}</div>
      </div>
    )
  }

  const currentUser = userData?.me || user

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Profile</h1>
        <p style={styles.subtitle}>Manage your account information</p>
      </div>

      <div style={styles.profileContainer}>
        <div style={styles.profileCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={styles.userName}>{currentUser.name}</h2>
            <span style={styles.userRole}>{currentUser.role}</span>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Account Information</h3>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Full Name</span>
                <span style={styles.infoValue}>{currentUser.name}</span>
              </div>
              
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email Address</span>
                <span style={styles.infoValue}>{currentUser.email}</span>
              </div>
              
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Account Type</span>
                <span style={styles.infoValue}>
                  <span style={styles.roleBadge}>{currentUser.role}</span>
                </span>
              </div>
              
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>User ID</span>
                <span style={styles.infoValue}>{currentUser.id}</span>
              </div>
            </div>
          </div>

          <div style={styles.actionsSection}>
            <h3 style={styles.sectionTitle}>Account Actions</h3>
            
            <div style={styles.actionsGrid}>
              <button style={styles.actionButton}>
                Edit Profile
              </button>
              
              <button style={styles.actionButton}>
                Change Password
              </button>
              
              {currentUser.role === 'customer' && (
                <button style={styles.actionButton}>
                  View Orders
                </button>
              )}
              
              {currentUser.role === 'seller' && (
                <button style={styles.actionButton}>
                  Manage Products
                </button>
              )}
              
              {currentUser.role === 'admin' && (
                <button style={styles.actionButton}>
                  Admin Panel
                </button>
              )}
            </div>
          </div>

          <div style={styles.dangerSection}>
            <h3 style={styles.dangerTitle}>Danger Zone</h3>
            <p style={styles.dangerText}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button style={styles.dangerButton}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
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
  profileContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '600px'
  },
  avatarSection: {
    textAlign: 'center',
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e9ecef'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 auto 20px auto'
  },
  userName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0'
  },
  userRole: {
    fontSize: '14px',
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  infoSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px'
  },
  infoGrid: {
    display: 'grid',
    gap: '20px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  infoValue: {
    color: '#666',
    fontSize: '14px'
  },
  roleBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  actionsSection: {
    marginBottom: '40px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px'
  },
  actionButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  dangerSection: {
    padding: '20px',
    backgroundColor: '#fff5f5',
    borderRadius: '8px',
    border: '1px solid #fed7d7'
  },
  dangerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#c53030',
    marginBottom: '10px'
  },
  dangerText: {
    fontSize: '14px',
    color: '#744210',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }
} 