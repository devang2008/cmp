"use client"

import { useMarketplaceDetail, useSubmitProposal } from '@/lib/hooks/use-api'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Clock, Send, AlertCircle, Shield, CheckCircle } from 'lucide-react'

export default function OpportunityDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { data, isLoading } = useMarketplaceDetail(id) as { data: any; isLoading: boolean }
  const submitProposal = useSubmitProposal()

  const [form, setForm] = useState({
    cover_note: '',
    proposed_price: 0,
    proposed_timeline_weeks: 4,
    methodology: '',
    relevant_experience: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.cover_note.length < 100) e.cover_note = 'Cover note must be at least 100 characters'
    if (form.proposed_price <= 0) e.proposed_price = 'Price must be positive'
    if (form.methodology.length < 50) e.methodology = 'Methodology must be at least 50 characters'
    if (form.relevant_experience.length < 20) e.relevant_experience = 'Experience must be at least 20 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      await submitProposal.mutateAsync({ ...form, requirement_id: id })
      router.push('/dashboard/vendor/proposals')
    } catch (err: any) {
      setErrors({ submit: err.message })
    }
  }

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-48 bg-slate-800/50 rounded-xl" /></div>

  const req = data?.requirement
  if (!req) return <p className="text-slate-400">Requirement not found.</p>

  const existingProposal = data?.existing_proposal

  return (
    <div className="space-y-6">
      <Link href="/dashboard/vendor/opportunities" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* Requirement Details */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-3">{req.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {req.service_type?.map((t: string) => (
            <span key={t} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs border border-cyan-500/20">{t}</span>
          ))}
          <span className={`px-2.5 py-1 rounded-full text-xs ${req.urgency === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {req.urgency}
          </span>
        </div>
        <p className="text-slate-300 whitespace-pre-wrap mb-6">{req.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
            <p className="text-xs text-slate-500">Budget</p>
            <p className="text-white font-medium">${req.budget_range?.min?.toLocaleString()} – ${req.budget_range?.max?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <Clock className="w-4 h-4 text-blue-400 mb-1" />
            <p className="text-xs text-slate-500">Timeline</p>
            <p className="text-white font-medium">{req.timeline_weeks} weeks</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Engagement</p>
            <p className="text-white text-sm capitalize">{req.engagement_type}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Compliance</p>
            <div className="flex flex-wrap gap-1">
              {req.compliance_needs?.length > 0
                ? req.compliance_needs.map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">{c}</span>)
                : <span className="text-slate-500 text-xs">None</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Proposal or Proposal Form */}
      {existingProposal ? (
        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Your Proposal</h2>
            <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs ${existingProposal.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : existingProposal.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {existingProposal.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div><span className="text-xs text-slate-500">Proposed Price</span><p className="text-white font-medium">${existingProposal.proposed_price?.toLocaleString()}</p></div>
            <div><span className="text-xs text-slate-500">Timeline</span><p className="text-white">{existingProposal.proposed_timeline_weeks} weeks</p></div>
          </div>
          <p className="text-sm text-slate-300">{existingProposal.cover_note}</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Submit Proposal
            </button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Submit Your Proposal</h2>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Cover Note *</label>
                <textarea value={form.cover_note} onChange={e => setForm(p => ({ ...p, cover_note: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" rows={4}
                  placeholder="Explain why you're the right fit..." />
                {errors.cover_note && <p className="text-red-400 text-xs mt-1"><AlertCircle className="w-3 h-3 inline" /> {errors.cover_note}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Proposed Price ($) *</label>
                  <input type="number" value={form.proposed_price || ''} onChange={e => setForm(p => ({ ...p, proposed_price: Number(e.target.value) }))}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" />
                  {errors.proposed_price && <p className="text-red-400 text-xs mt-1">{errors.proposed_price}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Timeline (weeks) *</label>
                  <input type="number" value={form.proposed_timeline_weeks} onChange={e => setForm(p => ({ ...p, proposed_timeline_weeks: Number(e.target.value) }))}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" min={1} max={52} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Methodology *</label>
                <textarea value={form.methodology} onChange={e => setForm(p => ({ ...p, methodology: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" rows={3}
                  placeholder="Describe your approach..." />
                {errors.methodology && <p className="text-red-400 text-xs mt-1">{errors.methodology}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Relevant Experience *</label>
                <textarea value={form.relevant_experience} onChange={e => setForm(p => ({ ...p, relevant_experience: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" rows={2}
                  placeholder="Anonymous references to past work..." />
                {errors.relevant_experience && <p className="text-red-400 text-xs mt-1">{errors.relevant_experience}</p>}
              </div>
              {errors.submit && <p className="text-red-400 text-sm"><AlertCircle className="w-4 h-4 inline" /> {errors.submit}</p>}
              <div className="flex gap-3">
                <button onClick={handleSubmit} disabled={submitProposal.isPending}
                  className="inline-flex px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 items-center justify-center gap-2">
                  {submitProposal.isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit Proposal'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
