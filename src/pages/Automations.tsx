import React, { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import { Automation } from '@/types/chat'
import {
  Bot,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  MessageSquare,
  KeyRound,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function Automations() {
  const { automations, toggleAutomation, addAutomation, updateAutomation, deleteAutomation } =
    useChat()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState<'welcome' | 'absence' | 'keyword'>('welcome')
  const [keyword, setKeyword] = useState('')
  const [message, setMessage] = useState('')
  const [description, setDescription] = useState('')

  const handleOpenNew = () => {
    setEditingId(null)
    setName('')
    setTrigger('welcome')
    setKeyword('')
    setMessage('')
    setDescription('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (auto: Automation) => {
    setEditingId(auto.id)
    setName(auto.name)
    setTrigger(auto.trigger)
    setKeyword(auto.keyword || '')
    setMessage(auto.message)
    setDescription(auto.description)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      toast.error('Preencha o título e o texto da mensagem da automação.')
      return
    }

    if (editingId) {
      updateAutomation(editingId, {
        name: name.trim(),
        trigger,
        keyword: trigger === 'keyword' ? keyword.trim() : undefined,
        message: message.trim(),
        description: description.trim() || 'Regra de automação customizada',
      })
      toast.success('Automação atualizada com sucesso!')
    } else {
      addAutomation({
        name: name.trim(),
        trigger,
        keyword: trigger === 'keyword' ? keyword.trim() : undefined,
        message: message.trim(),
        description: description.trim() || 'Regra de automação do chatbot',
        isActive: true,
      })
      toast.success('Nova automação criada com sucesso!')
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteAutomation(id)
    toast.success('Automação excluída.')
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-600" />
            Automações do Chatbot
          </h1>
          <p className="text-xs text-slate-500">
            Regras inteligentes de boas-vindas, resposta de ausência e palavras-chave para o
            WhatsApp.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenNew}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800">
                {editingId ? 'Editar Automação' : 'Criar Automação para Chatbot'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="auto-name" className="text-xs font-semibold">
                  Nome da Automação *
                </Label>
                <Input
                  id="auto-name"
                  placeholder="Ex: Resposta Fora do Horário Comercial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Gatilho de Disparo</Label>
                  <Select
                    value={trigger}
                    onValueChange={(val: 'welcome' | 'absence' | 'keyword') => setTrigger(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Selecione o gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Boas-vindas (Novo contato)</SelectItem>
                      <SelectItem value="absence">Ausência (Fora do expediente)</SelectItem>
                      <SelectItem value="keyword">Palavra-chave específica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {trigger === 'keyword' && (
                  <div className="space-y-1">
                    <Label htmlFor="auto-kw" className="text-xs font-semibold">
                      Palavra-chave *
                    </Label>
                    <Input
                      id="auto-kw"
                      placeholder="Ex: preco, visita, catalogo"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="h-9 text-xs"
                      required={trigger === 'keyword'}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="auto-desc" className="text-xs font-semibold">
                  Descrição breve
                </Label>
                <Input
                  id="auto-desc"
                  placeholder="Ex: Mensagem enviada automaticamente para qualificar o lead"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-msg" className="text-xs font-semibold">
                    Mensagem de WhatsApp a ser enviada *
                  </Label>
                  <span className="text-[10px] text-slate-400">Suporta quebras de linha</span>
                </div>
                <Textarea
                  id="auto-msg"
                  placeholder="Digite a resposta que o bot deve enviar no WhatsApp..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Automação'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Automações */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Motor de Respostas do Bot</h2>
              <p className="text-xs text-slate-600">
                As automações ativas operam 24/7 simulando o comportamento de triagem do
                bot.portoplan.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white text-xs">
            {automations.filter((a) => a.isActive).length} ativas
          </Badge>
        </div>

        {/* Cards de Regras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className={`bg-white border rounded-xl p-5 transition flex flex-col justify-between ${
                auto.isActive
                  ? 'border-emerald-200 shadow-sm'
                  : 'border-slate-200 opacity-75 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {auto.trigger === 'welcome' && (
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                    {auto.trigger === 'absence' && (
                      <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                        <Clock className="h-4 w-4" />
                      </span>
                    )}
                    {auto.trigger === 'keyword' && (
                      <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
                        <KeyRound className="h-4 w-4" />
                      </span>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{auto.name}</h3>
                      <p className="text-[11px] text-slate-500">{auto.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={auto.isActive}
                      onCheckedChange={() => {
                        toggleAutomation(auto.id)
                        toast.info(
                          auto.isActive
                            ? `Automação "${auto.name}" pausada.`
                            : `Automação "${auto.name}" ativada!`,
                        )
                      }}
                    />
                  </div>
                </div>

                {auto.trigger === 'keyword' && auto.keyword && (
                  <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono border border-purple-200">
                    Palavra-chave: <strong>"{auto.keyword}"</strong>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 border border-slate-100 font-mono whitespace-pre-line mb-3 leading-relaxed">
                  {auto.message}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Modificado: {auto.updatedAt}</span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(auto)}
                    className="h-7 px-2 text-slate-600 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(auto.id)}
                    className="h-7 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
