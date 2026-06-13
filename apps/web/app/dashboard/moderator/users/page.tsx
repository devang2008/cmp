"use client"

import { useEffect, useState, useCallback } from 'react'
import { Users, Search, ChevronLeft, ChevronRight, ArrowUpDown, Shield, TrendingUp, TrendingDown } from 'lucide-react'

interface User {
  id: string
  alias: string
  role: string
  trust_score: number
  email_verified: boolean
  onboarding_complete: boolean
  rating_as_vendor: number | null
  rating_as_buyer: number | null
  total_vendor_reviews: number
  total_buyer_reviews: number
  created_at: string
  _count: { certifications: number }
}

interface UsersResponse {
  items: User[]
  total: number
  page: number
  pages: number
}

export default function ModeratorUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState('desc')

  // Trust adjustment modal state
  const [adjustUser, setAdjustUser] = useState<User | null>(null)
  const [adjustment, setAdjustment] = useState(0)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        role: roleFilter,
        search,
        page: String(page),
        limit: '20',
        sort,
        order,
      })
      const res = await fetch(`/api/cmp/moderator/users?${params}`)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, search, page, sort, order])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(field)
      setOrder('desc')
    }
    setPage(1)
  }

  const handleTrustAdjust = async () => {
    if (!adjustUser || !reason.trim()) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/cmp/moderator/users/${adjustUser.alias}/trust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment, reason: reason.trim() }),
      })
      const json = await res.json()
      if (res.ok) {
        setFeedback({ type: 'success', msg: `Trust score adjusted to ${json.data.new_trust_score}` })
        setAdjustUser(null)
        setAdjustment(0)
        setReason('')
        fetchUsers()
      } else {
        setFeedback({ type: 'error', msg: json.error || 'Failed to adjust trust score' })
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Network error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleTabs = [
    { label: 'All', value: 'all' },
    { label: 'Vendors', value: 'vendor' },
    { label: 'Buyers', value: 'buyer' },
  ]

  const trustColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-amber-400" />
          User Management
        </h1>
        <p className="text-slate-400 mt-1">View platform users and manage trust scores</p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Role tabs */}
        <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
          {roleTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setRoleFilter(tab.value); setPage(1) }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                roleFilter === tab.value
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by alias..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </form>

        {/* Total */}
        <span className="text-xs text-slate-500 ml-auto">
          {data ? `${data.total} users` : '—'}
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {[
                  { label: 'Alias', key: 'alias' },
                  { label: 'Role', key: null },
                  { label: 'Trust Score', key: 'trust_score' },
                  { label: 'Certs', key: null },
                  { label: 'Joined', key: 'created_at' },
                  { label: 'Actions', key: null },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${col.key ? 'cursor-pointer hover:text-white select-none' : ''}`}
                    onClick={() => col.key && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && sort === col.key && <ArrowUpDown className="w-3 h-3 text-amber-400" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-5 bg-slate-700/50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.items.map(user => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
                          {user.alias.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-mono text-sm text-white">{user.alias}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'vendor' ? 'bg-purple-500/20 text-purple-400'
                        : user.role === 'buyer' ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold ${trustColor(user.trust_score)}`}>
                        {user.trust_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user._count.certifications}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setAdjustUser(user); setAdjustment(0); setReason(''); setFeedback(null) }}
                        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" /> Adjust Trust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <span className="text-xs text-slate-500">
              Page {data.page} of {data.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trust Adjustment Modal */}
      {adjustUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1">Adjust Trust Score</h3>
            <p className="text-sm text-slate-400 mb-5">
              Adjusting trust for <span className="text-amber-400 font-mono">{adjustUser.alias}</span>
              <span className="ml-2">Current: <span className={`font-bold ${trustColor(adjustUser.trust_score)}`}>{adjustUser.trust_score}</span></span>
            </p>

            <div className="space-y-4">
              {/* Adjustment slider */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">
                  Adjustment: <span className={`text-lg font-bold ${adjustment > 0 ? 'text-emerald-400' : adjustment < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {adjustment > 0 ? '+' : ''}{adjustment}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={adjustment}
                    onChange={e => setAdjustment(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>-50</span>
                  <span>0</span>
                  <span>+50</span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">Reason *</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Enter reason for adjustment..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAdjustUser(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrustAdjust}
                disabled={isSubmitting || !reason.trim() || adjustment === 0}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adjusting...' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
