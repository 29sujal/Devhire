'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'
import axios from 'axios'

// Inner component to access Redux
function AuthSync() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    // Refresh user data from DB on app load to get latest isPremium etc
    if (user?.token) {
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(({ data }) => {
        dispatch(setUser({ ...user, ...data }))
      }).catch(() => {
        // Token expired or invalid — keep existing state
      })
    }
  }, [])

  return null
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthSync />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />
      {children}
    </Provider>
  )
}