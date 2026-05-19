'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSocket } from './useSocket'
import { api } from '@/lib/api/client'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  read_at: string | null
  created_at: string
}

export function useNotifications() {
  const { on, off } = useSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  useEffect(() => {
    // Fetch existing unread notifications
    api.get('/notifications?per_page=20').then(r => {
      const data = r.data?.data || []
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.read_at).length)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const removeHandler = on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)])
      if (!notification.read_at) {
        setUnreadCount(c => c + 1)
      }
    })
    return removeHandler
  }, [on])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch { /* silent */ }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }, [])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
