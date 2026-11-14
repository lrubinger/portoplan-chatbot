export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
}

export interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  lastInteraction: string
  tags: string[]
  email?: string
  notes?: string
}

export interface Message {
  id: string
  sender: 'contact' | 'agent' | 'bot'
  senderName?: string
  text: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  contactId: string
  contactName: string
  contactPhone: string
  contactAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isResolved: boolean
  assignedAgent?: string
  tags: string[]
  messages: Message[]
}

export interface InternalMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  timestamp: string
  channelId?: string
}

export interface InternalChannel {
  id: string
  name: string
  description?: string
  isDirect?: boolean
  members: string[] // User IDs or names
}

export interface QuickReply {
  id: string
  title: string
  shortcut: string
  text: string
  category: 'saudacao' | 'informacao' | 'encerramento' | 'geral'
}

export interface Automation {
  id: string
  name: string
  trigger: 'welcome' | 'absence' | 'keyword'
  keyword?: string
  message: string
  isActive: boolean
  description: string
  updatedAt: string
}

export interface BusinessHours {
  enabled: boolean
  weekdaysStart: string
  weekdaysEnd: string
  saturdayEnabled: boolean
  saturdayStart: string
  saturdayEnd: string
  sundayEnabled: boolean
  timezone: string
}

// ---------- Multi-atendimento (transferência) ----------

export interface TransferRecord {
  id: string
  conversationId: string
  fromAgent: string
  toAgent: string
  reason?: string
  timestamp: string
}

// ---------- Kanban ----------

export type KanbanColumnId =
  | 'novo'
  | 'em-atendimento'
  | 'aguardando-documentos'
  | 'proposta-enviada'
  | 'fechado'

export interface KanbanCard {
  id: string
  contactId: string
  contactName: string
  contactAvatar?: string
  phone: string
  summary: string
  interest?: string
  idleTime: string
  idleLevel: 'ok' | 'warning' | 'late'
  dealValue?: string
  tags: string[]
  columnId: KanbanColumnId
}

export interface KanbanColumn {
  id: KanbanColumnId
  title: string
  accent: string
  dot: string
}

// ---------- Atendimento por Fluxo ----------

export type FlowStepType = 'message' | 'question' | 'condition' | 'action'

export type FlowActionKind = 'transfer_agent' | 'tag_contact' | 'end_chat' | 'send_message'

export interface FlowOption {
  id: string
  label: string
  nextStepId?: string
}

export interface FlowStep {
  id: string
  type: FlowStepType
  title: string
  content?: string
  options?: FlowOption[]
  actionKind?: FlowActionKind
  actionDetail?: string
}

export interface Flow {
  id: string
  name: string
  description: string
  triggerLabel: string
  isActive: boolean
  updatedAt: string
  steps: FlowStep[]
}
