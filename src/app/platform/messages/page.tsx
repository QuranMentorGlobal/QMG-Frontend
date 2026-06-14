'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  first_name: string
  last_name: string
  role: string
  avatar_url: string | null
}

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  child_id: string | null
  last_message: string | null
  last_message_at: string | null
  other: Profile
  child_name?: string
  unread: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  is_read: boolean
  created_at: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ name, url, size = 10 }: { name: string; url?: string | null; size?: number }) {
  const s = `w-${size} h-${size}`
  if (url) return <img src={url} alt={name} className={`${s} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white`}
      style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', fontSize: size > 8 ? 14 : 11 }}>
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-xl ${className}`} />
}

// ── New Conversation Modal ─────────────────────────────────────────────────────

function NewConvModal({ myId, myRole, children, onClose, onCreated }: {
  myId: string
  myRole: string
  children: Profile[]
  onClose: () => void
  onCreated: (convId: string) => void
}) {
  const supabase = createClient()
  const [searchEmail, setSearchEmail] = useState('')
  const [found, setFound]             = useState<Profile | null>(null)
  const [searching, setSearching]     = useState(false)
  const [error, setError]             = useState('')
  const [creating, setCreating]       = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>('')

  async function search() {
    if (!searchEmail.trim()) return
    setSearching(true); setError(''); setFound(null)
    const { data } = await (supabase as any).from('profiles').select('id, first_name, last_name, role, avatar_url').eq('email', searchEmail.trim().toLowerCase()).single()
    setSearching(false)
    if (!data) { setError('No user found with that email.'); return }
    if (data.id === myId) { setError('You cannot message yourself.'); return }
    setFound(data as Profile)
  }

  async function startConversation() {
    if (!found) return
    setCreating(true)
    const p1 = myId < found.id ? myId : found.id
    const p2 = myId < found.id ? found.id : myId

    const { data: existing } = await (supabase as any)
      .from('conversations').select('id').eq('participant_1', p1).eq('participant_2', p2)
      .is('child_id', selectedChild || null).single()

    if (existing) { onCreated(existing.id); return }

    const { data: newConv } = await (supabase as any)
      .from('conversations').insert({ participant_1: p1, participant_2: p2, child_id: selectedChild || null }).select('id').single()

    setCreating(false)
    if (newConv) onCreated(newConv.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div className="px-6 py-5 border-b flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>New Conversation</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* If parent: show child selector */}
          {myRole === 'parent' && children.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
                Regarding child (optional)
              </label>
              <select
                value={selectedChild}
                onChange={e => setSelectedChild(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid #E0DDD5', fontFamily: "'DM Sans', sans-serif" }}>
                <option value="">General conversation</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
              Search by email
            </label>
            <div className="flex gap-2">
              <input
                value={searchEmail} onChange={e => { setSearchEmail(e.target.value); setError(''); setFound(null) }}
                onKeyDown={e => { if (e.key === 'Enter') search() }}
                placeholder="teacher@example.com"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid #E0DDD5', fontFamily: "'DM Sans', sans-serif" }}
              />
              <button onClick={search} disabled={searching}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#1B5E37' }}>
                {searching ? '…' : 'Find'}
              </button>
            </div>
            {error && <p className="text-xs mt-1.5" style={{ color: '#DC2626' }}>{error}</p>}
          </div>

          {found && (
            <div className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(27,94,55,0.06)', border: '1.5px solid #1B5E37' }}>
              <Avatar name={`${found.first_name} ${found.last_name}`} url={found.avatar_url} size={10} />
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>{found.first_name} {found.last_name}</p>
                <p className="text-xs capitalize mt-0.5" style={{ color: '#6B7A6B' }}>{found.role}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }}>Found ✓</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#F5F0E8', color: '#1B5E37' }}>Cancel</button>
          <button onClick={startConversation} disabled={!found || creating}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: '#1B5E37' }}>
            {creating ? 'Starting…' : 'Start Conversation'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const supabase     = createClient()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const bottomRef    = useRef<HTMLDivElement>(null)

  const [me, setMe]                       = useState<Profile | null>(null)
  const [convs, setConvs]                 = useState<Conversation[]>([])
  const [activeConv, setActiveConv]       = useState<Conversation | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [draft, setDraft]                 = useState('')
  const [sending, setSending]             = useState(false)
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [showNewConv, setShowNewConv]     = useState(false)
  const [myChildren, setMyChildren]       = useState<Profile[]>([])

  // On mount: load user + conversations
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await (supabase as any).from('profiles').select('id, first_name, last_name, role, avatar_url').eq('id', user.id).single()
      if (!prof) { router.replace('/auth/login'); return }
      setMe(prof as Profile)

      // Load children if parent
      if (prof.role === 'parent') {
        const { data: childLinks } = await (supabase as any)
          .from('parent_children')
          .select('profiles!parent_children_child_id_fkey(id, first_name, last_name, role, avatar_url)')
          .eq('parent_id', user.id)
        const kids = (childLinks ?? []).map((r: any) => r.profiles).filter(Boolean)
        setMyChildren(kids)
      }

      await loadConversations(prof.id)

      // Open specific conv if ?conv= param
      const convParam = searchParams.get('conv')
      if (convParam) {
        // Will be handled after convs load via effect
      }
    }
    init()
  }, [])

  // Open conv from URL param
  useEffect(() => {
    const convParam = searchParams.get('conv')
    if (convParam && convs.length > 0) {
      const c = convs.find(c => c.id === convParam)
      if (c) openConversation(c)
    }
  }, [convs, searchParams])

  async function loadConversations(userId: string) {
    const { data } = await (supabase as any)
      .from('conversations').select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (!data) { setLoadingConvs(false); return }

    const enriched: Conversation[] = await Promise.all(data.map(async (c: any) => {
      const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1
      const { data: p } = await (supabase as any).from('profiles').select('id, first_name, last_name, role, avatar_url').eq('id', otherId).single()
      const { count: uc } = await (supabase as any).from('messages').select('id', { count: 'exact', head: true })
        .eq('conversation_id', c.id).eq('is_read', false).neq('sender_id', userId)

      let childName: string | undefined
      if (c.child_id) {
        const { data: child } = await (supabase as any).from('profiles').select('first_name, last_name').eq('id', c.child_id).single()
        if (child) childName = `${child.first_name} ${child.last_name}`
      }

      return { ...c, other: p as Profile, child_name: childName, unread: uc ?? 0 }
    }))

    setConvs(enriched)
    setLoadingConvs(false)
  }

  async function openConversation(conv: Conversation) {
    setActiveConv(conv)
    setLoadingMsgs(true)

    const { data } = await (supabase as any)
      .from('messages').select('*').eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })

    setMessages(data ?? [])
    setLoadingMsgs(false)

    // Mark messages as read
    if (me) {
      await (supabase as any).from('messages').update({ is_read: true })
        .eq('conversation_id', conv.id).neq('sender_id', me.id)
      setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c))
    }

    // Subscribe to realtime
    supabase.channel(`conv-${conv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conv.id}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          // Auto-mark read if not from me
          if (me && msg.sender_id !== me.id) {
            ;(supabase.from('messages') as any).update({ is_read: true }).eq('id', msg.id)
          }
        }
      ).subscribe()
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!draft.trim() || !activeConv || !me || sending) return
    setSending(true)
    const body = draft.trim()
    setDraft('')

    await (supabase as any).from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: me.id,
      body,
    })

    setConvs(prev => prev.map(c => c.id === activeConv.id ? { ...c, last_message: body, last_message_at: new Date().toISOString() } : c))
    setSending(false)
  }

  function handleNewConvCreated(convId: string) {
    setShowNewConv(false)
    if (me) loadConversations(me.id).then(() => {
      const c = convs.find(c => c.id === convId)
      if (c) openConversation(c)
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      {showNewConv && me && (
        <NewConvModal
          myId={me.id}
          myRole={me.role}
          children={myChildren}
          onClose={() => setShowNewConv(false)}
          onCreated={handleNewConvCreated}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>Inbox</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Messages
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
            Chat with your {me?.role === 'teacher' ? 'students and parents' : me?.role === 'parent' ? 'teachers' : 'teachers'}.
          </p>
        </div>
        <button
          onClick={() => setShowNewConv(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={{ background: '#1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
        >
          + New Conversation
        </button>
      </div>

      {/* Main chat layout */}
      <div className="rounded-2xl overflow-hidden flex" style={{
        background: '#fff',
        border: '1px solid rgba(27,94,55,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        height: 'calc(100vh - 220px)',
        minHeight: 480,
      }}>

        {/* ── Conversations list (left panel) ── */}
        <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(27,94,55,0.08)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8A9A8A' }}>
              Conversations
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : convs.length === 0 ? (
              <div className="p-6 text-center mt-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-semibold" style={{ color: '#0D3D20' }}>No conversations yet</p>
                <p className="text-xs mt-1.5" style={{ color: '#9A9A8A' }}>Start a new conversation above.</p>
              </div>
            ) : convs.map(conv => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left border-b transition-all"
                style={{
                  borderColor: 'rgba(27,94,55,0.05)',
                  background: activeConv?.id === conv.id ? 'rgba(27,94,55,0.07)' : conv.unread > 0 ? 'rgba(27,94,55,0.03)' : 'transparent',
                  borderLeft: activeConv?.id === conv.id ? '3px solid #1B5E37' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (activeConv?.id !== conv.id) (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.04)' }}
                onMouseLeave={e => { if (activeConv?.id !== conv.id) (e.currentTarget as HTMLElement).style.background = conv.unread > 0 ? 'rgba(27,94,55,0.03)' : 'transparent' }}
              >
                <Avatar name={`${conv.other.first_name} ${conv.other.last_name}`} url={conv.other.avatar_url} size={10} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0D3D20' }}>
                      {conv.other.first_name} {conv.other.last_name}
                    </p>
                    {conv.last_message_at && (
                      <p className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#B8B8A8' }}>
                        {timeAgo(conv.last_message_at)}
                      </p>
                    )}
                  </div>
                  {conv.child_name && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#B8952A' }}>re: {conv.child_name}</p>
                  )}
                  <p className="text-xs truncate mt-0.5" style={{ color: conv.unread > 0 ? '#1B5E37' : '#9A9A8A', fontWeight: conv.unread > 0 ? 600 : 400 }}>
                    {conv.last_message ?? 'Start the conversation…'}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-1"
                    style={{ background: '#1B5E37' }}>
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat window (right panel) ── */}
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(248,245,240,0.3)' }}>
            <div className="text-5xl">💬</div>
            <p className="font-semibold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>Select a conversation</p>
            <p className="text-sm" style={{ color: '#9A9A8A' }}>Choose from the left or start a new one.</p>
            <button onClick={() => setShowNewConv(true)}
              className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1B5E37' }}>
              + New Conversation
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(27,94,55,0.08)', background: 'rgba(248,245,240,0.5)' }}>
              <Avatar name={`${activeConv.other.first_name} ${activeConv.other.last_name}`} url={activeConv.other.avatar_url} size={10} />
              <div>
                <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>
                  {activeConv.other.first_name} {activeConv.other.last_name}
                </p>
                <p className="text-xs capitalize" style={{ color: '#8A9A8A' }}>
                  {activeConv.other.role}
                  {activeConv.child_name && <span style={{ color: '#B8952A' }}> · re: {activeConv.child_name}</span>}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMsgs ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-3/4" style={{ marginLeft: i % 2 === 0 ? 'auto' : 0 } as React.CSSProperties} />)}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">👋</div>
                  <p className="text-sm font-medium" style={{ color: '#0D3D20' }}>
                    Say hello to {activeConv.other.first_name}!
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>This is the start of your conversation.</p>
                </div>
              ) : messages.map((msg, i) => {
                const isMe = msg.sender_id === me?.id
                const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime() > 5 * 60 * 1000

                return (
                  <div key={msg.id}>
                    {showTime && (
                      <p className="text-center text-[10px] my-2" style={{ color: '#B8B8A8' }}>
                        {formatMsgTime(msg.created_at)}
                      </p>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm"
                        style={{
                          background: isMe ? '#1B5E37' : '#F5F0E8',
                          color: isMe ? '#fff' : '#0D3D20',
                          borderBottomRightRadius: isMe ? 4 : undefined,
                          borderBottomLeftRadius: !isMe ? 4 : undefined,
                        }}
                      >
                        {msg.body}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(27,94,55,0.08)' }}>
              <div className="flex gap-3 items-end">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder={`Message ${activeConv.other.first_name}…`}
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ border: '1.5px solid #E0DDD5', fontFamily: "'DM Sans', sans-serif", maxHeight: 100 }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = '#E0DDD5' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!draft.trim() || sending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: '#1B5E37' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
              <p className="text-[10px] mt-2" style={{ color: '#B8B8A8' }}>Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
