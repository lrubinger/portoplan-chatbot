import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import {
  Search,
  CheckCircle2,
  Send,
  Zap,
  User,
  Check,
  MessageSquareOff,
  X,
  Columns2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import ConversationPanel from '@/components/inbox/ConversationPanel'

export default function Inbox() {
  const {
    conversations,
    selectedConversationId,
    openConversationIds,
    openConversation,
    closeConversationTab,
    setSelectedConversationId,
    markAsRead,
  } = useChat()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'resolved'>('all')

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contactPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false
    if (filterTab === 'unread') return conv.unreadCount > 0
    if (filterTab === 'resolved') return conv.isResolved
    return !conv.isResolved
  })

  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0)
  const openConversations = openConversationIds
    .map((id) => conversations.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const activeTab = selectedConversationId ?? openConversations[0]?.id ?? null

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50">
      {/* Coluna 1: Lista de Conversas */}
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
              const isSelected = conv.id === activeTab
              const isOpen = openConversationIds.includes(conv.id)
              return (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
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
                        {isOpen && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                            Aberta
                          </span>
                        )}
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

      {/* Coluna 2: Abas de conversas abertas + painéis */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden min-w-0">
        {openConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <User className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Nenhuma conversa aberta</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Escolha uma conversa na lista à esquerda para começar a atender. Você pode abrir
              várias ao mesmo tempo.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] text-slate-400">
              <Columns2 className="h-3.5 w-3.5" />
              Multi-atendimento: as conversas abertas aparecem em abas aqui.
            </div>
          </div>
        ) : (
          <>
            {/* Barra de abas */}
            <div className="h-11 bg-white border-b border-slate-200 flex items-stretch overflow-x-auto shrink-0">
              {openConversations.map((conv) => {
                const isActive = conv.id === activeTab
                const hasUnread = conv.unreadCount > 0
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id)
                      markAsRead(conv.id)
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 cursor-pointer border-r border-slate-200 select-none min-w-[160px] max-w-[220px] transition',
                      isActive
                        ? 'bg-emerald-50/70 border-b-2 border-b-emerald-600'
                        : 'hover:bg-slate-50',
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          conv.contactAvatar || 'https://img.usecurling.com/ppl/thumbnail?seed=1'
                        }
                        alt=""
                        className="h-6 w-6 rounded-full object-cover border border-slate-200"
                      />
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs truncate flex-1',
                        isActive ? 'font-semibold text-emerald-950' : 'text-slate-600',
                      )}
                    >
                      {conv.contactName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeConversationTab(conv.id)
                      }}
                      className="text-slate-300 hover:text-slate-600 transition shrink-0"
                      title="Fechar aba"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Painéis: 1 conversa = tela cheia; 2+ = lado a lado */}
            <div
              className={cn(
                'flex-1 flex overflow-hidden min-h-0',
                openConversations.length > 1 ? 'divide-x divide-slate-200' : '',
              )}
            >
              {openConversations.map((conv) => (
                <ConversationPanel
                  key={conv.id}
                  conversationId={conv.id}
                  onClose={
                    openConversations.length > 1 ? () => closeConversationTab(conv.id) : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
