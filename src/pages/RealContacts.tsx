import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { portoPlanApi } from '@/lib/portoplanApi'

type Contact = { id: number; name: string; number: string }
export default function RealContacts() {
  const [items, setItems] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function load(query = search) {
    setLoading(true); setError('')
    try {
      await portoPlanApi.refresh()
      const result = await portoPlanApi.contacts(1, query)
      setItems(result.contacts || [])
    } catch { setError('Não foi possível consultar os contatos reais. Verifique sua sessão.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load('') }, [])
  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <header className="bg-slate-900 text-white p-4 flex justify-between"><strong>PortoPlan • Contatos</strong><Link to="/inbox" className="underline">Voltar ao Inbox</Link></header>
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <form onSubmit={e=>{e.preventDefault();void load()}} className="flex gap-2"><input className="flex-1 border rounded-lg p-3" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar contato por nome ou telefone" aria-label="Buscar contatos"/><button disabled={loading} className="bg-emerald-600 text-white rounded-lg px-5 disabled:opacity-40">Buscar</button></form>
      {error && <p role="alert" className="bg-red-50 text-red-700 p-3">{error}</p>}
      <div className="bg-white rounded-xl border divide-y">{items.map(item=><div key={item.id} className="p-4 flex justify-between gap-3"><strong>{item.name}</strong><span className="text-slate-500">{item.number}</span></div>)}{!loading && !items.length && <p className="p-6 text-slate-500">Nenhum contato encontrado.</p>}</div>
    </main>
  </div>
}
