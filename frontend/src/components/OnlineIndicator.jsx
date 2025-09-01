import React from 'react'

const OnlineIndicator = ({ isOnline, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <span
      className={`relative flex ${sizeClasses[size]}`}
      title={isOnline ? 'В сети' : 'Не в сети'}
    >
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
          isOnline ? 'bg-green-400' : 'bg-gray-400'
        } opacity-75`}
      />
      <span
        className={`relative inline-flex rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-500'
        } ${sizeClasses[size]}`}
      />
    </span>
  )
}

export default OnlineIndicator