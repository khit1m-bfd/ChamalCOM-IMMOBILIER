'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/stores/authStore'

let socketInstance: Socket | null = null

export function useSocket() {
  const { accessToken, user } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken || !user) {
      socketInstance?.disconnect()
      socketInstance = null
      socketRef.current = null
      return
    }

    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth:        { token: accessToken },
        transports:  ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay:    2000,
      })

      socketInstance.on('connect', () => {
        console.log('[Socket.io] Connected:', socketInstance?.id)
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket.io] Disconnected:', reason)
      })

      socketInstance.on('connect_error', (err) => {
        console.warn('[Socket.io] Connection error:', err.message)
      })
    }

    socketRef.current = socketInstance

    return () => {
      // Keep the singleton alive — don't disconnect on component unmount
    }
  }, [accessToken, user])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId)
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId)
  }, [])

  const sendMessage = useCallback((conversationId: string, message: any) => {
    socketRef.current?.emit('message:send', { conversationId, message })
  }, [])

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId })
  }, [])

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId })
  }, [])

  const markRead = useCallback((conversationId: string, messageIds: string[]) => {
    socketRef.current?.emit('message:read', { conversationId, messageIds })
  }, [])

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler)
    return () => { socketRef.current?.off(event, handler) }
  }, [])

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    socketRef.current?.off(event, handler)
  }, [])

  return {
    socket:            socketRef.current,
    isConnected:       socketRef.current?.connected ?? false,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    on,
    off,
  }
}
