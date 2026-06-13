"use client"

import { useEffect, useState } from 'react'
import { BadgeCheck, Clock, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

interface Certification {
  id: string
  vendor_alias: string
  cert_name: string
  cert_type: string
  file_url: string | null
  verified: boolean
  verification_score: number
  review_status: string
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  uploaded_at: string
  vendor: { alias: string; role: string; trust_score: number }
}

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'

export default function ModeratorCertifications() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('PENDING')
  const [isLoading, setIsLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [score, setScore] = useState(80)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCerts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/cmp/moderator/certifications?status=${status}&page=${page}&limit=10`)
      const json = await res.json()
      setCerts(json.data.items)
      setTotal(json.data.total)
      setPages(json.data.pages)
    } catch { /* empty */ }
    setIsLoading(false)
  }

  useEffect(() => { fetchCerts() }, [status, page])

  const handleReview = async () => {
    if (!reviewingId || !reviewAction) return
    setSubmitting(true)

    try {
      const body: Record<string, unknown> = { action: reviewAction }
      if (reviewAction === 'approve') body.score = score
      if (reviewAction === 'reject') body.reason = reason
      if (reviewAction === 'approve' && reason) body.reason = reason

      const res = await fetch(`/api/cmp/moderator/certifications/${reviewingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setReviewingId(null)
        setReviewAction(null)
        setScore(80)
        setReason('')
        fetchCerts()
      }
    } catch { /* empty */ }
    setSubmitting(false)
  }

  const statusTabs: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'Pending', value: 'PENDING', color: 'text-amber-400 border-amber-400' },
    { label: 'Approved', value: 'APPROVED', color: 'text-emerald-400 border-emerald-400' },
    { label: 'Rejected', value: 'REJECTED', color: 'text-red-400 border-red-400' },
    { label: 'All', value: 'all', color: 'text-slate-300 border-slate-300' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BadgeCheck className="w-7 h-7 text-amber-400" />
          Certification Review
        </h1>
        <p className="text-slate-400 mt-1">Review and manage vendor certifications</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-slate-800 pb-0">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1) }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              status === tab.value
                ? tab.color
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto text-sm text-slate-500 self-center">{total} total</div>
      </div>

      {/* Certs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <BadgeCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No certifications found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {certs.map(cert => (
            <div key={cert.id} className={`rounded-xl bg-slate-800/50 border p-4 transition-all ${
              reviewingId === cert.id ? 'border-amber-500/50' : 'border-slate-700/50 hover:border-slate-600/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    cert.review_status === 'APPROVED' ? 'bg-emerald-500/10' :
                    cert.review_status === 'REJECTED' ? 'bg-red-500/10' :
                    'bg-amber-500/10'
                  }`}>
                    {cert.review_status === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                     cert.review_status === 'REJECTED' ? <XCircle className="w-5 h-5 text-red-400" /> :
                     <Clock className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cert.cert_name}</h3>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono text-slate-400">{cert.vendor_alias}</span>
                      <span className="mx-1.5">·</span>
                      {cert.cert_type}
                      <span className="mx-1.5">·</span>
                      {new Date(cert.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cert.review_status !== 'PENDING' && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      cert.review_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {cert.review_status === 'APPROVED' ? `Approved (${cert.verification_score}/100)` : 'Rejected'}
                    </span>
                  )}
                  {cert.review_status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReviewingId(cert.id); setReviewAction('approve') }}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setReviewingId(cert.id); setReviewAction('reject') }}
                        className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Panel */}
              {reviewingId === cert.id && reviewAction && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="space-y-3">
                    {reviewAction === 'approve' && (
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-1">
                          Verification Score (0-100)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={score}
                          onChange={e => setScore(Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">
                        {reviewAction === 'reject' ? 'Rejection Reason (required)' : 'Notes (optional)'}
                      </label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder={reviewAction === 'reject' ? 'Explain why this certification is being rejected...' : 'Optional notes...'}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none resize-none h-20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleReview}
                        disabled={submitting || (reviewAction === 'reject' && !reason.trim())}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 ${
                          reviewAction === 'approve'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-red-600 text-white hover:bg-red-500'
                        }`}
                      >
                        {submitting ? 'Processing...' : reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => { setReviewingId(null); setReviewAction(null); setReason('') }}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-400">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
