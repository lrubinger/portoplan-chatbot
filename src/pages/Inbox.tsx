import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import {
  Search,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  Phone,
  User,
  MoreVertical,
  CheckCheck,
  Check,
  RotateCcw,
  Sparkles,
  MessageSquareOff,
  Filter,
  Smile,
  Shield,
  Tag,
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
import { toast } from 'sonner'

export default function Inbox() {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    toggleResolved,
    markAsRead,
    markAsUnread,
    simulateClientReply,
    quickReplies,
    currentUser,
  } = useChat()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'resolved'>('all')
  const [inputMessage, setInputMessage] = useState('')
  const [simulatedClientInput, setSimulatedClientInput] = useState('')
  const [showSimulateDialog, setShowSimulateDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  // Automatically mark as read when selecting
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    markAsRead(id)
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contactPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filterTab === 'unread') return conv.unreadCount > 0
    if (filterTab === 'resolved') return conv.isResolved
    return !conv.isResolved // 'all' shows active unresolved
  })

  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0)

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputMessage.trim() || !selectedConversation) return

    sendMessage(selectedConversation.id, inputMessage)
    setInputMessage('')
    toast.success('Mensagem enviada no WhatsApp!')
  }

  const handleApplyQuickReply = (text: string) => {
    setInputMessage(text)
    toast.info('Resposta rápida aplicada ao campo de texto!')
  }

  const handleSimulateClient = () => {
    if (!simulatedClientInput.trim() || !selectedConversation) return
    simulateClientReply(selectedConversation.id, simulatedClientInput)
    setSimulatedClientInput('')
    setShowSimulateDialog(false)
    toast.success('Resposta do cliente simulada com sucesso!')
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50">
      {/* Coluna 1: Lista de Conversas estilo BotConversa */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
        {/* Cabeçalho da Lista */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              WhatsApp Inbox
              {unreadTotal > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadTotal}
                </span>
              )}
            </h1>
            <Badge
              variant="outline"
              className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[11px]"
            >
              PortoPlan Bot
            </Badge>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar conversa ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Abas de Filtro */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 rounded-md transition text-center ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Abertas
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`flex-1 py-1.5 rounded-md transition text-center flex items-center justify-center gap-1 ${
                filterTab === 'unread'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Não lidas
              {unreadTotal > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center">
                  {unreadTotal}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab('resolved')}
              className={`flex-1 py-1.5 rounded-md transition text-center ${
                filterTab === 'resolved'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolvidas
            </button>
          </div>
        </div>

        {/* Lista com Scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquareOff className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs">Nenhuma conversa encontrada neste filtro.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConversationId
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3.5 cursor-pointer transition flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.contactAvatar || 'https://img.usecurling.com/ppl/thumbnail?seed=1'}
                      alt={conv.contactName}
                      className="h-11 w-11 rounded-full object-cover border border-slate-200"
                    />
                    {conv.isResolved ? (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-400 h-3 w-3 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm truncate font-semibold ${
                          isSelected ? 'text-emerald-950' : 'text-slate-800'
                        }`}
                      >
                        {conv.contactName}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mb-1.5">{conv.lastMessage}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        {conv.tags.slice(0, 1).map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="h-5 min-w-5 px-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Coluna 2: Janela da Conversa */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
          {/* Top Bar da Conversa */}
          <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={selectedConversation.contactAvatar}
                alt={selectedConversation.contactName}
                className="h-10 w-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {selectedConversation.contactName}
                  </h2>
                  {selectedConversation.isResolved ? (
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
                  <span>{selectedConversation.contactPhone}</span>
                  <span>•</span>
                  <span>Atendente: {selectedConversation.assignedAgent || currentUser?.name}</span>
                </div>
              </div>
            </div>

            {/* Ações da Conversa */}
            <div className="flex items-center gap-2">
              {/* Botão de Simulação de Resposta do Cliente */}
              <Popover open={showSimulateDialog} onOpenChange={setShowSimulateDialog}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" />
                    Simular Cliente
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 space-y-2 text-xs" align="end">
                  <p className="font-semibold text-slate-800">
                    Simular mensagem recebida no WhatsApp:
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Envie uma resposta fictícia como se fosse o cliente (
                    {selectedConversation.contactName}) para testar o fluxo.
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
                variant={selectedConversation.isResolved ? 'outline' : 'default'}
                size="sm"
                onClick={() => {
                  toggleResolved(selectedConversation.id)
                  toast.success(
                    selectedConversation.isResolved
                      ? 'Conversa reaberta!'
                      : 'Conversa marcada como resolvida!',
                  )
                }}
                className={`h-8 text-xs ${
                  selectedConversation.isResolved
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedConversation.isResolved ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reabrir
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolver
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem
                    onClick={() => {
                      markAsUnread(selectedConversation.id)
                      toast.info('Conversa marcada como não lida.')
                    }}
                  >
                    Marcar como não lida
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      toast.info(`Telefone copiado: ${selectedConversation.contactPhone}`)
                      navigator.clipboard.writeText(selectedConversation.contactPhone)
                    }}
                  >
                    Copiar telefone
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Histórico de Mensagens WhatsApp */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#efeae2]/40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
            {selectedConversation.messages.map((msg) => {
              const isAgent = msg.sender === 'agent'
              const isBot = msg.sender === 'bot'
              const isContact = msg.sender === 'contact'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isContact ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs md:text-sm shadow-sm relative ${
                      isContact
                        ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-200/60'
                        : isBot
                          ? 'bg-blue-50 text-blue-950 border border-blue-200/80 rounded-tr-sm'
                          : 'bg-[#d9fdd3] text-slate-900 rounded-tr-sm border border-[#c1eac0]'
                    }`}
                  >
                    {/* Indicador de Remetente se Bot ou Atendente */}
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

          {/* Barra de Ações Rápidas (Atalhos de Respostas Rápidas) */}
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

          {/* Campo de Entrada de Mensagem WhatsApp */}
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
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <User className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Nenhuma conversa selecionada</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Escolha uma conversa na lista à esquerda ou inicie atendimento através da tela de
            Contatos.
          </p>
        </div>
      )}
    </div>
  )
}
