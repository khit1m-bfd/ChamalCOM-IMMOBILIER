'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useSocket } from '@/lib/hooks/useSocket'
import { messagesApi } from '@/lib/api/messages'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  body: string
  sender_id: string
  created_at: string
  is_read?: boolean
  sender?: { id: string; name: string; avatar?: string }
}

interface Props {
  conversationId: string
  otherUser: {
    id: string
    name: string
    avatar?: string
  }
}

export function ChatWindow({ conversationId, otherUser }: Props) {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { user } = useAuthStore()
  const { joinConversation, leaveConversation, sendMessage: socketSend, startTyping, stopTyping, on } = useSocket()

  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)

  const bottomRef     = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>()

  // Fetch initial messages
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await messagesApi.getMessages(conversationId, { page: 1, per_page: 30 })
        const items = Array.isArray(data) ? data : (data.items || data.data || [])
        setMessages([...items].reverse())
        setHasMore((data.pagination?.current_page ?? data.meta?.current_page ?? 1) < (data.pagination?.last_page ?? data.meta?.last_page ?? 1))
        await messagesApi.markRead(conversationId)
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [conversationId])

  // Join socket room
  useEffect(() => {
    joinConversation(conversationId)
    return () => leaveConversation(conversationId)
  }, [conversationId, joinConversation, leaveConversation])

  // Listen for new messages
  useEffect(() => {
    return on('message:new', ({ conversationId: cid, message }: any) => {
      if (cid !== conversationId) return
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
      scrollToBottom()
    })
  }, [conversationId, on])

  // Typing indicator
  useEffect(() => {
    return on('typing:start', ({ userId }: any) => {
      if (userId === otherUser.id) setIsTyping(true)
    })
  }, [on, otherUser.id])

  useEffect(() => {
    return on('typing:stop', ({ userId }: any) => {
      if (userId === otherUser.id) setIsTyping(false)
    })
  }, [on, otherUser.id])

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  useEffect(() => { scrollToBottom() }, [messages.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    startTyping(conversationId)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => stopTyping(conversationId), 1500)
  }

  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setInput('')
    stopTyping(conversationId)

    const optimistic: Message = {
      id:         `temp-${Date.now()}`,
      body:       content,
      sender_id:  user!.id,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    scrollToBottom()

    try {
      const { data } = await messagesApi.sendMessage(conversationId, content)
      const saved = data.message ?? data.data ?? data
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m))
      socketSend(conversationId, saved)
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-2.5', isOwn ? 'flex-row-reverse' : 'flex-row')}
            >
              {!isOwn && (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-muted flex-shrink-0 self-end">
                  {otherUser.avatar ? (
                    <Image src={otherUser.avatar} alt={otherUser.name} width={32} height={32} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {otherUser.name[0]}
                    </div>
                  )}
                </div>
              )}
              <div className={cn('max-w-[70%]', isOwn ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                <div className={cn(
                  'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  isOwn
                    ? 'bg-primary text-white rounded-ee-none'
                    : 'bg-muted text-foreground rounded-es-none'
                )}>
                  {msg.body}
                </div>
                <span className="text-xs text-muted-foreground px-1">
                  {new Date(msg.created_at).toLocaleTimeString(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>
          )
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {otherUser.name[0]}
                </div>
              </div>
              <div className="bg-muted rounded-2xl rounded-es-none px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={ar ? 'اكتب رسالة...' : 'Écrivez un message...'}
            className="flex-1 h-11 bg-muted rounded-2xl px-4 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className={cn('w-4 h-4', ar && 'rotate-180')} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
