import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { getAuthToken, setAuthToken, removeAuthToken, getCurrentUser, setCurrentUser, removeCurrentUser } from '../utils/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = getAuthToken()
      const savedUser = getCurrentUser()

      if (savedToken && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getProfile()
          setUser(response.data)
          setToken(savedToken)
          setCurrentUser(response.data)
        } catch (error) {
          // Token is invalid, clear storage
          removeAuthToken()
          removeCurrentUser()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user: userData, token: authToken } = response.data

      setUser(userData)
      setToken(authToken)
      setAuthToken(authToken)
      setCurrentUser(userData)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Login failed' }
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user: newUser, token: authToken } = response.data

      setUser(newUser)
      setToken(authToken)
      setAuthToken(authToken)
      setCurrentUser(newUser)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Registration failed' }
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      removeAuthToken()
      removeCurrentUser()
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data)
      setCurrentUser(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Update failed' }
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}