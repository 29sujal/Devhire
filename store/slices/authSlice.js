import { createSlice } from '@reduxjs/toolkit'

// Read user from localStorage on app start
const getUserFromStorage = () => {
  if (typeof window === 'undefined') return null  // server side — no localStorage
  try {
    return JSON.parse(localStorage.getItem('devhire_user')) || null
  } catch {
    return null
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),   // null if not logged in
    loading: false,
    error: null,
  },
  reducers: {
    // Called after successful login or register
    setUser: (state, action) => {
      state.user = action.payload
      state.error = null
      // Save to localStorage so login persists on refresh
      localStorage.setItem('devhire_user', JSON.stringify(action.payload))
    },

    // Called on logout
    clearUser: (state) => {
      state.user = null
      localStorage.removeItem('devhire_user')
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setUser, clearUser, setLoading, setError } = authSlice.actions
export default authSlice.reducer