import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/context/ChatContext'
import { Contact } from '@/types/chat'
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  FileText,
  Tag,
  ArrowUpRight,
  Filter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Contacts() {
  const { contacts, addContact, openOrCreateConversationWithContact } = useChat()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Novo contato form state
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newTag, setNewTag] = useState('Novo Lead')
  const [newNotes, setNewNotes] = useState('')

  // Extrair todas as tags únicas
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags || [])))

  // Filtragem
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTag = selectedTag ? c.tags.includes(selectedTag) : true
    return matchesSearch && matchesTag
  })

  const handleOpenConversation = (contact: Contact) => {
    openOrCreateConversationWithContact(contact)
    toast.success(`Abrindo conversa de WhatsApp com ${contact.name}`)
    navigate('/inbox')
  }

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Informe nome e telefone do contato.')
      return
    }

    addContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      tags: [newTag.trim() || 'Novo Lead'],
      notes: newNotes.trim() || 'Cadastrado manualmente no painel.',
    })

    toast.success('Contato adicionado com sucesso!')
    setIsAddOpen(false)
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    setNewNotes('')
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Contatos & Leads
          </h1>
          <p className="text-xs text-slate-500">
            Base de clientes do WhatsApp com histórico de atendimento e tags personalizadas.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9">
              <Plus className="h-4 w-4 mr-1.5" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800">
                Adicionar Novo Contato
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateContact} className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="c-name" className="text-xs font-semibold">
                  Nome Completo *
                </Label>
                <Input
                  id="c-name"
                  placeholder="Ex: Mariana Castro"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="c-phone" className="text-xs font-semibold">
                  Telefone / WhatsApp *
                </Label>
                <Input
                  id="c-phone"
                  placeholder="Ex: +55 11 98765-4321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="c-email" className="text-xs font-semibold">
                  E-mail
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="mariana@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="c-tag" className="text-xs font-semibold">
                  Tag / Classificação
                </Label>
                <Input
                  id="c-tag"
                  placeholder="Ex: Apartamento 2Q, Alto Padrão"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="c-notes" className="text-xs font-semibold">
                  Observações de Atendimento
                </Label>
                <Input
                  id="c-notes"
                  placeholder="Interesse na planta, orçamento previsto..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Salvar Contato
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
          />
        </div>

        {/* Tags Filtro */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filtrar:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-[11px] transition ${
              selectedTag === null
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({contacts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-[11px] transition ${
                selectedTag === tag
                  ? 'bg-emerald-700 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Contatos */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={contact.avatar || 'https://img.usecurling.com/ppl/thumbnail?seed=1'}
                      alt={contact.name}
                      className="h-11 w-11 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {contact.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        {contact.phone}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {contact.lastInteraction}
                  </span>
                </div>

                {contact.email && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 truncate">
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    {contact.email}
                  </p>
                )}

                {contact.notes && (
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 mb-3 border border-slate-100 leading-relaxed">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Notas do Atendente:
                    </span>
                    {contact.notes}
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {contact.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Canal WhatsApp</span>
                <Button
                  onClick={() => handleOpenConversation(contact)}
                  size="sm"
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Abrir Conversa
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Users className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Nenhum contato encontrado com esses filtros.</p>
            <p className="text-xs text-slate-400">
              Tente buscar por outro termo ou cadastre um novo contato acima.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
