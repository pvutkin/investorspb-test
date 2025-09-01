export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateName = (name) => {
  return name.length >= 2 && name.length <= 50
}

export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateFundingAmount = (amount) => {
  return amount >= 0 && amount <= 1000000000 // 1 billion
}

export const validateYear = (year) => {
  const currentYear = new Date().getFullYear()
  return year >= 1900 && year <= currentYear
}

export const validateFile = (file, options = {}) => {
  const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Неподдерживаемый формат файла' }
  }

  if (file.size > maxSize * 1024 * 1024) {
    return { isValid: false, error: `Размер файла превышает ${maxSize}MB` }
  }

  return { isValid: true, error: null }
}

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== ''
}

export const validateArray = (array, minLength = 0) => {
  return Array.isArray(array) && array.length >= minLength
}

export const getValidationErrors = (fields, values) => {
  const errors = {}

  Object.entries(fields).forEach(([fieldName, validation]) => {
    const value = values[fieldName]
    
    if (validation.required && !validateRequired(value)) {
      errors[fieldName] = validation.requiredMessage || 'Обязательное поле'
      return
    }

    if (value && validation.type) {
      switch (validation.type) {
        case 'email':
          if (!validateEmail(value)) {
            errors[fieldName] = 'Некорректный email'
          }
          break
        case 'phone':
          if (!validatePhone(value)) {
            errors[fieldName] = 'Некорректный номер телефона'
          }
          break
        case 'url':
          if (!validateURL(value)) {
            errors[fieldName] = 'Некорректный URL'
          }
          break
        case 'number':
          if (isNaN(Number(value))) {
            errors[fieldName] = 'Должно быть числом'
          } else if (validation.min !== undefined && Number(value) < validation.min) {
            errors[fieldName] = `Минимальное значение: ${validation.min}`
          } else if (validation.max !== undefined && Number(value) > validation.max) {
            errors[fieldName] = `Максимальное значение: ${validation.max}`
          }
          break
        case 'year':
          if (!validateYear(Number(value))) {
            errors[fieldName] = 'Некорректный год'
          }
          break
      }
    }

    if (value && validation.pattern && !validation.pattern.test(value)) {
      errors[fieldName] = validation.patternMessage || 'Неверный формат'
    }

    if (value && validation.minLength && value.length < validation.minLength) {
      errors[fieldName] = `Минимальная длина: ${validation.minLength} символов`
    }

    if (value && validation.maxLength && value.length > validation.maxLength) {
      errors[fieldName] = `Максимальная длина: ${validation.maxLength} символов`
    }
  })

  return errors
}