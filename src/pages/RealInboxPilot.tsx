import { useEffect, useState, type FormEvent } from 'react'
import { portoPlanApi, type BackendTicket, type BackendMessage, type BackendUser } from '@/lib/portoplanApi'

/** Isolated real-backend pilot. No mock data and no simulated WhatsApp sends. */
export default function RealInboxPilot() {
  const [user, setUser] = useState<BackendUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tickets, setTickets] = useState<BackendTicket[]>([])
  const [selected, setSelected] = useState<BackendTicket | null>(null)
  const [messages, setMessages] = useState<BackendMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadTickets() {
    const [open, pending] = await Promise.all([
      portoPlanApi.tickets('open'), portoPlanApi.tickets('pending')
    ])
    setTickets([...open.tickets, ...pending.tickets])
  }

  useEffect(() => {
    let active = true
    portoPlanApi.refresh().then(async next => {
      if (!active) return
      setUser(next)
      await loadTickets()
    }).catch(() => { /* No session: show login. */ })
    return () => { active = false }
  }, [])

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const next = await portoPlanApi.login(email, password)
      await loadTickets()
      setUser(next)
      setPassword('')
    } catch {
      setError('Não foi possível autenticar ou carregar atendimentos. Confira suas credenciais e a API.')
    } finally { setBusy(false) }
  }

  async function openTicket(ticket: BackendTicket) {
    setError(''); setBusy(true)
    try {
      const [details, history] = await Promise.all([
        portoPlanApi.ticket(ticket.id), portoPlanApi.messages(ticket.id)
      ])
      setSelected(details)
      setMessages([...history.messages].reverse())
    } catch { setError('Não foi possível carregar esta conversa.') }
    finally { setBusy(false) }
  }

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!selected || !draft.trim() || busy) return
    setBusy(true); setError('')
    try {
      await portoPlanApi.sendMessage(selected.id, draft.trim())
      setDraft('')
      const history = await portoPlanApi.messages(selected.id)
      setMessages([...history.messages].reverse())
      await loadTickets()
    } catch { setError('Envio não confirmado. Verifique o atendimento antes de tentar novamente.') }
    finally { setBusy(false) }
  }

  async function signOut() {
    try { await portoPlanApi.logout() }
    finally { setUser(null); setTickets([]); setMessages([]); setSelected(null) }
  }

  if (!user) return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form onSubmit={signIn} className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">PortoPlan V2 — Integração real</h1>
        <p className="text-sm text-slate-500">Acesso com as credenciais do BOT existente.</p>
        <input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" className="border rounded p-2 w-full"/>
        <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" className="border rounded p-2 w-full"/>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        <button disabled={busy} className="bg-emerald-700 text-white rounded p-2 w-full disabled:opacity-50">Entrar</button>
      </form>
    </main>
  )

  return <main className="h-screen flex flex-col bg-slate-50">
    <header className="p-4 bg-white border-b flex justify-between items-center">
      <strong>PortoPlan — Inbox real (piloto)</strong>
      <div className="flex gap-3 items-center text-sm"><span>{user.name}</span><button onClick={signOut} className="underline">Sair</button></div>
    </header>
    {error && <p role="alert" className="bg-red-50 text-red-700 p-3">{error}</p>}
    <div className="flex flex-1 min-h-0">
      <aside className="w-80 border-r bg-white overflow-y-auto">
        <div className="p-3 flex justify-between"><strong>Atendimentos</strong><button disabled={busy} onClick={()=>loadTickets().catch(()=>setError('Falha ao atualizar atendimentos.'))} className="underline text-sm">Atualizar</button></div>
        {tickets.map(ticket=><button key={ticket.id} onClick={()=>openTicket(ticket)} className="block w-full text-left border-t p-3 hover:bg-emerald-50">
          <strong>{ticket.contact?.name || `Ticket #${ticket.id}`}</strong>
          <p className="text-xs text-slate-500">{ticket.contact?.number || ''}</p>
          <p className="text-sm truncate">{ticket.lastMessage || 'Sem mensagens'}</p>
          {!!ticket.unreadMessages && <span className="text-xs">{ticket.unreadMessages} não lidas</span>}
        </button>)}
      </aside>
      <section className="flex-1 flex flex-col min-w-0">
        {!selected ? <div className="m-auto text-slate-500">Selecione um atendimento</div> : <>
          <div className="p-4 border-b bg-white font-semibold">{selected.contact?.name || `Ticket #${selected.id}`}</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map(message=><div key={message.id} className={`p-3 rounded max-w-[80%] whitespace-pre-wrap ${message.fromMe ? 'ml-auto bg-emerald-100' : 'bg-white border'}`}>
              {message.body}
              <div className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString('pt-BR')}</div>
            </div>)}
          </div>
          <form onSubmit={send} className="p-3 border-t bg-white flex gap-2">
            <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Digite uma mensagem..." className="border rounded p-2 flex-1" />
            <button disabled={busy || !draft.trim()} className="bg-emerald-700 text-white rounded px-5 disabled:opacity-50">Enviar</button>
          </form>
        </>}
      </section>
    </div>
  </main>
}
