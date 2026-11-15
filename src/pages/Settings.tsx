import React, { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import { QuickReply } from '@/types/chat'
import {
  Settings,
  User,
  Zap,
  Clock,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  Check,
  Building,
  ShieldCheck,
  Save,
} from 'lucide-react'
import WhatsappConnectionSection from '@/components/settings/WhatsappConnectionSection'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function AppSettings() {
  const {
    currentUser,
    updateCurrentUser,
    quickReplies,
    addQuickReply,
    updateQuickReply,
    deleteQuickReply,
    businessHours,
    updateBusinessHours,
  } = useChat()

  // Perfil form
  const [profileName, setProfileName] = useState(currentUser?.name || '')
  const [profileRole, setProfileRole] = useState(currentUser?.role || '')
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '')

  // Resposta Rápida modal
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [editingQrId, setEditingQrId] = useState<string | null>(null)
  const [qrTitle, setQrTitle] = useState('')
  const [qrShortcut, setQrShortcut] = useState('')
  const [qrText, setQrText] = useState('')

  // Horários de atendimento
  const [bhEnabled, setBhEnabled] = useState(businessHours.enabled)
  const [weekdaysStart, setWeekdaysStart] = useState(businessHours.weekdaysStart)
  const [weekdaysEnd, setWeekdaysEnd] = useState(businessHours.weekdaysEnd)
  const [saturdayEnabled, setSaturdayEnabled] = useState(businessHours.saturdayEnabled)
  const [saturdayStart, setSaturdayStart] = useState(businessHours.saturdayStart)
  const [saturdayEnd, setSaturdayEnd] = useState(businessHours.saturdayEnd)
  const [sundayEnabled, setSundayEnabled] = useState(businessHours.sundayEnabled)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileName.trim()) {
      toast.error('Informe seu nome de atendente.')
      return
    }
    updateCurrentUser({
      name: profileName.trim(),
      role: profileRole.trim(),
      email: profileEmail.trim(),
    })
    toast.success('Perfil de atendente atualizado!')
  }

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault()
    updateBusinessHours({
      enabled: bhEnabled,
      weekdaysStart,
      weekdaysEnd,
      saturdayEnabled,
      saturdayStart,
      saturdayEnd,
      sundayEnabled,
    })
    toast.success('Horário de atendimento salvo com sucesso!')
  }

  const handleOpenNewQr = () => {
    setEditingQrId(null)
    setQrTitle('')
    setQrShortcut('/')
    setQrText('')
    setQrModalOpen(true)
  }

  const handleOpenEditQr = (qr: QuickReply) => {
    setEditingQrId(qr.id)
    setQrTitle(qr.title)
    setQrShortcut(qr.shortcut)
    setQrText(qr.text)
    setQrModalOpen(true)
  }

  const handleSaveQr = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrTitle.trim() || !qrText.trim()) {
      toast.error('Preencha título e texto da resposta rápida.')
      return
    }

    const shortcutFormatted = qrShortcut.startsWith('/')
      ? qrShortcut.trim()
      : `/${qrShortcut.trim()}`

    if (editingQrId) {
      updateQuickReply(editingQrId, {
        title: qrTitle.trim(),
        shortcut: shortcutFormatted,
        text: qrText.trim(),
      })
      toast.success('Resposta rápida atualizada!')
    } else {
      addQuickReply({
        title: qrTitle.trim(),
        shortcut: shortcutFormatted,
        text: qrText.trim(),
        category: 'geral',
      })
      toast.success('Resposta rápida criada!')
    }
    setQrModalOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-700" />
            Configurações da Plataforma
          </h1>
          <p className="text-xs text-slate-500">
            Gerenciamento do atendente logado, biblioteca de respostas rápidas e horários de
            funcionamento.
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6 max-w-4xl mx-auto">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger
              value="profile"
              className="text-xs gap-1.5 data-[state=active]:bg-slate-100"
            >
              <User className="h-4 w-4" /> Perfil do Atendente
            </TabsTrigger>
            <TabsTrigger
              value="quick-replies"
              className="text-xs gap-1.5 data-[state=active]:bg-slate-100"
            >
              <Zap className="h-4 w-4" /> Respostas Rápidas ({quickReplies.length})
            </TabsTrigger>
            <TabsTrigger
              value="business-hours"
              className="text-xs gap-1.5 data-[state=active]:bg-slate-100"
            >
              <Clock className="h-4 w-4" /> Horário de Atendimento
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp-connection"
              className="text-xs gap-1.5 data-[state=active]:bg-slate-100"
            >
              <QrCode className="h-4 w-4" /> Conexão do WhatsApp
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Perfil */}
          <TabsContent value="profile">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{currentUser?.name}</h2>
                  <p className="text-xs text-slate-500">{currentUser?.role} • PortoPlan</p>
                  <Badge
                    variant="outline"
                    className="mt-1 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Sessão de Demonstração Ativa
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name" className="text-xs font-semibold">
                    Nome de exibição no WhatsApp *
                  </Label>
                  <Input
                    id="prof-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Este nome aparece nas mensagens enviadas aos clientes.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-role" className="text-xs font-semibold">
                    Cargo / Função
                  </Label>
                  <Input
                    id="prof-role"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-email" className="text-xs font-semibold">
                    E-mail institucional
                  </Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" /> Salvar Perfil
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Tab 2: Respostas Rápidas */}
          <TabsContent value="quick-replies">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Respostas Rápidas do Atendimento
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atalhos com barra (ex: /ola, /visita) para responder dúvidas frequentes em
                    segundos no WhatsApp.
                  </p>
                </div>

                <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleOpenNewQr}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Nova Resposta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base font-bold text-slate-800">
                        {editingQrId ? 'Editar Resposta Rápida' : 'Criar Nova Resposta Rápida'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveQr} className="space-y-3 py-2">
                      <div className="space-y-1">
                        <Label htmlFor="qr-title" className="text-xs font-semibold">
                          Título / Identificador *
                        </Label>
                        <Input
                          id="qr-title"
                          placeholder="Ex: Envio de Proposta Comercial"
                          value={qrTitle}
                          onChange={(e) => setQrTitle(e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="qr-short" className="text-xs font-semibold">
                          Atalho de Teclado *
                        </Label>
                        <Input
                          id="qr-short"
                          placeholder="/proposta"
                          value={qrShortcut}
                          onChange={(e) => setQrShortcut(e.target.value)}
                          className="h-9 text-xs font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="qr-body" className="text-xs font-semibold">
                          Mensagem Completa *
                        </Label>
                        <Textarea
                          id="qr-body"
                          placeholder="Texto que será colado na conversa do WhatsApp..."
                          value={qrText}
                          onChange={(e) => setQrText(e.target.value)}
                          rows={4}
                          className="text-xs leading-relaxed"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setQrModalOpen(false)}
                          className="h-8 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Salvar Resposta
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Lista de Respostas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {quickReplies.map((qr) => (
                  <div
                    key={qr.id}
                    className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-800">{qr.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          {qr.shortcut}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                        {qr.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditQr(qr)}
                        className="h-7 px-2 text-slate-600 hover:text-slate-900 text-xs"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          deleteQuickReply(qr.id)
                          toast.success('Resposta rápida excluída.')
                        }}
                        className="h-7 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Horários */}
          <TabsContent value="business-hours">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Horário de Atendimento da Imobiliária
                </h2>
                <p className="text-xs text-slate-500">
                  Define quando o bot considerará atendimento em horário comercial ou disparará a
                  mensagem automática de ausência.
                </p>
              </div>

              <form onSubmit={handleSaveHours} className="space-y-5 max-w-lg">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <Label className="text-xs font-bold text-slate-800">
                      Habilitar Controle de Horário Comercial
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Dispara mensagem de ausência fora deste intervalo
                    </p>
                  </div>
                  <Switch checked={bhEnabled} onCheckedChange={setBhEnabled} />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">
                      Segunda a Sexta-feira
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Abertura:</span>
                        <Input
                          type="time"
                          value={weekdaysStart}
                          onChange={(e) => setWeekdaysStart(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">Fechamento:</span>
                        <Input
                          type="time"
                          value={weekdaysEnd}
                          onChange={(e) => setWeekdaysEnd(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Atendimento aos Sábados
                      </Label>
                      <Switch checked={saturdayEnabled} onCheckedChange={setSaturdayEnabled} />
                    </div>
                    {saturdayEnabled && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[11px] text-slate-500 block mb-1">Abertura:</span>
                          <Input
                            type="time"
                            value={saturdayStart}
                            onChange={(e) => setSaturdayStart(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block mb-1">Fechamento:</span>
                          <Input
                            type="time"
                            value={saturdayEnd}
                            onChange={(e) => setSaturdayEnd(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">
                        Atendimento aos Domingos
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Normalmente fechado (apenas chatbot de plantão)
                      </p>
                    </div>
                    <Switch checked={sundayEnabled} onCheckedChange={setSundayEnabled} />
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" /> Salvar Horários
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Tab 4: Conexão do WhatsApp */}
          <TabsContent value="whatsapp-connection">
            <WhatsappConnectionSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
