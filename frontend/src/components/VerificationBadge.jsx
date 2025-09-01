import React from 'react'
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react'

const VerificationBadge = ({ level, isVerified, size = 'md' }) => {
  const getStatus = () => {
    if (isVerified) {
      return {
        icon: CheckCircle,
        color: 'green',
        text: 'Верифицирован'
      }
    }
    
    if (level === 'advanced') {
      return {
        icon: Clock,
        color: 'blue',
        text: 'На проверке'
      }
    }
    
    return {
      icon: XCircle,
      color: 'gray',
      text: 'Не верифицирован'
    }
  }

  const status = getStatus()
  const Icon = status.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        sizeClasses[size]
      } ${
        status.color === 'green'
          ? 'bg-green-100 text-green-800'
          : status.color === 'blue'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      {status.text}
    </span>
  )
}

export default VerificationBadge