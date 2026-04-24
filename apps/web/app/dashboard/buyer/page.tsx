"use client"

import { useBuyerStats } from '@/lib/hooks/use-api'
import Link from 'next/link'
import { Shield, FileText, MessageSquare, CheckCircle, Clock, ArrowRight, Activity } from 'lucide-react'

export default function BuyerDashboard() {
  const { data: stats, isLoading } = useBuyerStats() as { data: any; isLoading: boolean }

  const statCards = [
    { label: 'Active Requirements', value: stats?.active_requirements ?? '—', icon: FileText, color: 'from-cyan-500 to-blue-600', href: '/dashboard/buyer/requirements' },
    { label: 'Proposals Received', value: stats?.proposals_received ?? '—', icon: MessageSquare, color: 'from-purple-500 to-pink-600', href: '/dashboard/buyer/proposals' },
    { label: 'Active Deals', value: stats?.active_deals ?? '—', icon: Clock, color: 'from-amber-500 to-orange-600', href: '/dashboard/buyer/deals' },
    { label: 'Completed Deals', value: stats?.completed_deals ?? '—', icon: CheckCircle, color: 'from-emerald-500 to-green-600', href: '/dashboard/buyer/deals' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" />
            Buyer Command Center
          </h1>
          <p className="text-slate-400 mt-1">Monitor your security requirements and deals</p>
        </div>
        <Link href="/dashboard/buyer/post-requirement"
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2">
          Post Requirement <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-5 hover:border-cyan-500/30 transition-all">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-[40px] group-hover:opacity-20 transition-opacity`} />
            <card.icon className="w-5 h-5 text-slate-400 mb-3" />
            <p className="text-3xl font-bold text-white">
              {isLoading ? <span className="animate-pulse bg-slate-700 rounded w-12 h-8 inline-block" /> : card.value}
            </p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Empty State / Welcome Banner */}
      {!isLoading && stats?.active_requirements === 0 && stats?.active_deals === 0 && (
        <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield className="w-32 h-32 text-cyan-400" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to your anonymous command center</h2>
            <p className="text-slate-300 max-w-xl mb-6 leading-relaxed">
              You are completely anonymous. No one can see your company details until you explicitly reveal them in a deal. Start by posting your first cybersecurity requirement.
            </p>
            <Link href="/dashboard/buyer/post-requirement"
              className="inline-flex px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-cyan-50 transition-colors gap-2 items-center">
              <FileText className="w-5 h-5" /> Post First Requirement
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-cyan-400" /> Recent Activity
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="h-4 bg-slate-700 rounded flex-1" />
                <div className="h-4 w-24 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : stats?.recent_activity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_activity.map((event: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-700/30 last:border-0">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-slate-300 flex-1">
                  <span className="text-white font-medium">{event.action_type}</span>
                  {' '}{event.target_type && `on ${event.target_type}`}
                </span>
                <span className="text-slate-500 text-xs">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No recent activity. Post your first requirement to get started.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/buyer/post-requirement" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all group">
          <FileText className="w-6 h-6 text-cyan-400 mb-2" />
          <h3 className="font-semibold text-white">Post Requirement</h3>
          <p className="text-sm text-slate-400 mt-1">Describe your security needs anonymously</p>
        </Link>
        <Link href="/dashboard/buyer/requirements" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
          <MessageSquare className="w-6 h-6 text-purple-400 mb-2" />
          <h3 className="font-semibold text-white">Review Proposals</h3>
          <p className="text-sm text-slate-400 mt-1">Evaluate vendor submissions</p>
        </Link>
        <Link href="/dashboard/buyer/deals" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
          <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
          <h3 className="font-semibold text-white">Manage Deals</h3>
          <p className="text-sm text-slate-400 mt-1">Track active engagements</p>
        </Link>
      </div>
    </div>
  )
}
