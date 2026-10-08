import axios from 'axios'
import { getSchoolCode, getSchoolBasePath } from '../utils/schoolCode'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-School-Domain': window.location.hostname,   // <-- ye nayi line
    ...(getSchoolCode() && { 'X-School-Code': getSchoolCode() }),
  },
})

// Attach the JWT token to every request, if one exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the token is invalid/expired, send the user back to Login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const isAuthCall = /\/(verify-otp|send-otp|resend-otp|registration)(\/|\?|$)/.test(url)

    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('authToken')
      window.location.href = `${getSchoolBasePath()}/login`
    }
    return Promise.reject(error)
  }
)

export default apiClient