import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import { DEMO_USERS } from '@/data/mockData'
import {
  Users,
  Send,
  Hash,
  Lock,
  MessageSquare,
  Sparkles,
  Info,
  Circle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Conversation } from '@/types/chat'

export default function InternalChat() {
  const { internalMessages, sendInternalMessage, currentUser, canSeeConversation } = useChat()
  const [inputText, setInputText] = useState('')
  const [activeChannel, setActiveChannel] = useState<'geral' | 'plantao' | 'suporte'>('geral')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mensagens privadas (canais administracao/financeiro) só aparecem para quem tem permissão
  const visibleInternalMessages = internalMessages.filter((msg) => {
    if (!msg.channelId) return true
    if (msg.channelId === 'administracao' || msg.channelId === 'financeiro') {
      return canSeeConversation({
        id: `internal-${msg.channelId}`,
        privateLevel: msg.channelId === 'financeiro' ? 'super_admin' : 'admin',
      } as Conversation)
    }
    return true
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [internalMessages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    sendInternalMessage(inputText)
    setInputText('')
    toast.success('Mensagem interna enviada!')
  }

  const handleQuickTeammatePrompt = (name: string, phrase: string) => {
    setInputText(`@${name} ${phrase}`)
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50">
      {/* Coluna 1: Lista de Atendentes & Canais Internos */}
      <div className="w-80 md:w-88 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Chat Interno
            </h1>
            <Badge
              variant="outline"
              className="text-indigo-700 bg-indigo-50 border-indigo-200 text-[10px]"
            >
              Equipe Privada
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Comunicação restrita entre corretores e suporte, fora do WhatsApp dos clientes.
          </p>
        </div>

        {/* Canais Internos */}
        <div className="p-3 border-b border-slate-100 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Canais de Atendimento
          </p>

          <button
            onClick={() => setActiveChannel('geral')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
              activeChannel === 'geral'
                ? 'bg-indigo-50 text-indigo-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-500" />
              <span>geral-imobiliaria</span>
            </div>
            <span className="text-[10px] text-slate-400">Todos</span>
          </button>

          <button
            onClick={() => {
              setActiveChannel('plantao')
              toast.info('Canal do Plantão selecionado')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
              activeChannel === 'plantao'
                ? 'bg-indigo-50 text-indigo-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-500" />
              <span>plantao-vendas</span>
            </div>
            <span className="text-[10px] text-slate-400">Escala</span>
          </button>

          <button
            onClick={() => {
              setActiveChannel('suporte')
              toast.info('Canal de Suporte e Financiamento selecionado')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
              activeChannel === 'suporte'
                ? 'bg-indigo-50 text-indigo-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-500" />
              <span>analise-credito</span>
            </div>
            <span className="text-[10px] text-slate-400">Bancos</span>
          </button>
        </div>

        {/* Membros da Equipe / Atendentes */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Atendentes Conectados ({DEMO_USERS.length})
          </p>

          <div className="space-y-1">
            {DEMO_USERS.map((user) => {
              const isCurrent = user.id === currentUser?.id
              return (
                <div
                  key={user.id}
                  className={`p-2 rounded-lg flex items-center justify-between text-xs transition ${
                    isCurrent ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                          user.status === 'online'
                            ? 'bg-emerald-500'
                            : user.status === 'busy'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-slate-800 font-semibold flex items-center gap-1">
                        {user.name}
                        {isCurrent && (
                          <span className="text-[10px] text-indigo-600 font-normal">(Você)</span>
                        )}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">{user.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickTeammatePrompt(
                        user.name.split(' ')[0],
                        'pode me dar um suporte aqui no WhatsApp?',
                      )
                    }
                    title="Mencionar colega"
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] px-1.5 py-0.5 rounded hover:bg-indigo-50 shrink-0"
                  >
                    @chamar
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-amber-900 text-[11px] space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-amber-700" /> Canal 100% Interno
            </p>
            <p className="text-amber-700 leading-relaxed">
              Nenhuma mensagem trocada aqui é enviada para os clientes do WhatsApp. Use para
              alinhamento rápido e dúvidas sobre unidades.
            </p>
          </div>
        </div>
      </div>

      {/* Coluna 2: Janela de Chat Interno */}
      <div className="flex-1 flex flex-col h-full bg-slate-100/50 overflow-hidden">
        {/* Header do Chat Interno */}
        <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">
                  {activeChannel === 'geral'
                    ? 'geral-imobiliaria'
                    : activeChannel === 'plantao'
                      ? 'plantao-vendas'
                      : 'analise-credito'}
                </h2>
                <Badge variant="outline" className="text-slate-600 text-[10px]">
                  Equipe PortoPlan
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Canal aberto para todos os atendentes e supervisores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-800 text-xs">
              {DEMO_USERS.filter((u) => u.status === 'online').length} online agora
            </Badge>
          </div>
        </div>

        {/* Mensagens Internas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="text-center my-2">
            <span className="text-[11px] bg-slate-200/70 text-slate-600 px-3 py-1 rounded-full font-medium">
              Histórico recente do chat da equipe
            </span>
          </div>

          {visibleInternalMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200 mt-0.5"
                />

                <div className={`space-y-1 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 text-xs ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-slate-800">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs md:text-sm shadow-sm leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Sugestões de Alinhamento */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Avisos rápidos:</span>
          <button
            type="button"
            onClick={() => setInputText('Alguém pode assumir um lead de 3 quartos agora?')}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs transition border border-slate-200"
          >
            Assumir novo lead
          </button>
          <button
            type="button"
            onClick={() => setInputText('Estou em reunião com cliente no decorado até as 16h.')}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs transition border border-slate-200"
          >
            Em atendimento externo
          </button>
          <button
            type="button"
            onClick={() =>
              setInputText('A simulação da Beatriz já está pronta com entrada de 80k!')
            }
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs transition border border-slate-200"
          >
            Simulação pronta
          </button>
        </div>

        {/* Formulário de Envio */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <Input
            type="text"
            placeholder={`Enviar mensagem interna como ${currentUser?.name || 'Atendente'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 h-10 text-xs md:text-sm bg-slate-50 focus-visible:ring-indigo-500"
          />
          <Button
            type="submit"
            disabled={!inputText.trim()}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs md:text-sm shrink-0"
          >
            <Send className="h-4 w-4 mr-1.5" />
            Enviar no Chat
          </Button>
        </form>
      </div>
    </div>
  )
}
