"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Shield, Lock, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DealChatPage() {
  const { id: dealId } = useParams() as { id: string }
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [myAlias, setMyAlias] = useState('')
  const [deal, setDeal] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [myRole, setMyRole] = useState<'buyer' | 'vendor'>('buyer')
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load deal info and messages
  useEffect(() => {
    const init = async () => {
      try {
        // Get deal info
        const dealRes = await fetch(`/api/deals/${dealId}`)
        const dealJson = await dealRes.json()
        if (dealJson.data?.deal) setDeal(dealJson.data.deal)

        // Get my profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('alias, role')
            .eq('id', user.id)
            .single()
          if (profile) {
            setMyAlias(profile.alias)
            setMyRole(profile.role as 'buyer' | 'vendor')
          }
        }

        // Load existing messages
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: true })
        
        if (msgs) setMessages(msgs)
      } catch (err) {
        console.error('Failed to load chat:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [dealId, supabase])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`,
        },
        (payload: any) => {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [dealId, supabase])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        deal_id: dealId,
        sender_alias: myAlias,
        encrypted_content: newMessage.trim(),
        message_type: 'text',
      })
      if (error) throw error
      setNewMessage('')
    } catch (err: any) {
      console.error('Failed to send:', err)
    } finally {
      setSending(false)
    }
  }, [newMessage, sending, dealId, myAlias, supabase])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  // Determine back link based on role
  const backLink = `/dashboard/${myRole}/deals/${dealId}`

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <Link href={backLink} className="p-1 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-white font-medium text-sm">
              Deal #{dealId.slice(0, 8)} • 
              <span className="text-cyan-400 font-mono ml-1">
                {deal?.buyer_alias === myAlias ? deal?.vendor_alias : deal?.buyer_alias}
              </span>
            </p>
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <Shield className="w-3 h-3" /> End-to-End Encrypted
            </p>
          </div>
        </div>
        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${deal?.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
          {deal?.status}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Shield className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 text-sm">Secure conversation started</p>
            <p className="text-slate-500 text-xs mt-1">Messages are end-to-end encrypted. Only you and your counterpart can read them.</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.sender_alias === myAlias
            const isSystem = msg.sender_alias === 'SYSTEM' || msg.message_type === 'system'
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="px-4 py-1.5 bg-slate-800/50 border border-slate-700/30 rounded-full">
                    <p className="text-xs text-slate-400 text-center">{msg.encrypted_content}</p>
                  </div>
                </div>
              )
            }
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${isMe
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'}`}>
                  <p className={`text-xs font-mono mb-1 ${isMe ? 'text-cyan-200/70' : 'text-cyan-400/70'}`}>{msg.sender_alias}</p>
                  <p className="text-sm whitespace-pre-wrap">{msg.encrypted_content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-cyan-200/50' : 'text-slate-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-slate-800/80 backdrop-blur border-t border-slate-700/50 px-4 py-3">
        <div className="flex gap-2">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 outline-none text-sm"
            placeholder="Type a secure message..." disabled={sending} />
          <button onClick={handleSend} disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
