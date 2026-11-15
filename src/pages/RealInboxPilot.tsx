import { useEffect, useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { Bot, QrCode, MessageSquare, Users, Contact, KanbanSquare, Workflow, Shield, Settings, LogOut, Search, RefreshCw, Send, CheckCheck, LockKeyhole } from 'lucide-react'
import { portoPlanApi, type BackendTicket, type BackendMessage, type BackendUser, type BackendWhatsappConnection } from '@/lib/portoplanApi'

/** Interface de homologacao: visual da V2 com dados reais do backend, sem mocks. */
export default function RealInboxPilot() {
  const [user, setUser] = useState<BackendUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tickets, setTickets] = useState<BackendTicket[]>([])
  const [selected, setSelected] = useState<BackendTicket | null>(null)
  const [messages, setMessages] = useState<BackendMessage[]>([])
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'open' | 'unread' | 'closed'>('open')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connectionOpen, setConnectionOpen] = useState(() => window.location.pathname.endsWith('/configuracoes'))
  const [connections, setConnections] = useState<BackendWhatsappConnection[]>([])
  const [connectionBusy, setConnectionBusy] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const [team, setTeam] = useState<Array<{id:number;name:string}>>([])
  const [transferOpen, setTransferOpen] = useState(false)
  const [quickReplies, setQuickReplies] = useState<Array<{id:number;shortcode:string;message:string}>>([])

  async function refreshConnections() {
    try {
      const list = await portoPlanApi.whatsappConnections()
      setConnections(Array.isArray(list) ? list : [])
      setConnectionError('')
    } catch { setConnectionError('Não foi possível consultar o estado real do WhatsApp.') }
  }

  useEffect(() => {
    if (!user || !connectionOpen) return
    void refreshConnections()
    const timer = window.setInterval(() => { void refreshConnections() }, 5000)
    return () => window.clearInterval(timer)
  }, [user, connectionOpen])

  async function startConnection(id: number) {
    setConnectionBusy(true)
    try {
      await portoPlanApi.startWhatsappConnection(id)
      await refreshConnections()
    } catch { setConnectionError('Falha ao iniciar a conexão. Verifique o backend antes de tentar novamente.') }
    finally { setConnectionBusy(false) }
  }

  async function loadTickets(status: 'open' | 'unread' | 'closed' = filter) {
    setLoading(true)
    try {
      const response = status === 'closed'
        ? await portoPlanApi.tickets('closed')
        : await Promise.all([portoPlanApi.tickets('open'), portoPlanApi.tickets('pending')])
      const list = Array.isArray(response) ? response.flatMap(item => item.tickets || []) : response.tickets || []
      setTickets(list)
      setError('')
    } catch {
      setError('Não foi possível atualizar os atendimentos reais.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    portoPlanApi.refresh().then(async next => {
      if (!active) return
      setUser(next)
      await loadTickets('open')
    }).catch(() => { /* Sem sessão: login real */ })
    return () => { active = false }
  }, [])

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const next = await portoPlanApi.login(email, password)
      setUser(next)
      setPassword('')
      await loadTickets('open')
    } catch { setError('Falha no login ou na consulta ao backend. Confira suas credenciais.') }
    finally { setBusy(false) }
  }

  async function openTicket(ticket: BackendTicket) {
    setBusy(true); setError('')
    try {
      const [details, history] = await Promise.all([portoPlanApi.ticket(ticket.id), portoPlanApi.messages(ticket.id)])
      setSelected(details)
      setMessages([...(history.messages || [])].reverse())
    } catch { setError('Não foi possível abrir esta conversa.') }
    finally { setBusy(false) }
  }

  async function resolveSelected() {
    if (!selected || busy || !window.confirm('Resolver este atendimento?')) return
    setBusy(true)
    try {
      await portoPlanApi.updateTicket(selected.id, { status: 'closed' })
      setSelected(null); setMessages([])
      await loadTickets()
    } catch { setError('Não foi possível resolver o atendimento no servidor.') }
    finally { setBusy(false) }
  }

  async function openTransfer() {
    if (!selected) return
    setTransferOpen(true)
    try {
      const users = await portoPlanApi.users()
      setTeam(Array.isArray(users) ? users : [])
    } catch { setError('Não foi possível carregar os atendentes autorizados.') }
  }

  async function transferSelected(userId: number) {
    if (!selected || busy) return
    setBusy(true)
    try {
      const updated = await portoPlanApi.updateTicket(selected.id, { userId })
      setSelected(updated); setTransferOpen(false)
      await loadTickets()
    } catch { setError('Não foi possível transferir este atendimento.') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    if (!user) return
    portoPlanApi.quickMessages().then(data => setQuickReplies(data.records || [])).catch(() => {})
  }, [user])

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!selected || !draft.trim() || busy) return
    setBusy(true); setError('')
    try {
      await portoPlanApi.sendMessage(selected.id, draft.trim())
      setDraft('')
      const history = await portoPlanApi.messages(selected.id)
      setMessages([...(history.messages || [])].reverse())
      await loadTickets()
    } catch { setError('Envio não confirmado. Confira o atendimento antes de tentar novamente.') }
    finally { setBusy(false) }
  }

  async function signOut() {
    try { await portoPlanApi.logout() }
    finally { setUser(null); setTickets([]); setMessages([]); setSelected(null) }
  }

  const filtered = tickets.filter(ticket => {
    if (filter === 'unread' && !(ticket.unreadMessages && ticket.unreadMessages > 0)) return false
    const q = search.trim().toLowerCase()
    return !q || [ticket.contact?.name, ticket.contact?.number, ticket.lastMessage].some(value => value?.toLowerCase().includes(q))
  })
  const unread = tickets.filter(t => (t.unreadMessages || 0) > 0).length
  const contactName = (ticket: BackendTicket) => ticket.contact?.name || ticket.contact?.number || `Atendimento #${ticket.id}`
  const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : ''

  if (!user) return <main className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
    <section className="relative md:w-1/2 min-h-[280px] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 md:p-12 text-white flex flex-col justify-between overflow-hidden">
      <div className="relative z-10 flex items-center gap-3"><span className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl"><Bot size={26}/></span><div><h1 className="text-xl font-bold tracking-tight">CHATBOT PORTOPLAN</h1><p className="text-xs text-slate-300">Atendimento inteligente e WhatsApp Hub</p></div></div>
      <div className="relative z-10 max-w-md py-10 md:py-16"><p className="inline-flex rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-emerald-300 mb-5">Ambiente V2 • Integração real</p><h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Automação inteligente para seu atendimento.</h2><p className="text-slate-300 text-sm md:text-base">Organize conversas do WhatsApp com autenticação e dados reais do PortoPlan. Nenhum acesso demonstrativo é utilizado nesta versão.</p></div>
      <p className="relative z-10 text-xs text-slate-400 border-t border-white/10 pt-6">PortoPlan BOT • Acesso seguro</p>
    </section>
    <section className="md:w-1/2 flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
      <form onSubmit={signIn} className="w-full max-w-md space-y-5">
        <div><h2 className="text-2xl font-bold text-slate-900">Acesse sua conta</h2><p className="text-sm text-slate-500 mt-2">Use suas credenciais reais para acessar a plataforma.</p></div>
        <label className="block text-sm font-medium text-slate-700">E-mail<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" className="mt-2 border border-slate-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"/></label>
        <label className="block text-sm font-medium text-slate-700">Senha<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" className="mt-2 border border-slate-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"/></label>
        {error && <p role="alert" className="text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">{error}</p>}
        <button disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg p-3 w-full disabled:opacity-50">{busy ? 'Autenticando...' : 'Entrar na plataforma'}</button>
        <p className="text-xs text-center text-slate-500">Acesso protegido pela autenticação do servidor PortoPlan.</p>
      </form>
    </section>
  </main>

  return <div className="h-screen w-screen flex overflow-hidden bg-slate-50 text-slate-800">
    <aside className="w-16 md:w-20 bg-slate-900 flex flex-col items-center justify-between py-4 shrink-0">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl h-11 w-11 flex items-center justify-center text-white" title="PortoPlan Bot"><Bot size={25}/></div>
        <nav className="flex flex-col items-center gap-2">
          <button onClick={()=>{setConnectionOpen(false);window.history.replaceState(null, "", "/v2/inbox")}} className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center" title="WhatsApp Inbox"><MessageSquare size={21}/></button>
          
          <Link to="/chat-interno" className="h-11 w-11 rounded-xl text-white flex items-center justify-center hover:bg-slate-700" title="Chat interno"><Users size={21}/></Link>
          <Link to="/contatos" className="h-11 w-11 rounded-xl text-white flex items-center justify-center hover:bg-slate-700" title="Contatos"><Contact size={21}/></Link>
          {[
            
            { icon: KanbanSquare, label: 'Kanban' }, { icon: Workflow, label: 'Fluxos' },
            { icon: Shield, label: 'Administração' }
          ].map(item => <span key={item.label} className="h-11 w-11 flex items-center justify-center text-slate-500 cursor-not-allowed" title={`${item.label} — integração pendente`} aria-label={`${item.label} indisponível na homologação`}><item.icon size={20}/></span>)}
        <button onClick={()=>{setConnectionOpen(true);window.history.replaceState(null, "", "/v2/configuracoes")}} className={`h-11 w-11 rounded-xl text-white flex items-center justify-center hover:bg-slate-700 ${connectionOpen ? "bg-emerald-600" : ""}`} title="Configurações — WhatsApp"><Settings size={21}/></button>
        </nav>
      </div>
      <button type="button" onClick={signOut} title="Sair" className="text-slate-400 hover:text-white p-3"><LogOut size={20}/></button>
    </aside>
    <main className="flex flex-1 min-w-0">
      {connectionOpen ? <section className="flex-1 overflow-auto p-5 md:p-10 space-y-6">
        <div className="flex justify-between items-center"><h1 className="text-xl font-bold">Configurações — Conexão do WhatsApp</h1><button onClick={()=>void refreshConnections()} className="text-emerald-700 text-sm flex items-center gap-2"><RefreshCw size={16}/> Atualizar estado</button></div>
        <p className="text-sm text-slate-500">Conexões reais autorizadas para sua conta. Se já estiver conectado, não é necessário escanear novamente.</p>
        {connectionError && <p role="alert" className="text-red-700">{connectionError}</p>}
        {connections.length === 0 && <p className="text-sm">Nenhuma conexão disponível para esta conta. Verifique o vínculo do usuário com o WhatsApp no BOT principal.</p>}
        {connections.map(connection => <div key={connection.id} className="bg-white border rounded-xl p-6 max-w-xl space-y-4">
          <div className="flex justify-between gap-3"><strong>{connection.name}</strong><span className="text-sm text-slate-500">Estado: {connection.status}</span></div>
          {connection.status.toUpperCase() === "CONNECTED" ? <p className="text-emerald-700 font-semibold">WhatsApp conectado ao backend</p> : <>
            {connection.qrcode ? <div className="bg-white p-4 inline-block border rounded-xl"><QRCodeSVG value={connection.qrcode} size={224} level="M" includeMargin /></div> : <p className="text-sm text-slate-500">QR Code ainda não disponível. Aguarde a geração pelo servidor.</p>}
            <p className="text-xs text-slate-500">No WhatsApp do celular, abra Dispositivos conectados → Conectar dispositivo. O QR Code é recebido diretamente do backend.</p>
            <button disabled={connectionBusy || connection.status.toUpperCase() === "OPENING" || connection.status.toLowerCase() === "qrcode"} onClick={()=>void startConnection(connection.id)} className="bg-emerald-600 text-white rounded-lg px-4 py-2 disabled:opacity-40">Iniciar conexão</button>
          </>}
        </div>)}
      </section> : <><section className="w-80 md:w-96 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <header className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-bold text-lg">WhatsApp Inbox {unread > 0 && <span className="text-white bg-emerald-500 rounded-full px-2 py-0.5 text-xs">{unread}</span>}</h1>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">PortoPlan Bot</span>
          </div>
          <div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400"/><input className="w-full bg-slate-50 border rounded-lg pl-9 pr-3 py-2 text-sm" placeholder="Buscar conversa ou telefone..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="bg-slate-100 rounded-lg flex p-1 text-xs">
            {([{id:'open',label:'Abertas'},{id:'unread',label:'Não lidas'},{id:'closed',label:'Resolvidas'}] as const).map(item =>
              <button key={item.id} className={`flex-1 rounded-md py-2 ${filter===item.id ? 'bg-white shadow-sm font-semibold' : 'text-slate-500'}`} onClick={()=>{setFilter(item.id);setSelected(null);setMessages([]);void loadTickets(item.id)}}>{item.label}{item.id==='unread' && unread>0 ? ` (${unread})` : ''}</button>)}
          </div>
          <button className="text-xs text-emerald-700 flex items-center gap-1 disabled:opacity-50" disabled={loading} onClick={()=>void loadTickets()}><RefreshCw size={13}/> {loading?'Atualizando...':'Atualizar atendimentos'}</button>
        </header>
        <div className="flex-1 overflow-y-auto divide-y">
          {filtered.length === 0 && <p className="p-6 text-xs text-slate-500">Nenhum atendimento real encontrado neste filtro.</p>}
          {filtered.map(ticket => <button key={ticket.id} onClick={()=>void openTicket(ticket)} className={`w-full text-left flex gap-3 p-4 hover:bg-slate-50 ${selected?.id===ticket.id?'bg-emerald-50 border-l-4 border-emerald-600':''}`}>
            {ticket.contact?.profilePicUrl ? <img src={ticket.contact.profilePicUrl} alt="" className="w-11 h-11 rounded-full object-cover"/> : <span className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">{contactName(ticket).charAt(0).toUpperCase()}</span>}
            <div className="flex-1 min-w-0"><div className="flex justify-between gap-2"><strong className="text-sm truncate">{contactName(ticket)}</strong><span className="text-[10px] text-slate-400">{formatTime(ticket.updatedAt)}</span></div><p className="text-xs text-slate-500 truncate">{ticket.lastMessage || 'Sem mensagem recente'}</p><p className="text-[11px] text-slate-400 mt-1">{ticket.contact?.number || ''}</p></div>
            {(ticket.unreadMessages || 0)>0 && <span className="bg-emerald-500 text-white text-xs h-5 min-w-5 px-1 rounded-full flex items-center justify-center">{ticket.unreadMessages}</span>}
          </button>)}
        </div>
      </section>
      <section className="flex-1 min-w-0 flex flex-col">
        {error && <div role="alert" className="bg-red-50 text-red-700 border-b p-3 text-sm">{error}</div>}
        {!selected ? <div className="m-auto text-slate-400 text-sm">Selecione um atendimento real na lista</div> : <>
          <div className="h-12 bg-white border-b px-5 flex items-center text-sm font-semibold">{contactName(selected)} <span className="ml-3 text-xs text-slate-400 font-normal">{selected.contact?.number}</span></div>
          <div className="h-16 bg-white border-b px-5 flex items-center justify-between gap-2">
            <div><h2 className="font-bold text-sm">{contactName(selected)} <span className="ml-2 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full text-[10px]">{selected.status==='closed'?'Resolvido':'Em atendimento'}</span></h2><p className="text-xs text-slate-500 mt-1">Atendente: {selected.user?.name || user.name}</p></div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={busy} onClick={()=>void openTransfer()} className="border rounded-lg px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-40">Transferir</button>
              <button type="button" disabled={busy || selected.status==='closed'} onClick={()=>void resolveSelected()} className="bg-emerald-600 text-white rounded-lg px-3 py-2 text-xs disabled:opacity-40">Resolver</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map(message => <div key={message.id} className={`flex ${message.fromMe?'justify-end':'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.fromMe?'bg-[#d9fdd3]':'bg-white border'}`}><p className="whitespace-pre-wrap">{message.body}</p><div className="flex justify-end gap-1 mt-2 text-[10px] text-slate-400">{formatTime(message.createdAt)}{message.fromMe && <CheckCheck size={13}/>}</div></div></div>)}
            {messages.length===0 && <p className="text-center text-xs text-slate-500">Nenhuma mensagem retornada pelo backend.</p>}
          </div>
          {transferOpen && <div className="bg-white border-t px-4 py-3 text-sm space-y-2"><div className="flex justify-between"><strong>Transferir atendimento</strong><button type="button" onClick={()=>setTransferOpen(false)}>Cancelar</button></div><div className="flex gap-2 flex-wrap">{team.map(member => <button type="button" key={member.id} disabled={busy} onClick={()=>void transferSelected(member.id)} className="border rounded-lg px-3 py-2 hover:bg-slate-50">{member.name}</button>)}</div>{team.length===0 && <p className="text-slate-500">Nenhum atendente disponível.</p>}</div>}
          {quickReplies.length>0 && <div className="bg-white border-t px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs"><span className="shrink-0 text-slate-500">Respostas rápidas:</span>{quickReplies.map(reply=><button type="button" key={reply.id} onClick={()=>setDraft(reply.message)} className="shrink-0 rounded-full border bg-slate-50 px-3 py-1.5 hover:bg-emerald-50">{reply.shortcode}</button>)}</div>}
          <form onSubmit={send} className="p-3 bg-white border-t flex gap-2">
            <input className="flex-1 bg-slate-50 border rounded-lg p-3 text-sm" value={draft} onChange={e=>setDraft(e.target.value)} placeholder={`Responder no WhatsApp como ${user.name}...`}/>
            <button disabled={busy || !draft.trim() || selected.status==='closed'} className="bg-emerald-600 text-white rounded-lg px-5 disabled:opacity-40 flex items-center gap-2"><Send size={17}/> Enviar</button>
          </form>
        </>}
      </section></>}
    </main>
  </div>
}
