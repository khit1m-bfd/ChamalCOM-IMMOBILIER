'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Search, UserCheck, UserX, Shield, Star, MoreVertical } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatDate, cn } from '@/lib/utils'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  locale: string
  email_verified_at?: string
  is_host_verified?: boolean
  created_at: string
  bookings_count?: number
  properties_count?: number
}

export default function AdminUsersPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [users,    setUsers]    = useState<User[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page,     setPage]     = useState(1)
  const [meta,     setMeta]     = useState<any>(null)
  const [actionUser, setActionUser] = useState<string | null>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', {
        params: { search, role: roleFilter || undefined, page, per_page: 20 },
      })
      setUsers(data.data || [])
      setMeta(data.meta)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [search, roleFilter, page])

  const handleBan = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/ban`)
      fetch()
    } catch { /* silent */ }
    setActionUser(null)
  }

  const handleVerify = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/verify-host`)
      fetch()
    } catch { /* silent */ }
    setActionUser(null)
  }

  const roleColors: Record<string, string> = {
    admin:  'text-red-600 bg-red-50 dark:bg-red-900/20',
    owner:  'text-primary bg-primary/10',
    client: 'text-secondary bg-secondary/10',
  }

  const roleLabels: Record<string, { ar: string; fr: string }> = {
    admin:  { ar: 'مدير',   fr: 'Admin' },
    owner:  { ar: 'مضيف',   fr: 'Hôte' },
    client: { ar: 'عميل',   fr: 'Client' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'إدارة المستخدمين' : 'Gestion des utilisateurs'}</h1>
        {meta && (
          <p className="text-muted-foreground text-sm mt-0.5">
            {meta.total} {ar ? 'مستخدم' : 'utilisateur(s)'}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={ar ? 'بحث عن مستخدم...' : 'Rechercher un utilisateur...'}
            className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30', ar ? 'pr-9 pl-3' : 'pl-9 pr-3')}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">{ar ? 'كل الأدوار' : 'Tous les rôles'}</option>
          <option value="admin">{ar ? 'مدراء' : 'Admins'}</option>
          <option value="owner">{ar ? 'مضيفون' : 'Hôtes'}</option>
          <option value="client">{ar ? 'عملاء' : 'Clients'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                <th className="p-4 text-start font-medium">{ar ? 'المستخدم' : 'Utilisateur'}</th>
                <th className="p-4 text-start font-medium hidden md:table-cell">{ar ? 'الدور' : 'Rôle'}</th>
                <th className="p-4 text-start font-medium hidden lg:table-cell">{ar ? 'تاريخ التسجيل' : 'Inscription'}</th>
                <th className="p-4 text-start font-medium hidden xl:table-cell">{ar ? 'الحجوزات' : 'Réserv.'}</th>
                <th className="p-4 text-start font-medium">{ar ? 'الحالة' : 'Statut'}</th>
                <th className="p-4 text-end font-medium">{ar ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-xl bg-muted animate-pulse" /><div className="space-y-1"><div className="h-3.5 bg-muted rounded w-28 animate-pulse" /><div className="h-2.5 bg-muted rounded w-40 animate-pulse" /></div></div></td>
                      {[1,2,3,4].map(j => <td key={j} className="p-4 hidden md:table-cell"><div className="h-3.5 bg-muted rounded w-16 animate-pulse" /></td>)}
                      <td className="p-4" />
                    </tr>
                  ))
                : users.map(user => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {user.avatar
                              ? <Image src={user.avatar} alt={user.first_name} width={36} height={36} className="object-cover" />
                              : <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">{user.first_name[0]}</div>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.first_name} {user.last_name}</p>
                            <p className="text-muted-foreground text-xs" dir="ltr">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', roleColors[user.role] || 'text-muted-foreground bg-muted')}>
                          {roleLabels[user.role]?.[locale as 'ar' | 'fr'] || user.role}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground text-xs">
                        {formatDate(user.created_at, locale)}
                      </td>
                      <td className="p-4 hidden xl:table-cell text-foreground font-medium">
                        {user.bookings_count ?? '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {user.email_verified_at && (
                            <span className="text-green-500" title={ar ? 'بريد موثّق' : 'Email vérifié'}>
                              <UserCheck className="w-4 h-4" />
                            </span>
                          )}
                          {user.is_host_verified && (
                            <span className="text-primary" title={ar ? 'مضيف موثّق' : 'Hôte vérifié'}>
                              <Star className="w-4 h-4 fill-primary" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-end">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActionUser(actionUser === user.id ? null : user.id)}
                            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {actionUser === user.id && (
                            <div className={cn('absolute top-9 z-10 bg-card border border-border rounded-xl shadow-lg py-1 w-40', ar ? 'left-0' : 'right-0')}>
                              {user.role === 'owner' && !user.is_host_verified && (
                                <button
                                  onClick={() => handleVerify(user.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                  <Shield className="w-3.5 h-3.5 text-primary" />
                                  {ar ? 'توثيق المضيف' : 'Vérifier l\'hôte'}
                                </button>
                              )}
                              <button
                                onClick={() => handleBan(user.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                {ar ? 'حظر المستخدم' : 'Suspendre'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {ar
                ? `عرض ${((page - 1) * 20) + 1}–${Math.min(page * 20, meta.total)} من ${meta.total}`
                : `Affichage ${((page - 1) * 20) + 1}–${Math.min(page * 20, meta.total)} sur ${meta.total}`
              }
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-lg text-xs border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                {ar ? 'السابق' : 'Préc.'}
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="h-8 px-3 rounded-lg text-xs border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                {ar ? 'التالي' : 'Suiv.'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
