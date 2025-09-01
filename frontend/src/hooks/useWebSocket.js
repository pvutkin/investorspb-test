import { useEffect, useRef, useCallback } from 'react'
import io from 'socket.io-client'

export const useWebSocket = (url, options = {}) => {
  const socketRef = useRef(null)

  const connect = useCallback(() => {
    if (socketRef.current) return

    socketRef.current = io(url, {
      transports: ['websocket'],
      ...options,
    })

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected')
    })

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }, [url, options])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }, [])

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    emit,
    on,
    off,
    connected: socketRef.current?.connected || false,
  }
}