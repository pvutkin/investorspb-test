export const getAuthToken = () => localStorage.getItem('token')

export const setAuthToken = (token) => localStorage.setItem('token', token)

export const removeAuthToken = () => localStorage.removeItem('token')

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const removeCurrentUser = () => {
  localStorage.removeItem('user')
}

export const isAuthenticated = () => {
  const token = getAuthToken()
  const user = getCurrentUser()
  return !!(token && user)
}

export const getUserType = () => {
  const user = getCurrentUser()
  return user?.user_type
}

export const hasSubscription = async () => {
  try {
    const response = await paymentsAPI.checkFeatures()
    return response.data.has_active_subscription
  } catch (error) {
    return false
  }
}

export const checkFeature = async (feature) => {
  try {
    const response = await paymentsAPI.checkFeatures()
    return response.data.features[feature] || false
  } catch (error) {
    return false
  }
} 