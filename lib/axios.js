import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
})

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const user = JSON.parse(localStorage.getItem('devhire_user') || 'null')
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
  }
  return config
})

export default API