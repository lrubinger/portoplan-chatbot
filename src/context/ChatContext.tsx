import React, { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'
import {
  User,
  Contact,
  Conversation,
  Message,
  InternalMessage,
  QuickReply,
  Automation,
  BusinessHours,
  KanbanCard,
  KanbanColumn,
  KanbanColumnId,
  Flow,
  FlowStep,
  FlowOption,
  TransferRecord,
  AccessLevel,
  ACCESS_LEVEL_RANK,
  UserPermissions,
  WhatsappConnection,
} from '@/types/chat'
import {
  DEMO_USERS,
  INITIAL_USER_PERMISSIONS,
  INITIAL_CONTACTS,
  INITIAL_CONVERSATIONS,
  INITIAL_INTERNAL_MESSAGES,
  INITIAL_QUICK_REPLIES,
  INITIAL_AUTOMATIONS,
  INITIAL_BUSINESS_HOURS,
  KANBAN_COLUMNS,
  INITIAL_KANBAN_CARDS,
  INITIAL_FLOWS,
} from '@/data/mockData'
import { KANBAN_COLUMN_STYLES } from '@/types/chat'

interface ChatContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  login: (email: string) => boolean
  logout: () => void

  // WhatsApp Conversations
  conversations: Conversation[]
  visibleConversations: Conversation[]
  canSeeConversation: (conversation: Conversation) => boolean
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void
  sendMessage: (conversationId: string, text: string) => void
  toggleResolved: (conversationId: string) => void
  markAsRead: (conversationId: string) => void
  markAsUnread: (conversationId: string) => void
  simulateClientReply: (conversationId: string, text: string) => void

  // Contacts
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id' | 'lastInteraction'>) => void
  openOrCreateConversationWithContact: (contact: Contact) => string

  // Internal Chat
  internalMessages: InternalMessage[]
  sendInternalMessage: (text: string) => void

  // Quick Replies
  quickReplies: QuickReply[]
  addQuickReply: (reply: Omit<QuickReply, 'id'>) => void
  updateQuickReply: (id: string, reply: Partial<QuickReply>) => void
  deleteQuickReply: (id: string) => void

  // Automations
  automations: Automation[]
  toggleAutomation: (id: string) => void
  addAutomation: (automation: Omit<Automation, 'id' | 'updatedAt'>) => void
  updateAutomation: (id: string, automation: Partial<Automation>) => void
  deleteAutomation: (id: string) => void

  // Business Hours
  businessHours: BusinessHours
  updateBusinessHours: (hours: Partial<BusinessHours>) => void

  // Profile update
  updateCurrentUser: (updates: Partial<User>) => void

  // Multi-atendimento (abas simultâneas + transferência)
  openConversationIds: string[]
  openConversation: (id: string) => void
  closeConversationTab: (id: string) => void
  transferConversation: (conversationId: string, toAgentId: string, reason?: string) => void
  transfers: TransferRecord[]

  // Administração / níveis de acesso
  users: User[]
  userPermissions: UserPermissions[]
  updateUserAccess: (
    userId: string,
    data: { accessLevel: AccessLevel; privateLevels: AccessLevel[] },
  ) => void
  toggleUserBlocked: (userId: string, blockedId: string) => void
  isSuperAdmin: boolean

  // Kanban
  kanbanColumns: KanbanColumn[]
  kanbanCards: KanbanCard[]
  moveKanbanCard: (cardId: string, toColumn: KanbanColumnId) => void
  addKanbanCard: (
    data: Omit<KanbanCard, 'id' | 'idleTime' | 'idleLevel' | 'contactAvatar'> & {
      contactAvatar?: string
    },
  ) => void
  updateKanbanCard: (cardId: string, updates: Partial<KanbanCard>) => void
  deleteKanbanCard: (cardId: string) => void
  renameKanbanColumn: (columnId: KanbanColumnId, title: string) => void
  addKanbanColumn: (title: string) => void
  deleteKanbanColumn: (
    columnId: KanbanColumnId,
    mode: 'move' | 'delete',
    moveTo?: KanbanColumnId,
  ) => void

  // Conexão do WhatsApp (QR code — pareamento simulado)
  whatsappConnection: WhatsappConnection
  qrPayload: string
  startWhatsappPairing: () => void
  refreshWhatsappQr: () => void
  completeWhatsappPairing: () => void
  disconnectWhatsapp: () => void

  // Fluxos de atendimento
  flows: Flow[]
  toggleFlow: (flowId: string) => void
  addFlowStep: (
    flowId: string,
    step: { type: FlowStep['type']; title: string; content?: string; actionDetail?: string },
  ) => void
  addFlowOption: (flowId: string, stepId: string, optionLabel: string) => void
  deleteFlowStep: (flowId: string, stepId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0])
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv-1')
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)
  const [internalMessages, setInternalMessages] =
    useState<InternalMessage[]>(INITIAL_INTERNAL_MESSAGES)
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(INITIAL_QUICK_REPLIES)
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS)
  const [businessHours, setBusinessHours] = useState<BusinessHours>(INITIAL_BUSINESS_HOURS)
  const [openConversationIds, setOpenConversationIds] = useState<string[]>(['conv-1'])
  const [transfers, setTransfers] = useState<TransferRecord[]>([])
  const [users, setUsers] = useState<User[]>(DEMO_USERS)
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(KANBAN_COLUMNS)
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>(INITIAL_KANBAN_CARDS)
  const [userPermissions, setUserPermissions] =
    useState<UserPermissions[]>(INITIAL_USER_PERMISSIONS)
  const [flows, setFlows] = useState<Flow[]>(INITIAL_FLOWS)
  const [whatsappConnection, setWhatsappConnection] = useState<WhatsappConnection>({
    status: 'disconnected',
  })
  // Gera um payload de QR de exemplo (simulação — na integração real viria da API).
  const generateQrPayload = () =>
    `portoplan-wa://${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
  const [qrPayload, setQrPayload] = useState<string>(generateQrPayload)

  const isSuperAdmin = currentUser?.accessLevel === 'super_admin'

  // ---------- Permissões / conversas privadas ----------

  // Uma conversa privada de nível L aparece para quem tem nível >= L (respeitando
  // as excessões configuradas pelo super administrador na tela de administração).
  const canSeeConversation = React.useCallback(
    (conversation: Conversation): boolean => {
      if (!currentUser) return false
      if (!conversation.privateLevel) return true

      const level = conversation.privateLevel
      const owner = users.find((u) => u.name === conversation.assignedAgent)

      // Bloqueio específico: o super admin pode impedir um usuário de ver as
      // conversas privadas de um atendente específico.
      const perms = userPermissions.find((p) => p.userId === currentUser.id)
      if (perms && owner && perms.blockedUserIds.includes(owner.id)) return false

      // Nível igual ou superior sempre enxerga (admin vê privadas de usuário;
      // super admin vê tudo) — exceto se houver liberação negada explícita.
      if (ACCESS_LEVEL_RANK[currentUser.accessLevel] >= ACCESS_LEVEL_RANK[level]) {
        if (perms && perms.privateLevels.length > 0 && !perms.privateLevels.includes(level)) {
          // Lista explícita configurada: vale o que estiver nela (nível do
          // usuário + o que foi liberado).
          const ownLevelAllowed =
            ACCESS_LEVEL_RANK[currentUser.accessLevel] > ACCESS_LEVEL_RANK[level]
          return ownLevelAllowed
        }
        return true
      }

      // Nível inferior só enxerga se foi liberado explicitamente.
      return !!perms?.privateLevels.includes(level)
    },
    [currentUser, users, userPermissions],
  )

  const visibleConversations = React.useMemo(
    () => conversations.filter(canSeeConversation),
    [conversations, canSeeConversation],
  )

  const updateUserAccess = (
    userId: string,
    data: { accessLevel: AccessLevel; privateLevels: AccessLevel[] },
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accessLevel: data.accessLevel } : u)),
    )
    if (userId === currentUser?.id) {
      setCurrentUser((prev) => (prev ? { ...prev, accessLevel: data.accessLevel } : null))
    }
    setUserPermissions((prev) => {
      const existing = prev.find((p) => p.userId === userId)
      if (existing) {
        return prev.map((p) =>
          p.userId === userId ? { ...p, privateLevels: data.privateLevels } : p,
        )
      }
      return [...prev, { userId, privateLevels: data.privateLevels, blockedUserIds: [] }]
    })
  }

  const toggleUserBlocked = (userId: string, blockedId: string) => {
    setUserPermissions((prev) => {
      const existing = prev.find((p) => p.userId === userId)
      if (!existing) {
        return [...prev, { userId, privateLevels: [], blockedUserIds: [blockedId] }]
      }
      return prev.map((p) =>
        p.userId === userId
          ? {
              ...p,
              blockedUserIds: p.blockedUserIds.includes(blockedId)
                ? p.blockedUserIds.filter((id) => id !== blockedId)
                : [...p.blockedUserIds, blockedId],
            }
          : p,
      )
    })
  }

  const login = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim())
    if (found) {
      setCurrentUser(found)
      return true
    }
    // Fallback demo user if custom email entered (nível usuário por padrão)
    setCurrentUser({
      id: `custom-${Date.now()}`,
      name: email.split('@')[0] || 'Atendente Demo',
      email: email,
      role: 'Atendente PortoPlan',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=15',
      status: 'online',
      accessLevel: 'user',
    })
    return true
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const sendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'agent',
      senderName: currentUser?.name || 'Atendente',
      text: trimmed,
      timestamp: timeStr,
      status: 'sent',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: trimmed,
            lastMessageTime: timeStr,
            messages: [...c.messages, newMsg],
          }
        }
        return c
      }),
    )
  }

  const simulateClientReply = (conversationId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg: Message = {
      id: `m-client-${Date.now()}`,
      sender: 'contact',
      text: trimmed,
      timestamp: timeStr,
      status: 'delivered',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: trimmed,
            lastMessageTime: timeStr,
            unreadCount: c.id === selectedConversationId ? 0 : c.unreadCount + 1,
            isResolved: false,
            messages: [...c.messages, newMsg],
          }
        }
        return c
      }),
    )
  }

  const toggleResolved = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, isResolved: !c.isResolved }
        }
        return c
      }),
    )
  }

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: 0 }
        }
        return c
      }),
    )
  }

  const markAsUnread = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: Math.max(1, c.unreadCount + 1) }
        }
        return c
      }),
    )
  }

  const addContact = (contactData: Omit<Contact, 'id' | 'lastInteraction'>) => {
    const newId = `c-${Date.now()}`
    const newContact: Contact = {
      ...contactData,
      id: newId,
      lastInteraction: 'Agora',
      avatar:
        contactData.avatar ||
        `https://img.usecurling.com/ppl/thumbnail?seed=${Math.floor(Math.random() * 80)}`,
    }
    setContacts((prev) => [newContact, ...prev])
  }

  const openOrCreateConversationWithContact = (contact: Contact): string => {
    const existing = conversations.find((c) => c.contactId === contact.id)
    if (existing) {
      setSelectedConversationId(existing.id)
      setOpenConversationIds((prev) => (prev.includes(existing.id) ? prev : [...prev, existing.id]))
      return existing.id
    }

    const newConvId = `conv-${Date.now()}`
    const newConversation: Conversation = {
      id: newConvId,
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactAvatar: contact.avatar,
      lastMessage: 'Conversa iniciada',
      lastMessageTime: 'Agora',
      unreadCount: 0,
      isResolved: false,
      assignedAgent: currentUser?.name || 'Ana Paula Costa',
      tags: contact.tags || ['Novo Contato'],
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'bot',
          senderName: 'Chatbot PortoPlan',
          text: `Atendimento aberto para ${contact.name} via WhatsApp.`,
          timestamp: 'Agora',
          status: 'read',
        },
      ],
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedConversationId(newConvId)
    setOpenConversationIds((prev) => (prev.includes(newConvId) ? prev : [...prev, newConvId]))
    return newConvId
  }

  const sendInternalMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !currentUser) return

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg: InternalMessage = {
      id: `im-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: trimmed,
      timestamp: timeStr,
    }

    setInternalMessages((prev) => [...prev, newMsg])
  }

  const addQuickReply = (reply: Omit<QuickReply, 'id'>) => {
    const newReply: QuickReply = {
      ...reply,
      id: `qr-${Date.now()}`,
    }
    setQuickReplies((prev) => [...prev, newReply])
  }

  const updateQuickReply = (id: string, updates: Partial<QuickReply>) => {
    setQuickReplies((prev) => prev.map((qr) => (qr.id === id ? { ...qr, ...updates } : qr)))
  }

  const deleteQuickReply = (id: string) => {
    setQuickReplies((prev) => prev.filter((qr) => qr.id !== id))
  }

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((auto) => (auto.id === id ? { ...auto, isActive: !auto.isActive } : auto)),
    )
  }

  const addAutomation = (automation: Omit<Automation, 'id' | 'updatedAt'>) => {
    const newAuto: Automation = {
      ...automation,
      id: `auto-${Date.now()}`,
      updatedAt: 'Hoje',
    }
    setAutomations((prev) => [...prev, newAuto])
  }

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((auto) => (auto.id === id ? { ...auto, ...updates, updatedAt: 'Hoje' } : auto)),
    )
  }

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((auto) => auto.id !== id))
  }

  const updateBusinessHours = (hours: Partial<BusinessHours>) => {
    setBusinessHours((prev) => ({ ...prev, ...hours }))
  }

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  // ---------- Multi-atendimento ----------

  const openConversation = (id: string) => {
    setOpenConversationIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setSelectedConversationId(id)
    markAsRead(id)
  }

  const closeConversationTab = (id: string) => {
    setOpenConversationIds((prev) => {
      const next = prev.filter((c) => c !== id)
      if (selectedConversationId === id) {
        setSelectedConversationId(next[next.length - 1] ?? null)
      }
      return next
    })
  }

  const transferConversation = (conversationId: string, toAgentId: string, reason?: string) => {
    const target = DEMO_USERS.find((u) => u.id === toAgentId)
    if (!target) return

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, assignedAgent: target.name } : c)),
    )
    setTransfers((prev) => [
      ...prev,
      {
        id: `tr-${Date.now()}`,
        conversationId,
        fromAgent: currentUser?.name || 'Atendente',
        toAgent: target.name,
        reason: reason?.trim() || undefined,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    toast.success(`Conversa transferida para ${target.name}.`)
  }

  // ---------- Kanban ----------

  const moveKanbanCard = (cardId: string, toColumn: KanbanColumnId) => {
    setKanbanCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, columnId: toColumn } : card)),
    )
  }

  const addKanbanCard = (
    data: Omit<KanbanCard, 'id' | 'idleTime' | 'idleLevel' | 'contactAvatar'> & {
      contactAvatar?: string
    },
  ) => {
    const newCard: KanbanCard = {
      ...data,
      id: `card-${Date.now()}`,
      contactAvatar:
        data.contactAvatar || 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=52',
      idleTime: '0',
      idleLevel: 'ok' as const,
    }
    setKanbanCards((prev) => [...prev, newCard])
  }

  const updateKanbanCard = (cardId: string, updates: Partial<KanbanCard>) => {
    setKanbanCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
    )
  }

  const deleteKanbanCard = (cardId: string) => {
    setKanbanCards((prev) => prev.filter((card) => card.id !== cardId))
  }

  const renameKanbanColumn = (columnId: KanbanColumnId, title: string) => {
    setKanbanColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, title: title.trim() || col.title } : col)),
    )
  }

  const addKanbanColumn = (title: string) => {
    setKanbanColumns((prev) => {
      const id = `col-${Date.now()}`
      const style = KANBAN_COLUMN_STYLES[prev.length % KANBAN_COLUMN_STYLES.length]
      return [...prev, { id, title: title.trim() || 'Nova coluna', ...style }]
    })
  }

  const deleteKanbanColumn = (
    columnId: KanbanColumnId,
    mode: 'move' | 'delete',
    moveTo?: KanbanColumnId,
  ) => {
    setKanbanColumns((prev) => {
      if (prev.length <= 1) {
        toast.error('O Kanban precisa de pelo menos uma coluna.')
        return prev
      }
      const target = prev.find((c) => c.id === columnId)
      if (!target) return prev

      const cardsInColumn = kanbanCards.filter((card) => card.columnId === columnId)
      if (cardsInColumn.length > 0) {
        if (mode === 'move' && moveTo) {
          setKanbanCards((cards) =>
            cards.map((card) =>
              card.columnId === columnId ? { ...card, columnId: moveTo } : card,
            ),
          )
          toast.info(`${cardsInColumn.length} card(s) movido(s) para a coluna destino.`)
        } else {
          setKanbanCards((cards) => cards.filter((card) => card.columnId !== columnId))
          toast.warning(`A coluna tinha ${cardsInColumn.length} card(s) — eles foram excluídos.`)
        }
      }

      return prev.filter((col) => col.id !== columnId)
    })
  }

  // ---------- Fluxos ----------

  const toggleFlow = (flowId: string) => {
    setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, isActive: !f.isActive } : f)))
  }

  const addFlowStep = (
    flowId: string,
    step: { type: FlowStep['type']; title: string; content?: string; actionDetail?: string },
  ) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f
        const newStep: FlowStep = {
          id: `step-${Date.now()}`,
          type: step.type,
          title: step.title,
          content: step.content,
          actionDetail: step.actionDetail,
        }
        return { ...f, steps: [...f.steps, newStep], updatedAt: 'Hoje' }
      }),
    )
  }

  const addFlowOption = (flowId: string, stepId: string, optionLabel: string) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f
        return {
          ...f,
          updatedAt: 'Hoje',
          steps: f.steps.map((s) => {
            if (s.id !== stepId) return s
            const newOption: FlowOption = {
              id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              label: optionLabel,
            }
            return { ...s, options: [...(s.options || []), newOption] }
          }),
        }
      }),
    )
  }

  const deleteFlowStep = (flowId: string, stepId: string) => {
    setFlows((prev) =>
      prev.map((f) =>
        f.id === flowId
          ? { ...f, updatedAt: 'Hoje', steps: f.steps.filter((s) => s.id !== stepId) }
          : f,
      ),
    )
  }

  // ---------- Conexão do WhatsApp (pareamento simulado) ----------

  // Gera um novo QR e entra em "aguardando leitura" (~40s de validade).
  const startWhatsappPairing = React.useCallback(() => {
    setWhatsappConnection({ status: 'waiting' })
    setQrPayload(generateQrPayload())
  }, [])

  const refreshWhatsappQr = React.useCallback(() => {
    setQrPayload(generateQrPayload())
  }, [])

  // Simula a leitura do QR pelo celular: aguardando -> conectado após 1,5s.
  const completeWhatsappPairing = React.useCallback(() => {
    setWhatsappConnection((prev) => {
      if (prev.status === 'connected') return prev
      window.setTimeout(() => {
        const now = new Date()
        setWhatsappConnection({
          status: 'connected',
          phone: '+55 11 98765-4321',
          device: 'Chrome (Windows)',
          connectedAt: now.toISOString(),
        })
        toast.success('WhatsApp conectado com sucesso.')
      }, 1500)
      return { status: 'waiting' }
    })
  }, [])

  const disconnectWhatsapp = React.useCallback(() => {
    setWhatsappConnection({ status: 'disconnected' })
    setQrPayload(generateQrPayload())
    toast.info('Sessão do WhatsApp encerrada.')
  }, [])

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        conversations,
        visibleConversations,
        canSeeConversation,
        selectedConversationId,
        setSelectedConversationId,
        sendMessage,
        toggleResolved,
        markAsRead,
        markAsUnread,
        simulateClientReply,
        contacts,
        addContact,
        openOrCreateConversationWithContact,
        internalMessages,
        sendInternalMessage,
        quickReplies,
        addQuickReply,
        updateQuickReply,
        deleteQuickReply,
        automations,
        toggleAutomation,
        addAutomation,
        updateAutomation,
        deleteAutomation,
        businessHours,
        updateBusinessHours,
        updateCurrentUser,
        openConversationIds,
        openConversation,
        closeConversationTab,
        transferConversation,
        transfers,
        users,
        userPermissions,
        updateUserAccess,
        toggleUserBlocked,
        isSuperAdmin,
        kanbanColumns,
        kanbanCards,
        moveKanbanCard,
        addKanbanCard,
        updateKanbanCard,
        deleteKanbanCard,
        renameKanbanColumn,
        addKanbanColumn,
        deleteKanbanColumn,
        flows,
        toggleFlow,
        addFlowStep,
        addFlowOption,
        deleteFlowStep,
        whatsappConnection,
        qrPayload,
        startWhatsappPairing,
        refreshWhatsappQr,
        completeWhatsappPairing,
        disconnectWhatsapp,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider')
  }
  return context
}
