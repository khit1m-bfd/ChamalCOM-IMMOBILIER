'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { MessageSquare, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatDate, cn } from '@/lib/utils'

interface Conversation {
  id: string
  other_participant: { name: string; email: string; role: string }
  property?: { title: { ar: string; fr?: string } }
  last_message?: { body: string; created_at: string }
  unread_count: number
}

export default function AdminMessagesPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const result = await api.get('/conversations')
        const list = Array.isArray(result.data) ? result.data : (result.data?.items ?? result.data?.data ?? [])
        setConversations(list)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'الرسائل' : 'Messages'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {ar ? 'إدارة مراسلات المنصة' : 'Gérer les communications de la plateforme'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'خطأ في التحميل' : 'Erreur de chargement'}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'لا توجد محادثات' : 'Aucune conversation'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {conversations.map((conv, i) => {
            const title = conv.property
              ? (ar ? conv.property.title?.ar : (conv.property.title?.fr || conv.property.title?.ar))
              : (ar ? 'محادثة عامة' : 'Conversation générale')
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-foreground text-sm">{conv.other_participant?.name}</p>
                    {conv.unread_count > 0 && (
                      <span className="text-xs bg-primary text-white rounded-full px-1.5 py-0.5">{conv.unread_count}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.last_message?.body}</p>
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{title}</p>
                  {conv.last_message?.created_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(conv.last_message.created_at, locale)}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
