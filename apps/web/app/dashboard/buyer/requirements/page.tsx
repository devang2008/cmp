"use client"

import { useBuyerRequirements } from '@/lib/hooks/use-api'
import Link from 'next/link'
import { useState } from 'react'
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  matched: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export default function RequirementsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useBuyerRequirements(page) as { data: any; isLoading: boolean }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Requirements</h1>
          <p className="text-slate-400 mt-1">Track and manage your security requirements</p>
        </div>
        <Link href="/dashboard/buyer/post-requirement"
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Requirement
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl h-32 border border-slate-700/50" />
        ))}</div>
      ) : data?.items?.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.items.map((req: any) => (
              <Link key={req._id} href={`/dashboard/buyer/requirements/${req._id}`}
                className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{req.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[req.status] || STATUS_COLORS.closed}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{req.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {req.service_type?.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded text-xs">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <span>Budget: ${req.budget_range?.min?.toLocaleString()} – ${req.budget_range?.max?.toLocaleString()}</span>
                      <span>{req.timeline_weeks} weeks</span>
                      <span>{req.proposal_count || 0} proposals</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-400">Page {page} of {data.pages}</span>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No requirements yet</h3>
          <p className="text-slate-400 mb-6">Post your first security requirement to get matched with vendors.</p>
          <Link href="/dashboard/buyer/post-requirement"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium">
            Post Your First Requirement
          </Link>
        </div>
      )}
    </div>
  )
}
