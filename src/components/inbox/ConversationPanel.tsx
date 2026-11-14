import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import {
  CheckCircle2,
  Send,
  Zap,
  Sparkles,
  CheckCheck,
  Check,
  RotateCcw,
  MoreVertical,
  UserCog,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DEMO_USERS } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ConversationPanelProps {
  conversationId: string
  onClose?: () => void
}

export default function ConversationPanel({ conversationId, onClose }: ConversationPanelProps) {
  const {
    conversations,
    sendMessage,
    toggleResolved,
    markAsUnread,
    simulateClientReply,
    quickReplies,
    currentUser,
    transferConversation,
    openConversationIds,
    closeConversationTab,
  } = useChat()

  const conversation = conversations.find((c) => c.id === conversationId)

  const [inputMessage, setInputMessage] = useState('')
  const [simulatedClientInput, setSimulatedClientInput] = useState('')
  const [showSimulateDialog, setShowSimulateDialog] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50">
        <p className="text-xs">Conversa não encontrada.</p>
      </div>
    )
  }

  const otherAgents = DEMO_USERS.filter((u) => u.name !== conversation.assignedAgent)

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputMessage.trim()) return
    sendMessage(conversation.id, inputMessage)
    setInputMessage('')
    toast.success('Mensagem enviada no WhatsApp!')
  }

  const handleApplyQuickReply = (text: string) => {
    setInputMessage(text)
    toast.info('Resposta rápida aplicada ao campo de texto!')
  }

  const handleSimulateClient = () => {
    if (!simulatedClientInput.trim()) return
    simulateClientReply(conversation.id, simulatedClientInput)
    setSimulatedClientInput('')
    setShowSimulateDialog(false)
    toast.success('Resposta do cliente simulada com sucesso!')
  }

  const openTransfer = () => {
    setTransferTargetId(otherAgents[0]?.id ?? '')
    setTransferReason('')
    setTransferOpen(true)
  }

  const confirmTransfer = () => {
    if (!transferTargetId) return
    transferConversation(conversation.id, transferTargetId, transferReason)
    setTransferOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden min-w-0">
      {/* Top Bar da Conversa */}
      <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={conversation.contactAvatar}
            alt={conversation.contactName}
            className="h-10 w-10 rounded-full object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {conversation.contactName}
              </h2>
              {conversation.isResolved ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                >
                  Resolvido
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                >
                  Em atendimento
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="truncate">{conversation.contactPhone}</span>
              <span>•</span>
              <span className="truncate">
                Atendente: {conversation.assignedAgent || currentUser?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Ações da Conversa */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={openTransfer}
            className="h-8 text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
            title="Transferir para outro atendente"
          >
            <UserCog className="h-3.5 w-3.5 mr-1" />
            Transferir
          </Button>

          <Popover open={showSimulateDialog} onOpenChange={setShowSimulateDialog}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" />
                Simular
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 space-y-2 text-xs" align="end">
              <p className="font-semibold text-slate-800">Simular mensagem recebida no WhatsApp:</p>
              <p className="text-slate-500 text-[11px]">
                Envie uma resposta fictícia como se fosse o cliente ({conversation.contactName})
                para testar o fluxo.
              </p>
              <Input
                placeholder="Digite a mensagem do cliente..."
                value={simulatedClientInput}
                onChange={(e) => setSimulatedClientInput(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSimulateClient()
                }}
              />
              <div className="flex justify-end gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSimulateDialog(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSimulateClient}
                  className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Disparar Resposta
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant={conversation.isResolved ? 'outline' : 'default'}
            size="sm"
            onClick={() => {
              toggleResolved(conversation.id)
              toast.success(
                conversation.isResolved ? 'Conversa reaberta!' : 'Conversa marcada como resolvida!',
              )
            }}
            className={cn(
              'h-8 text-xs',
              conversation.isResolved
                ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white',
            )}
          >
            {conversation.isResolved ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reabrir
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolver
              </>
            )}
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-700"
              onClick={onClose}
              title="Fechar aba"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={openTransfer}>Transferir para atendente</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  markAsUnread(conversation.id)
                  toast.info('Conversa marcada como não lida.')
                }}
              >
                Marcar como não lida
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Histórico de Mensagens WhatsApp */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#efeae2]/40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        {conversation.messages.map((msg) => {
          const isAgent = msg.sender === 'agent'
          const isBot = msg.sender === 'bot'
          const isContact = msg.sender === 'contact'

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isContact ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm relative ${
                  isContact
                    ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-200/60'
                    : isBot
                      ? 'bg-blue-50 text-blue-950 border border-blue-200/80 rounded-tr-sm'
                      : 'bg-[#d9fdd3] text-slate-900 rounded-tr-sm border border-[#c1eac0]'
                }`}
              >
                {(isBot || (isAgent && msg.senderName)) && (
                  <div className="text-[11px] font-semibold mb-1 flex items-center gap-1.5 text-slate-600">
                    {isBot ? (
                      <span className="text-blue-700 flex items-center gap-1">
                        🤖 {msg.senderName || 'Chatbot PortoPlan'}
                      </span>
                    ) : (
                      <span className="text-emerald-800 flex items-center gap-1">
                        👤 {msg.senderName}
                      </span>
                    )}
                  </div>
                )}

                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1">
                  <span>{msg.timestamp}</span>
                  {!isContact && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="h-3 w-3 text-blue-500 inline" />
                      ) : (
                        <Check className="h-3 w-3 text-slate-400 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Ações Rápidas */}
      <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          Respostas rápidas:
        </span>
        {quickReplies.slice(0, 5).map((qr) => (
          <button
            key={qr.id}
            type="button"
            onClick={() => handleApplyQuickReply(qr.text)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 text-xs transition"
          >
            <span className="font-semibold text-emerald-600 mr-1">{qr.shortcut}</span>
            {qr.title}
          </button>
        ))}
      </div>

      {/* Campo de Entrada */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <Input
          type="text"
          placeholder={`Responder no WhatsApp como ${currentUser?.name || 'Atendente'}...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 h-10 text-xs md:text-sm bg-slate-50 focus-visible:ring-emerald-500"
        />
        <Button
          type="submit"
          disabled={!inputMessage.trim()}
          className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs md:text-sm shrink-0"
        >
          <Send className="h-4 w-4 mr-1.5" />
          Enviar
        </Button>
      </form>

      {/* Dialog de Transferência */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Transferir conversa</DialogTitle>
            <DialogDescription className="text-xs">
              Escolha o atendente que vai assumir a conversa com {conversation.contactName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            {otherAgents.length === 0 && (
              <p className="text-xs text-slate-500">Nenhum outro atendente disponível.</p>
            )}
            {otherAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setTransferTargetId(agent.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition',
                  transferTargetId === agent.id
                    ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="h-9 w-9 rounded-full object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{agent.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{agent.role}</p>
                </div>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    agent.status === 'online' && 'bg-emerald-500',
                    agent.status === 'busy' && 'bg-amber-500',
                    agent.status === 'offline' && 'bg-slate-300',
                  )}
                />
              </button>
            ))}
            <Textarea
              placeholder="Motivo da transferência (opcional)..."
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="min-h-[64px] text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={confirmTransfer}
              disabled={!transferTargetId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmar transferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
