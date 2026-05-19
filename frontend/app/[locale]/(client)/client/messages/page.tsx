'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/authStore'
import { ChatWindow } from '@/components/messaging/ChatWindow'
import { cn, formatDate } from '@/lib/utils'

interface Conversation {
  id: string
  property: { id: string; title: { ar: string; fr?: string }; cover_image?: string }
  other_participant: { id: string; name: string; avatar?: string }
  last_message: { body: string; created_at: string; is_mine: boolean } | null
  unread_count: number
  updated_at: string
}

export default function ClientMessagesPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { user } = useAuthStore()

  const [conversations,       setConversations]       = useState<Conversation[]>([])
  const [activeConversation,  setActiveConversation]  = useState<Conversation | null>(null)
  const [search,              setSearch]              = useState('')
  const [loading,             setLoading]             = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/messages/conversations')
        setConversations(Array.isArray(data) ? data : (data.items || data.data || []))
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = conversations.filter(c => {
    const name = c.other_participant?.name?.toLowerCase() ?? ''
    const title = (ar ? c.property?.title?.ar : (c.property?.title?.fr || c.property?.title?.ar))?.toLowerCase() ?? ''
    return name.includes(search.toLowerCase()) || title.includes(search.toLowerCase())
  })

  const markRead = (id: string) => {
    setConversations(cs => cs.map(c => c.id === id ? { ...c, unread_count: 0 } : c))
  }

  return (
    <div className="space-y-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'الرسائل' : 'Messages'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{ar ? 'تواصل مع المضيفين' : 'Communiquez avec les hôtes'}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
        <div className="flex h-full">

          {/* Conversation list */}
          <div className={cn('flex flex-col border-e border-border', activeConversation ? 'hidden md:flex w-72 flex-shrink-0' : 'flex-1 md:w-72 md:flex-none')}>

            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={ar ? 'بحث...' : 'Rechercher...'}
                  className={cn('w-full h-9 bg-muted rounded-xl text-sm border border-transparent focus:outline-none focus:border-primary/40', ar ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">
                    {search ? (ar ? 'لا نتائج' : 'Aucun résultat') : (ar ? 'لا رسائل بعد' : 'Aucune conversation')}
                  </p>
                </div>
              ) : (
                filtered.map((conv, i) => {
                  const name  = conv.other_participant?.name ?? ''
                  const title = ar ? conv.property?.title?.ar : (conv.property?.title?.fr || conv.property?.title?.ar)
                  const isActive = activeConversation?.id === conv.id

                  return (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0, x: ar ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => { setActiveConversation(conv); markRead(conv.id) }}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 text-start hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0',
                        isActive && 'bg-primary/5 border-s-2 border-s-primary'
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {conv.other_participant.avatar ? (
                          <Image src={conv.other_participant.avatar} alt={name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                            {conv.other_participant.name?.[0]}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-sm text-foreground truncate">{name}</span>
                          {conv.last_message && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDate(conv.last_message.created_at, locale)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{title}</p>
                        {conv.last_message && (
                          <p className={cn('text-xs truncate mt-0.5', conv.unread_count > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                            {conv.last_message.is_mine && (ar ? 'أنت: ' : 'Vous : ')}{conv.last_message.body}
                          </p>
                        )}
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat window */}
          <div className={cn('flex-1', !activeConversation && 'hidden md:flex')}>
            {activeConversation ? (
              <ChatWindow
                conversationId={activeConversation.id}
                otherUser={activeConversation.other_participant}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {ar ? 'اختر محادثة لبدء الدردشة' : 'Sélectionnez une conversation'}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
