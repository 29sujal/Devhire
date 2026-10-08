import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // We will add more reducers here later
    // jobs: jobsReducer,
    // applications: applicationsReducer,
  },
})