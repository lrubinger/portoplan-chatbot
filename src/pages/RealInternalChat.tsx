import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { portoPlanApi } from '@/lib/portoplanApi'

type Colleague = { id: number; name: string; email?: string; unread?: number; lastMessage?: string }
type ChatMessage = { id: number; senderId: number; recipientId: number; body: string; createdAt: string }

export default function RealInternalChat() {
  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [selected, setSelected] = useState<Colleague | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    portoPlanApi.internalChatContacts().then(setColleagues).catch(() => setError('Não foi possível carregar os usuários autorizados. Faça login no Inbox primeiro.'))
  }, [])

  async function open(person: Colleague) {
    setSelected(person); setError('')
    try { setMessages(await portoPlanApi.internalChatMessages(person.id)) }
    catch { setError('Falha ao carregar mensagens do chat interno.') }
  }

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!selected || !draft.trim() || busy) return
    setBusy(true); setError('')
    try {
      await portoPlanApi.sendInternalMessage(selected.id, draft.trim())
      setDraft('')
      setMessages(await portoPlanApi.internalChatMessages(selected.id))
    } catch { setError('Não foi possível enviar a mensagem.') }
    finally { setBusy(false) }
  }

  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <header className="bg-slate-900 text-white p-4 flex justify-between"><strong>PortoPlan • Chat interno</strong><Link to="/inbox" className="underline">Voltar ao Inbox</Link></header>
    {error && <p role="alert" className="bg-red-50 text-red-700 p-3">{error}</p>}
    <div className="flex h-[calc(100vh-56px)]">
      <aside className="w-72 border-r bg-white overflow-y-auto">
        {colleagues.map(person => <button key={person.id} onClick={() => void open(person)} className="block w-full text-left p-4 border-b hover:bg-slate-50"><strong>{person.name}</strong><p className="text-xs text-slate-500 truncate">{person.lastMessage || person.email}</p>{!!person.unread && <span className="text-xs text-emerald-700">{person.unread} não lidas</span>}</button>)}
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <div className="border-b bg-white p-4 font-semibold">{selected?.name || 'Selecione um colega'}</div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map(item => <div key={item.id} className="bg-white rounded-lg border p-3 max-w-xl"><p className="whitespace-pre-wrap">{item.body}</p><small className="text-slate-400">{new Date(item.createdAt).toLocaleString('pt-BR')}</small></div>)}
        </div>
        <form onSubmit={send} className="flex gap-2 bg-white p-4 border-t"><input aria-label="Mensagem interna" className="border rounded-lg p-3 flex-1" value={draft} onChange={e => setDraft(e.target.value)} disabled={!selected} placeholder="Escreva uma mensagem interna..." /><button disabled={!selected || busy || !draft.trim()} className="bg-emerald-600 text-white px-5 rounded-lg disabled:opacity-40">Enviar</button></form>
      </main>
    </div>
  </div>
}
