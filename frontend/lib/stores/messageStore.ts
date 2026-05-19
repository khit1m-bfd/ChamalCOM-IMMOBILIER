'use client'

import { create } from 'zustand'
import { api } from '@/lib/api/client'

export interface OtherUser {
  id: string
  name: string
  avatar?: string
}

export interface ConversationProperty {
  id: string
  title: { ar: string; fr?: string }
  cover_image?: string
}

export interface Conversation {
  id: string
  other_participant: OtherUser
  property: ConversationProperty | null
  last_message: {
    body: string
    is_mine: boolean
    created_at: string
  } | null
  unread_count: number
  last_message_at: string | null
  created_at: string
}

export interface Message {
  id: string
  body: string
  sender_id: string
  is_read: boolean
  is_mine: boolean
  sender?: { id: string; name: string; avatar?: string }
  created_at: string
}

interface MessageState {
  conversations:      Conversation[]
  activeId:           string | null
  messages:           Record<string, Message[]>  // keyed by conversationId
  unreadTotal:        number
  loading:            boolean
  sendingMessage:     boolean

  fetchConversations: ()                                          => Promise<void>
  fetchMessages:      (conversationId: string)                   => Promise<void>
  sendMessage:        (conversationId: string, body: string)     => Promise<void>
  markRead:           (conversationId: string)                   => Promise<void>
  createConversation: (recipientId: string, propertyId: string, message: string) => Promise<Conversation>
  setActive:          (id: string | null)                        => void
  appendMessage:      (conversationId: string, message: Message) => void
  fetchUnreadCount:   ()                                         => Promise<void>
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations:  [],
  activeId:       null,
  messages:       {},
  unreadTotal:    0,
  loading:        false,
  sendingMessage: false,

  fetchConversations: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/conversations')
      const list: Conversation[] = Array.isArray(data)
        ? data
        : (data.items ?? data.data ?? [])
      set({
        conversations: list,
        unreadTotal:   list.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
      })
    } catch { /* silent */ } finally {
      set({ loading: false })
    }
  },

  fetchMessages: async (conversationId) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`)
      const items: Message[] = Array.isArray(data)
        ? data
        : (data.items ?? data.data ?? [])
      set(s => ({
        messages: { ...s.messages, [conversationId]: [...items].reverse() },
      }))
    } catch { /* silent */ } finally {
      set({ loading: false })
    }
  },

  sendMessage: async (conversationId, body) => {
    set({ sendingMessage: true })

    const optimistic: Message = {
      id:         `temp-${Date.now()}`,
      body,
      sender_id:  '',   // filled by server
      is_read:    false,
      is_mine:    true,
      created_at: new Date().toISOString(),
    }

    set(s => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), optimistic],
      },
    }))

    try {
      const { data } = await api.post(`/conversations/${conversationId}/messages`, { message: body })
      const saved: Message = data.data ?? data

      set(s => ({
        messages: {
          ...s.messages,
          [conversationId]: s.messages[conversationId].map(m =>
            m.id === optimistic.id ? saved : m
          ),
        },
        conversations: s.conversations.map(c =>
          c.id === conversationId
            ? { ...c, last_message: { body, is_mine: true, created_at: saved.created_at } }
            : c
        ),
      }))
    } catch {
      // Remove optimistic on failure
      set(s => ({
        messages: {
          ...s.messages,
          [conversationId]: s.messages[conversationId].filter(m => m.id !== optimistic.id),
        },
      }))
      throw new Error('Message failed to send')
    } finally {
      set({ sendingMessage: false })
    }
  },

  markRead: async (conversationId) => {
    try {
      await api.post(`/conversations/${conversationId}/read`)
      set(s => ({
        conversations: s.conversations.map(c =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ),
        unreadTotal: Math.max(
          0,
          s.unreadTotal - (s.conversations.find(c => c.id === conversationId)?.unread_count ?? 0)
        ),
      }))
    } catch { /* silent */ }
  },

  createConversation: async (recipientId, propertyId, message) => {
    const { data } = await api.post('/conversations', {
      recipient_id: recipientId,
      property_id:  propertyId,
      message,
    })
    const conv: Conversation = data.data ?? data
    set(s => ({ conversations: [conv, ...s.conversations] }))
    return conv
  },

  setActive: (id) => set({ activeId: id }),

  appendMessage: (conversationId, message) => {
    set(s => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), message],
      },
      conversations: s.conversations.map(c =>
        c.id === conversationId
          ? {
              ...c,
              last_message: { body: message.body, is_mine: message.is_mine, created_at: message.created_at },
              unread_count: message.is_mine ? c.unread_count : c.unread_count + 1,
            }
          : c
      ),
      unreadTotal: message.is_mine ? s.unreadTotal : s.unreadTotal + 1,
    }))
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/messages/unread-count')
      set({ unreadTotal: data.count ?? 0 })
    } catch { /* silent */ }
  },
}))
