"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateRequirement } from '@/lib/hooks/use-api'
import { SERVICE_TYPES, COMPLIANCE_OPTIONS } from '@/lib/validations'
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const DRAFT_KEY = 'shield_req_draft'

export default function PostRequirementPage() {
  const router = useRouter()
  const createReq = useCreateRequirement()

  const [form, setForm] = useState({
    title: '',
    description: '',
    service_type: [] as string[],
    budget_range: { min: 0, max: 0 },
    timeline_weeks: 4,
    compliance_needs: [] as string[],
    tech_stack: [] as string[],
    engagement_type: 'one-time' as 'one-time' | 'ongoing' | 'retainer',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  })
  const [techInput, setTechInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) setForm(JSON.parse(saved))
    } catch {}
  }, [])

  // Auto-save draft every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    }, 5000)
    return () => clearInterval(timer)
  }, [form])

  const toggleArray = useCallback((key: 'service_type' | 'compliance_needs', value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }))
  }, [])

  const addTechTag = useCallback(() => {
    if (techInput.trim() && !form.tech_stack.includes(techInput.trim())) {
      setForm(prev => ({ ...prev, tech_stack: [...prev.tech_stack, techInput.trim()] }))
      setTechInput('')
    }
  }, [techInput, form.tech_stack])

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.title.length < 10) e.title = 'Title must be at least 10 characters'
    if (form.description.length < 50) e.description = 'Description must be at least 50 characters'
    if (form.service_type.length === 0) e.service_type = 'Select at least one service type'
    if (form.budget_range.min <= 0) e.budget_min = 'Min budget must be positive'
    if (form.budget_range.max <= form.budget_range.min) e.budget_max = 'Max must be greater than min'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      const result: any = await createReq.mutateAsync(form)
      localStorage.removeItem(DRAFT_KEY)
      router.push(`/dashboard/buyer/requirements/${result.id}`)
    } catch (err: any) {
      setErrors({ submit: err.message })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/buyer/requirements" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400">
        <ArrowLeft className="w-4 h-4" /> Back to Requirements
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Post a Security Requirement</h1>
        <span className="flex items-center gap-1.5 text-xs text-slate-500"><Save className="w-3 h-3" /> Auto-saving draft</span>
      </div>

      <div className="space-y-6 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
          <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none"
            placeholder="e.g. Penetration Testing for SaaS Platform" maxLength={100} />
          {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
          <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 outline-none min-h-[120px] resize-y"
            placeholder="Describe your security requirements in detail..." maxLength={2000} />
          <p className="text-xs text-slate-500 mt-1">{form.description.length}/2000</p>
          {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
        </div>

        {/* Service Types */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Types *</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPES.map(st => (
              <button key={st} type="button" onClick={() => toggleArray('service_type', st)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${form.service_type.includes(st)
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
                {st}
              </button>
            ))}
          </div>
          {errors.service_type && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.service_type}</p>}
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Budget ($) *</label>
            <input type="number" value={form.budget_range.min || ''} onChange={e => setForm(prev => ({ ...prev, budget_range: { ...prev.budget_range, min: Number(e.target.value) } }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" placeholder="5000" />
            {errors.budget_min && <p className="text-red-400 text-xs mt-1">{errors.budget_min}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Budget ($) *</label>
            <input type="number" value={form.budget_range.max || ''} onChange={e => setForm(prev => ({ ...prev, budget_range: { ...prev.budget_range, max: Number(e.target.value) } }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" placeholder="25000" />
            {errors.budget_max && <p className="text-red-400 text-xs mt-1">{errors.budget_max}</p>}
          </div>
        </div>

        {/* Timeline and Engagement */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Timeline (weeks) *</label>
            <input type="number" value={form.timeline_weeks} onChange={e => setForm(prev => ({ ...prev, timeline_weeks: Number(e.target.value) }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" min={1} max={52} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Engagement Type *</label>
            <select value={form.engagement_type} onChange={e => setForm(prev => ({ ...prev, engagement_type: e.target.value as any }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none">
              <option value="one-time">One-time</option>
              <option value="ongoing">Ongoing</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Urgency *</label>
          <div className="flex gap-3">
            {(['low', 'medium', 'high', 'critical'] as const).map(u => (
              <button key={u} type="button" onClick={() => setForm(prev => ({ ...prev, urgency: u }))}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${form.urgency === u
                  ? u === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : u === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-700'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Compliance Needs (optional)</label>
          <div className="flex flex-wrap gap-2">
            {COMPLIANCE_OPTIONS.map(c => (
              <button key={c} type="button" onClick={() => toggleArray('compliance_needs', c)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${form.compliance_needs.includes(c)
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-700'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Tech Stack (optional)</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechTag())}
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none"
              placeholder="Add a technology..." />
            <button type="button" onClick={addTechTag} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tech_stack.map(t => (
              <span key={t} className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5">
                {t} <button onClick={() => setForm(prev => ({ ...prev, tech_stack: prev.tech_stack.filter(x => x !== t) }))} className="text-slate-500 hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        {errors.submit && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.submit}</p>}
        <button onClick={handleSubmit} disabled={createReq.isPending}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {createReq.isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Publishing...
            </>
          ) : (
            <><Send className="w-4 h-4" /> Publish Requirement</>
          )}
        </button>
      </div>
    </div>
  )
}
